/**
 * 日次売上サマリー → Slack 通知スクリプト
 *
 * 毎日 23:59 に cron で実行し、その日の全媒体の売上をまとめてSlackに報告する。
 * brain_sales_notifier.js の状態ファイルから集計する。
 *
 * 使い方:
 *   node --env-file=.env.local scripts/daily_sales_report.js
 *   node --env-file=.env.local scripts/daily_sales_report.js --dry-run
 *
 * cron 設定（毎日 23:59）:
 *   59 23 * * * cd /Users/tokudayuya/ai-net-business-sns-os && node --env-file=.env.local scripts/daily_sales_report.js >> operations/daily_sales_report.log 2>&1
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const STATE_FILE = path.join(__dirname, 'brain_sales_notifier_state.json');

const PLATFORM_LABELS = {
  brain:   { emoji: '🎉', label: 'Brain' },
  note:    { emoji: '📝', label: 'note' },
  rakuten: { emoji: '🛍️', label: '楽天アフィリエイト' },
  a8:      { emoji: '💰', label: 'A8.net' },
  moshimo: { emoji: '💴', label: 'もしもアフィリエイト' },
};

function todayJST() {
  const parts = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const get = (t) => parts.find(p => p.type === t)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

async function sendSlack(text) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) throw new Error('SLACK_WEBHOOK_URL が未設定です');
  return new Promise((resolve, reject) => {
    const parsed = new URL(webhookUrl);
    const body = JSON.stringify({ text });
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve(d));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  if (!process.env.SLACK_WEBHOOK_URL) {
    console.error('❌ SLACK_WEBHOOK_URL が .env.local に未設定です。');
    process.exit(1);
  }

  const today = todayJST();
  console.log(`[${new Date().toISOString()}] 日次売上レポート生成 (${today})`);

  // 状態ファイル読み込み
  let state = { daily_sales: {} };
  if (fs.existsSync(STATE_FILE)) {
    try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch {}
  }

  const todaySales = state.daily_sales?.[today] || {};

  // 集計
  let totalCount = 0;
  let totalAmount = 0;
  const lines = [];

  for (const [key, info] of Object.entries(PLATFORM_LABELS)) {
    const s = todaySales[key];
    if (s && s.count > 0) {
      totalCount += s.count;
      totalAmount += s.amount || 0;
      const amountStr = s.amount > 0 ? `¥${s.amount.toLocaleString()}` : '金額集計中';
      lines.push(`  ${info.emoji} ${info.label}: ${s.count}件 ${amountStr}`);
    }
  }

  let slackText;
  if (totalCount === 0) {
    slackText =
      `📊 *${today} 日次売上レポート*\n` +
      `本日の売上・成果: なし\n` +
      `─────────────────\n` +
      `引き続き投稿・更新を継続中。明日も頑張ろう！💪`;
  } else {
    slackText =
      `📊 *${today} 日次売上レポート*\n` +
      `─────────────────\n` +
      lines.join('\n') + '\n' +
      `─────────────────\n` +
      `🏆 *合計: ${totalCount}件 / ¥${totalAmount.toLocaleString()}*\n` +
      `（金額集計中のプラットフォームは各ダッシュボードを確認）`;
  }

  if (dryRun) {
    console.log('[dry-run] Slack 送信予定:');
    console.log(slackText);
  } else {
    await sendSlack(slackText);
    console.log('✅ 日次レポート送信完了');
  }
}

main().catch((e) => {
  console.error('❌ エラー:', e.message);
  process.exit(1);
});
