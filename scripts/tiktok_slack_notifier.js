/**
 * TikTok手動投稿用 Slack通知スクリプト
 *
 * 使い方:
 *   node --env-file=.env.local scripts/tiktok_slack_notifier.js
 *
 * 必要な .env.local 設定:
 *   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
 *
 * tiktok_queue.json から status=pending の最初の1件をSlackに通知し、
 * status を slack_sent に更新する。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');
const QUEUE_PATH = path.join(REPO_ROOT, 'products', 'revenue-intelligence-os', 'data', 'tiktok_queue.json');

function loadQueue() {
  return JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf-8'));
}

function saveQueue(rows) {
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(rows, null, 2) + '\n');
}

function buildSlackMessage(item) {
  const affiliateSection = item.affiliate && item.affiliate.length > 0
    ? item.affiliate.map((a) => `📎 ${a}`).join('\n')
    : '（アフィリリンクなし）';

  const wpSection = item.wp_url
    ? `🌐 記事URL: ${item.wp_url}`
    : '（記事URL未確認）';

  return {
    text: `🎬 *TikTok投稿キット: ${item.video_id}*`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🎬 TikTok投稿キット: ${item.video_id}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*📁 動画ファイル（ローカルパス）*\n\`${item.file_path}\``,
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*📝 キャプション（そのままコピペ）*\n\`\`\`${item.caption}\`\`\``,
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*💰 アフィリリンク*\n${affiliateSection}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: wpSection,
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🖼️ Codex（ChatGPT）サムネ生成プロンプト*\n\`\`\`${item.thumbnail_prompt}\`\`\``,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `📌 投稿後は tiktok_queue.json の ${item.video_id} を \`status: "posted"\` に更新してください`,
          },
        ],
      },
    ],
  };
}

function sendToSlack(webhookUrl, payload) {
  const body = JSON.stringify(payload);
  const output = execFileSync(
    'curl',
    [
      '-s', '--max-time', '30',
      '-X', 'POST',
      webhookUrl,
      '-H', 'Content-Type: application/json',
      '-d', body,
    ],
    { encoding: 'utf-8' }
  );
  if (output.trim() !== 'ok') {
    throw new Error(`Slack APIエラー: ${output}`);
  }
}

async function main() {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('SLACK_WEBHOOK_URL が .env.local に設定されていません');
  }

  const rows = loadQueue();
  const pending = rows.filter((r) => r.status === 'pending');

  if (pending.length === 0) {
    console.log('TikTokキューにpendingのアイテムがありません。全件送信済み or 投稿済みです。');
    return;
  }

  const item = pending[0];
  console.log(`=== TikTok Slack通知: ${item.video_id} ===`);

  const payload = buildSlackMessage(item);
  sendToSlack(webhookUrl, payload);
  console.log(`✅ Slack通知送信完了: ${item.video_id}`);

  const now = new Date().toISOString();
  const updatedRows = rows.map((r) => {
    if (r.video_id === item.video_id) {
      return { ...r, status: 'slack_sent', sent_at: now };
    }
    return r;
  });
  saveQueue(updatedRows);
  console.log(`   キュー更新: ${item.video_id} → slack_sent`);
  console.log(`   残り未送信: ${pending.length - 1}件`);
}

main().catch((err) => {
  console.error('❌ 通知失敗:', err.message || err);
  process.exit(1);
});
