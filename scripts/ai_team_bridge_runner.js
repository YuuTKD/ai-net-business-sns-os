/**
 * AI TEAM BRIDGE Runner — Claude Code ⇄ Codex Slack連携の中核
 *
 * 役割:
 *   - #ai-team-bridge から [INSTRUCTION] を取得
 *   - TASK_ID で重複実行を防止（processed_ts を状態ファイルに記録）
 *   - Codexへタスクを渡す（Slack投稿。Codexが読んで作業）
 *   - [RESULT] を検出してClaude Code側へ返す
 *   - 成果物ファイル or URL を添付
 *   - AI往復は 1タスク最大4回（無限ループ防止）
 *
 * 使い方:
 *   # 未処理の[INSTRUCTION]を一覧（副作用なし）
 *   node --env-file=.env.local scripts/ai_team_bridge_runner.js --list
 *
 *   # [INSTRUCTION]を1件処理（Codexへ渡し、往復カウント+1、processed記録）
 *   node --env-file=.env.local scripts/ai_team_bridge_runner.js --poll
 *
 *   # 指示を送る（Claude Code → Codex）
 *   node --env-file=.env.local scripts/ai_team_bridge_runner.js \
 *     --send-instruction --task REEL-002 --channel strategy \
 *     --text "サムネ案を3つ出して" [--file path/to/artifact.png]
 *
 *   # 議論を投げる
 *   node --env-file=.env.local scripts/ai_team_bridge_runner.js \
 *     --discuss --channel strategy --text "REEL-002の訴求軸について意見ください"
 *
 *   # 承認待ちを上げる
 *   node --env-file=.env.local scripts/ai_team_bridge_runner.js \
 *     --approval --task REEL-002 --text "最終案。公開してよいか判断ください"
 *
 * 必要な .env.local 設定（値は会話・ログに出さない）:
 *   SLACK_BOT_TOKEN=xoxb-...   （scope: channels:read, channels:history, chat:write, files:write）
 *
 * 状態ファイル: scripts/ai_team_bridge_state.json（gitignore対象、Secretは含まない）
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(__dirname, 'ai_team_bridge_config.json');
const STATE_PATH = path.join(__dirname, 'ai_team_bridge_state.json');

const CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

const VALID_TAGS = CONFIG.tags;
const MAX_ROUNDTRIPS = CONFIG.limits.maxRoundTripsPerTask;
const HISTORY_LIMIT = CONFIG.limits.historyFetchLimit;

// --- Secret/個人情報ガード（Slackへ絶対に出さない） ---------------------------
const SECRET_PATTERNS = [
  /xox[baprs]-[A-Za-z0-9-]+/,            // Slack token
  /sk-[A-Za-z0-9]{20,}/,                 // OpenAI系
  /AIza[0-9A-Za-z_-]{20,}/,              // Google API key
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,  // 秘密鍵
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // メールアドレス（個人情報）
];

function assertNoSecret(text) {
  for (const re of SECRET_PATTERNS) {
    if (re.test(text)) {
      throw new Error('❌ Secret/個人情報とおぼしき文字列を検出。Slack投稿を中止しました。');
    }
  }
}

// --- 状態ファイル -------------------------------------------------------------
function loadState() {
  if (!fs.existsSync(STATE_PATH)) {
    return { processedTs: {}, roundTrips: {}, lastPolledAt: null };
  }
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
}

// --- Slack API（Bot Token, curl経由） -----------------------------------------
function slackGet(method, params) {
  if (!BOT_TOKEN) throw new Error('SLACK_BOT_TOKEN が .env.local に設定されていません');
  const qs = new URLSearchParams(params).toString();
  const url = `https://slack.com/api/${method}?${qs}`;
  const out = execFileSync('curl', ['-s', '--max-time', '30', url,
    '-H', `Authorization: Bearer ${BOT_TOKEN}`], { encoding: 'utf-8' });
  const json = JSON.parse(out);
  if (!json.ok) throw new Error(`Slack API(${method}) エラー: ${json.error}`);
  return json;
}

function slackPost(method, payload) {
  if (!BOT_TOKEN) throw new Error('SLACK_BOT_TOKEN が .env.local に設定されていません');
  const url = `https://slack.com/api/${method}`;
  const out = execFileSync('curl', ['-s', '--max-time', '30', '-X', 'POST', url,
    '-H', `Authorization: Bearer ${BOT_TOKEN}`,
    '-H', 'Content-Type: application/json; charset=utf-8',
    '-d', JSON.stringify(payload)], { encoding: 'utf-8' });
  const json = JSON.parse(out);
  if (!json.ok) throw new Error(`Slack API(${method}) エラー: ${json.error}`);
  return json;
}

function resolveChannel(key) {
  const id = CONFIG.channels[key];
  if (!id) throw new Error(`未知のチャンネルキー: ${key}（bridge/strategy/approvals）`);
  return id;
}

function postMessage(channelKey, text) {
  assertNoSecret(text);
  return slackPost('chat.postMessage', { channel: resolveChannel(channelKey), text });
}

// ファイル添付（files:write。Slack外部URLでも代替可）
function uploadFile(channelKey, filePath, initialComment) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(REPO_ROOT, filePath);
  if (!fs.existsSync(abs)) throw new Error(`添付ファイルが見つかりません: ${abs}`);
  const size = fs.statSync(abs).size;
  const name = path.basename(abs);
  // Step1: アップロードURL取得
  const up = slackGet('files.getUploadURLExternal', { filename: name, length: String(size) });
  // Step2: バイナリをPUT
  execFileSync('curl', ['-s', '--max-time', '120', '-X', 'POST', up.upload_url,
    '--data-binary', `@${abs}`], { encoding: 'utf-8' });
  // Step3: 完了通知＋チャンネル共有
  return slackPost('files.completeUploadExternal', {
    files: [{ id: up.file_id, title: name }],
    channel_id: resolveChannel(channelKey),
    initial_comment: initialComment || '',
  });
}

// --- メッセージ解析 -----------------------------------------------------------
function parseTag(text) {
  if (!text) return null;
  const m = text.match(/^\[([A-Z_]+)\]/);
  if (!m || !VALID_TAGS.includes(m[1])) return null;
  return m[1];
}

function parseTaskId(text) {
  // 例: "[INSTRUCTION] *REEL-002* — thumbnail" / "[RESULT] REEL-002:"
  const m = text.match(/\[[A-Z_]+\]\s*\*?([A-Za-z0-9-]+)\*?\s*[—:\-]/);
  return m ? m[1].trim() : '';
}

function fetchHistory(channelKey) {
  const json = slackGet('conversations.history', {
    channel: resolveChannel(channelKey),
    limit: String(HISTORY_LIMIT),
  });
  return (json.messages || []).map((m) => ({
    ts: m.ts,
    text: m.text || '',
    tag: parseTag(m.text || ''),
    taskId: parseTaskId(m.text || ''),
    user: m.user || m.bot_id || '',
  }));
}

// --- コマンド: 未処理[INSTRUCTION]一覧 ----------------------------------------
function listInstructions() {
  const state = loadState();
  const msgs = fetchHistory('bridge')
    .filter((m) => m.tag === 'INSTRUCTION')
    .filter((m) => !state.processedTs[m.ts]);
  return msgs;
}

// --- コマンド: [INSTRUCTION]を1件処理 -----------------------------------------
function poll() {
  const state = loadState();
  const pending = listInstructions();
  if (pending.length === 0) {
    console.log(JSON.stringify({ processed: false, reason: '未処理の[INSTRUCTION]なし' }));
    return;
  }
  // 古い順に1件
  const item = pending.sort((a, b) => Number(a.ts) - Number(b.ts))[0];
  const taskId = item.taskId || `UNKNOWN-${item.ts}`;

  const trips = state.roundTrips[taskId] || 0;
  if (trips >= MAX_ROUNDTRIPS) {
    // 上限到達 → 承認チャンネルへエスカレーション
    postMessage('approvals',
      `[APPROVAL_REQUIRED] ${taskId}: AI往復が上限${MAX_ROUNDTRIPS}回に達しました。` +
      `合意に至っていないため、ゆうさんの判断をお願いします。`);
    state.processedTs[item.ts] = { taskId, at: nowIso(), action: 'escalated_maxtrips' };
    saveState(state);
    console.log(JSON.stringify({ processed: true, taskId, action: 'escalated_maxtrips', trips }));
    return;
  }

  // Codexへ受け渡し（bridgeチャンネルに明示。Codexが読んで作業）
  postMessage('bridge',
    `[DISCUSSION] ${taskId}: Codexへ引き継ぎます。上記[INSTRUCTION]に沿って作業し、` +
    `完了したら \`[RESULT] ${taskId}:\` で報告してください（往復 ${trips + 1}/${MAX_ROUNDTRIPS}）。`);

  state.roundTrips[taskId] = trips + 1;
  state.processedTs[item.ts] = { taskId, at: nowIso(), action: 'handed_to_codex' };
  state.lastPolledAt = nowIso();
  saveState(state);
  console.log(JSON.stringify({ processed: true, taskId, action: 'handed_to_codex', trips: trips + 1 }));
}

// --- コマンド: Codexの[RESULT]を回収 ------------------------------------------
function collectResults(filterTaskId) {
  const results = fetchHistory('bridge')
    .filter((m) => m.tag === 'RESULT')
    .filter((m) => !filterTaskId || m.taskId === filterTaskId);
  console.log(JSON.stringify({ count: results.length, results }, null, 2));
  return results;
}

function nowIso() {
  // Date.now非依存: 状態記録用にシステムのdateを使う（テスト再現性は不要）
  return execFileSync('date', ['-u', '+%Y-%m-%dT%H:%M:%SZ'], { encoding: 'utf-8' }).trim();
}

// --- CLI ----------------------------------------------------------------------
function getArg(args, flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : '';
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list')) {
    const items = listInstructions();
    console.log(JSON.stringify({ pending: items.length, items }, null, 2));
    return;
  }

  if (args.includes('--poll')) {
    poll();
    return;
  }

  if (args.includes('--collect')) {
    collectResults(getArg(args, '--task'));
    return;
  }

  if (args.includes('--send-instruction')) {
    const taskId = getArg(args, '--task');
    const channel = getArg(args, '--channel') || 'bridge';
    const text = getArg(args, '--text');
    const file = getArg(args, '--file');
    if (!taskId || !text) throw new Error('--task と --text は必須です');
    const body = `[INSTRUCTION] *${taskId}* — task\n\`\`\`\n${text}\n\`\`\`\n` +
      `✅ 完了したら \`[RESULT] ${taskId}:\` から報告してください`;
    postMessage(channel, body);
    if (file) uploadFile(channel, file, `[INSTRUCTION] ${taskId} の参考資料`);
    console.log(JSON.stringify({ sent: true, taskId, channel, file: file || null }));
    return;
  }

  if (args.includes('--discuss')) {
    const channel = getArg(args, '--channel') || 'strategy';
    const text = getArg(args, '--text');
    if (!text) throw new Error('--text は必須です');
    postMessage(channel, `[DISCUSSION] ${text}`);
    console.log(JSON.stringify({ sent: true, channel, tag: 'DISCUSSION' }));
    return;
  }

  if (args.includes('--review')) {
    const channel = getArg(args, '--channel') || 'strategy';
    const taskId = getArg(args, '--task');
    const text = getArg(args, '--text');
    if (!text) throw new Error('--text は必須です');
    postMessage(channel, `[REVIEW] ${taskId ? taskId + ': ' : ''}${text}`);
    console.log(JSON.stringify({ sent: true, channel, tag: 'REVIEW', taskId }));
    return;
  }

  if (args.includes('--risk')) {
    const channel = getArg(args, '--channel') || 'strategy';
    const taskId = getArg(args, '--task');
    const text = getArg(args, '--text');
    if (!text) throw new Error('--text は必須です');
    postMessage(channel, `[RISK] ${taskId ? taskId + ': ' : ''}${text}`);
    console.log(JSON.stringify({ sent: true, channel, tag: 'RISK', taskId }));
    return;
  }

  if (args.includes('--approval')) {
    const taskId = getArg(args, '--task');
    const text = getArg(args, '--text');
    const file = getArg(args, '--file');
    if (!text) throw new Error('--text は必須です');
    postMessage('approvals', `[APPROVAL_REQUIRED] ${taskId ? taskId + ': ' : ''}${text}`);
    if (file) uploadFile('approvals', file, `[APPROVAL_REQUIRED] ${taskId} 最終案`);
    console.log(JSON.stringify({ sent: true, channel: 'approvals', tag: 'APPROVAL_REQUIRED', taskId, file: file || null }));
    return;
  }

  if (args.includes('--result')) {
    const channel = getArg(args, '--channel') || 'bridge';
    const taskId = getArg(args, '--task');
    const text = getArg(args, '--text');
    const file = getArg(args, '--file');
    if (!taskId || !text) throw new Error('--task と --text は必須です');
    postMessage(channel, `[RESULT] ${taskId}: ${text}`);
    if (file) uploadFile(channel, file, `[RESULT] ${taskId} 成果物`);
    console.log(JSON.stringify({ sent: true, channel, tag: 'RESULT', taskId, file: file || null }));
    return;
  }

  console.log([
    'AI TEAM BRIDGE Runner',
    '  --list                             未処理の[INSTRUCTION]を一覧',
    '  --poll                             [INSTRUCTION]を1件処理（往復+1, processed記録）',
    '  --collect [--task ID]              [RESULT]を回収',
    '  --send-instruction --task ID --text "..." [--channel ..] [--file ..]',
    '  --discuss --text "..." [--channel ..]',
    '  --review  --text "..." [--task ID] [--channel ..]',
    '  --risk    --text "..." [--task ID] [--channel ..]',
    '  --approval --text "..." [--task ID] [--file ..]',
    '  --result  --task ID --text "..." [--channel ..] [--file ..]',
  ].join('\n'));
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
}

module.exports = {
  listInstructions, poll, collectResults, postMessage, uploadFile,
  parseTag, parseTaskId, assertNoSecret, fetchHistory,
};
