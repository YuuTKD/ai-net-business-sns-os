#!/usr/bin/env node
/**
 * Codexへの緊急依頼スクリプト
 *
 * 使い方:
 *   node scripts/alert_codex.js "依頼内容をここに書く"
 *
 * 何をするか:
 *   1. ~/.ai-team/ai-net-business-sns-os/INBOX_CODEX/URGENT_<timestamp>.md を作成
 *   2. codex_wakeup.sh を即時実行してCodexをプッシュ起動する（ポーリング不要）
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const STATE_DIR = path.join(process.env.HOME, '.ai-team', 'ai-net-business-sns-os');
const INBOX_DIR = path.join(STATE_DIR, 'INBOX_CODEX');

function writeInbox(message, ts) {
  fs.mkdirSync(INBOX_DIR, { recursive: true });
  const filename = `URGENT_${ts}.md`;
  const filepath = path.join(INBOX_DIR, filename);
  const content = [
    `# 🚨 URGENT from CLAUDE / ゆうさん`,
    `送信日時: ${new Date().toISOString()}`,
    ``,
    `## 依頼内容`,
    message,
    ``,
    `## 対応指示`,
    `- このファイルを確認したら \`ARCHIVED/\` ディレクトリへ移動してください`,
    `- 対応完了後に MESSAGES.md と TASK_BOARD.md を更新してください`,
  ].join('\n');
  fs.writeFileSync(filepath, content, 'utf-8');
  return filepath;
}

async function main() {
  const message = process.argv[2];
  if (!message) {
    console.error('使い方: node scripts/alert_codex.js "依頼内容"');
    process.exit(1);
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-');

  // 1. INBOX_CODEX に書き込む
  const inboxPath = writeInbox(message, ts);
  console.log(`✅ INBOX書き込み完了: ${inboxPath}`);

  // 2. codex_wakeup.sh をバックグラウンドで即時起動（プッシュ型）
  const wakeupScript = path.join(__dirname, 'codex_wakeup.sh');
  const child = spawn('bash', [wakeupScript], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env },
  });
  child.unref();
  console.log('🚀 Codex を即時起動しました（codex_wakeup.sh）');
}

main().catch(err => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
