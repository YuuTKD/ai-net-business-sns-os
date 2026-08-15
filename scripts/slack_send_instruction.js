/**
 * Claude Code → Slack #ai-team-bridge 指示送信スクリプト
 *
 * 使い方（直接実行）:
 *   node --env-file=.env.local scripts/slack_send_instruction.js \
 *     --task "REEL-011" \
 *     --type "thumbnail" \
 *     --prompt "Vertical 9:16 TikTok cover..."
 *
 * 他スクリプトからrequireして使う場合:
 *   const { sendInstruction, sendResult } = require('./slack_send_instruction');
 *   await sendInstruction({ taskId, type, prompt, context });
 *
 * 必要な .env.local 設定:
 *   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
 *   SLACK_AI_BRIDGE_CHANNEL_ID=C0BQHSGHVLH
 */

'use strict';

const { execFileSync } = require('child_process');

const CHANNEL_ID = process.env.SLACK_AI_BRIDGE_CHANNEL_ID || 'C0BQHSGHVLH';
const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

/**
 * Codexへの指示をSlackに投稿する
 * @param {object} opts
 * @param {string} opts.taskId  - タスクID (例: "REEL-011")
 * @param {string} opts.type    - 指示種別 ("thumbnail" | "caption" | "article" | "custom")
 * @param {string} opts.prompt  - メインの指示文（Codexがそのまま使う）
 * @param {string} [opts.context] - 補足情報
 * @param {string} [opts.deadline] - 期限（任意）
 */
function sendInstruction({ taskId, type, prompt, context = '', deadline = '' }) {
  if (!WEBHOOK_URL) throw new Error('SLACK_WEBHOOK_URL が .env.local に設定されていません');

  const deadlineLine = deadline ? `\n⏰ 期限: ${deadline}` : '';
  const contextLine = context ? `\n📋 補足: ${context}` : '';

  const text = [
    `[INSTRUCTION] *${taskId}* — ${type}${deadlineLine}`,
    contextLine,
    '```',
    prompt,
    '```',
    '\n✅ 完了したら `[RESULT] ' + taskId + ':` から始めてここに報告してください',
  ].join('\n');

  const body = JSON.stringify({ text });
  const output = execFileSync(
    'curl',
    ['-s', '--max-time', '30', '-X', 'POST', WEBHOOK_URL,
      '-H', 'Content-Type: application/json', '-d', body],
    { encoding: 'utf-8' }
  );
  if (output.trim() !== 'ok') throw new Error(`Slack APIエラー: ${output}`);
  console.log(`✅ 指示送信完了: ${taskId} (${type})`);
}

/**
 * 完了報告をSlackに投稿する（Codex側が使うコードと同じ形式）
 */
function sendResult({ taskId, summary, data = '', error = '' }) {
  if (!WEBHOOK_URL) throw new Error('SLACK_WEBHOOK_URL が .env.local に設定されていません');

  const status = error ? '❌ 失敗' : '✅ 完了';
  const detail = error || data;
  const text = `[RESULT] *${taskId}*: ${status}\n${summary}${detail ? '\n```\n' + detail + '\n```' : ''}`;

  const body = JSON.stringify({ text });
  const output = execFileSync(
    'curl',
    ['-s', '--max-time', '30', '-X', 'POST', WEBHOOK_URL,
      '-H', 'Content-Type: application/json', '-d', body],
    { encoding: 'utf-8' }
  );
  if (output.trim() !== 'ok') throw new Error(`Slack APIエラー: ${output}`);
}

module.exports = { sendInstruction, sendResult };

// CLIから直接呼ばれた場合
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

  const args = process.argv.slice(2);
  const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : ''; };

  const taskId = get('--task') || 'TEST-001';
  const type = get('--type') || 'custom';
  const prompt = get('--prompt') || 'テスト指示';
  const context = get('--context') || '';

  try {
    sendInstruction({ taskId, type, prompt, context });
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
}
