/**
 * Codex Bridge Worker — Codex(ローカルCLI)を AI TEAM BRIDGE に完全自動接続する
 *
 * 動作:
 *   1. #ai-team-bridge の未処理[INSTRUCTION]を取得
 *   2. Codexルール(役割・タグ・安全装置)+指示本文を組み立て、`codex exec`で実行
 *   3. Codexの返答を [RESULT] として #ai-team-bridge に自動投稿
 *   4. processed_ts / roundTrips を状態ファイルに記録（重複防止・往復上限4回）
 *
 * これを cron で回すと、Claude Code ⇄ Codex が人手ゼロで往復する。
 *
 * 使い方:
 *   node --env-file=.env.local scripts/codex_bridge_worker.js            # 未処理を全件処理
 *   node --env-file=.env.local scripts/codex_bridge_worker.js --once     # 最古の1件だけ処理
 *   node --env-file=.env.local scripts/codex_bridge_worker.js --dry-run  # Codexを叩かず対象だけ表示
 *
 * 前提:
 *   - `codex` CLI がインストール済み & ログイン済み（codex login status で確認）
 *   - .env.local に SLACK_BOT_TOKEN（Botが3チャンネルに参加済み）
 *
 * 安全装置:
 *   - codex は read-only サンドボックスで実行（ファイル破壊・本番操作をさせない）
 *   - 往復が上限(4回)に達したタスクは #ai-team-approvals へエスカレーションしてスキップ
 *   - Codex出力に Secret/個人情報が混じっていれば投稿を中止（runnerのassertNoSecret）
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const runner = require('./ai_team_bridge_runner');
const CONFIG = require('./ai_team_bridge_config.json');

const REPO_ROOT = path.join(__dirname, '..');
const MAX_ROUNDTRIPS = CONFIG.limits.maxRoundTripsPerTask;

// Codexに毎回渡す役割・ルール（オンボーディングの要約）
const CODEX_SYSTEM_PREFIX = [
  'あなたは「Codex」。ai-net-business-sns-os プロジェクトで Claude Code と協働するAIパートナーです。',
  '役割: あなた=企画・制作・レビュー・リスクチェック / Claude Code=実装・運用。',
  '厳守: (1)Secret/APIキー/トークン/個人情報は絶対に出力しない (2)本番投稿・課金・削除・権限変更は提案までにとどめ実行しない',
  '(3)誇大表現や断定(「絶対」「必ず」等)を避けコンプラを意識する (4)日本語・簡潔・具体的に。',
  '以下の[INSTRUCTION]に対する成果物のみを返答してください（前置き不要）。',
  '',
].join('\n');

function log(msg) {
  const ts = execFileSync('date', ['+%H:%M:%S'], { encoding: 'utf-8' }).trim();
  console.log(`[${ts}] ${msg}`);
}

/**
 * codex exec を非対話・read-onlyで実行し、最終メッセージを返す
 * @param {string} prompt
 * @returns {string} Codexの最終応答テキスト
 */
function runCodex(prompt) {
  const outFile = path.join(os.tmpdir(), `codex_bridge_out_${process.pid}.txt`);
  try {
    execFileSync('codex', [
      'exec',
      '-s', 'read-only',
      '--skip-git-repo-check',
      '-C', REPO_ROOT,
      '-o', outFile,
      prompt,
    ], { encoding: 'utf-8', stdio: ['ignore', 'ignore', 'ignore'], maxBuffer: 1024 * 1024 * 32 });
    const out = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf-8').trim() : '';
    return out;
  } finally {
    if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
  }
}

/**
 * 1件の[INSTRUCTION]を処理する
 * @param {object} item - { ts, text, taskId }
 * @param {object} state
 * @returns {string} 処理結果の説明
 */
function processInstruction(item, state) {
  const taskId = item.taskId || `UNKNOWN-${item.ts}`;
  const trips = state.roundTrips[taskId] || 0;

  // 往復上限チェック
  if (trips >= MAX_ROUNDTRIPS) {
    runner.postMessage('approvals',
      `[APPROVAL_REQUIRED] ${taskId}: AI往復が上限${MAX_ROUNDTRIPS}回に達しました。` +
      `合意に至っていないため、ゆうさんの判断をお願いします。`);
    state.processedTs[item.ts] = { taskId, at: runner.nowIso(), action: 'escalated_maxtrips' };
    runner.saveState(state);
    return `${taskId}: 上限到達→承認へエスカレーション`;
  }

  // Codexへ渡すプロンプト（ルール + 指示本文）
  const prompt = `${CODEX_SYSTEM_PREFIX}\n${item.text}`;
  log(`${taskId}: codex実行中…（往復 ${trips + 1}/${MAX_ROUNDTRIPS}）`);

  let answer = '';
  try {
    answer = runCodex(prompt);
  } catch (e) {
    // Codex実行失敗 → RESULTで失敗を報告（processedにはしない＝次回リトライ可）
    runner.postMessage('bridge', `[RESULT] ${taskId}: ❌ Codex実行に失敗しました（${e.message}）`);
    return `${taskId}: codex実行失敗（次回リトライ）`;
  }

  if (!answer) {
    runner.postMessage('bridge', `[RESULT] ${taskId}: ⚠️ Codexから応答が得られませんでした`);
  } else {
    // Codexの応答を [RESULT] として投稿（assertNoSecretはpostMessage内で実施）
    const body = `[RESULT] ${taskId}: ✅ Codex（ローカルCLI・自動）\n${answer}`;
    runner.postMessage('bridge', body);
  }

  // 記録（重複防止 + 往復+1）
  state.roundTrips[taskId] = trips + 1;
  state.processedTs[item.ts] = { taskId, at: runner.nowIso(), action: 'codex_answered' };
  state.lastPolledAt = runner.nowIso();
  runner.saveState(state);
  return `${taskId}: 完了→[RESULT]投稿（往復 ${trips + 1}）`;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const once = args.includes('--once');

  const state = runner.loadState();
  let pending = runner.listInstructions();
  pending.sort((a, b) => Number(a.ts) - Number(b.ts));
  if (once) pending = pending.slice(0, 1);

  if (pending.length === 0) {
    log('未処理の[INSTRUCTION]なし');
    return;
  }
  log(`未処理[INSTRUCTION] ${pending.length}件を処理します`);

  if (dryRun) {
    for (const item of pending) {
      console.log(`  - ${item.taskId || '(no id)'} @ ${item.ts}: ${item.text.slice(0, 60).replace(/\n/g, ' ')}…`);
    }
    log('（--dry-run のためCodexは実行しませんでした）');
    return;
  }

  for (const item of pending) {
    const result = processInstruction(item, state);
    log(result);
  }
  log('全件処理完了');
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
}

module.exports = { runCodex, processInstruction };
