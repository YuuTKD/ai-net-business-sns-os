/**
 * Slack #ai-team-bridge からCodexの完了報告を読み取るスクリプト
 *
 * 使い方:
 *   node --env-file=.env.local scripts/slack_read_results.js [--task REEL-011]
 *
 * 必要な .env.local 設定:
 *   SLACK_BOT_TOKEN=xoxb-...   （Slack Bot Token — Incoming Webhookとは別）
 *   SLACK_AI_BRIDGE_CHANNEL_ID=C0BQHSGHVLH
 *
 * 返り値（stdout JSON）:
 *   { found: true, taskId, summary, data, ts } | { found: false }
 */

'use strict';

const { execFileSync } = require('child_process');

const CHANNEL_ID = process.env.SLACK_AI_BRIDGE_CHANNEL_ID || 'C0BQHSGHVLH';
const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

/**
 * チャンネルから直近100件を取得し [RESULT] メッセージを返す
 * @param {string} [filterTaskId] - 特定タスクIDのみ返す場合
 */
function readResults(filterTaskId = '') {
  if (!BOT_TOKEN) throw new Error('SLACK_BOT_TOKEN が .env.local に設定されていません');

  const url = `https://slack.com/api/conversations.history?channel=${CHANNEL_ID}&limit=100`;
  const output = execFileSync(
    'curl',
    ['-s', '--max-time', '30', url,
      '-H', `Authorization: Bearer ${BOT_TOKEN}`],
    { encoding: 'utf-8' }
  );
  const json = JSON.parse(output);
  if (!json.ok) throw new Error(`Slack API エラー: ${json.error}`);

  const results = (json.messages || [])
    .filter((m) => m.text && m.text.startsWith('[RESULT]'))
    .map((m) => {
      const match = m.text.match(/\[RESULT\]\s*\*?([^*:]+)\*?:/);
      const taskId = match ? match[1].trim() : '';
      return { taskId, text: m.text, ts: m.ts };
    });

  if (filterTaskId) {
    return results.filter((r) => r.taskId === filterTaskId);
  }
  return results;
}

module.exports = { readResults };

if (require.main === module) {
  const taskArg = process.argv.find((a) => a.startsWith('--task='))?.split('=')[1]
    || (process.argv.indexOf('--task') !== -1 ? process.argv[process.argv.indexOf('--task') + 1] : '');

  try {
    const results = readResults(taskArg);
    if (results.length === 0) {
      console.log(JSON.stringify({ found: false, message: taskArg ? `${taskArg} の完了報告はまだありません` : '報告なし' }));
    } else {
      console.log(JSON.stringify({ found: true, count: results.length, results }));
    }
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
}
