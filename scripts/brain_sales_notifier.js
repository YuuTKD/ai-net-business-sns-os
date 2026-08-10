/**
 * 売上通知 → Slack リアルタイム通知スクリプト
 *
 * 対応プラットフォーム:
 *   Brain / note / 楽天アフィリエイト（ROOM含む）/ A8.net / もしもアフィリエイト
 *
 * 仕組み:
 *   Gmail IMAP（アプリパスワード方式）で各プラットフォームの購入/成果通知メールを検知し
 *   Slack に即通知する。Google Cloud Console 不要。
 *
 * 必要な環境変数（.env.local）:
 *   SLACK_WEBHOOK_URL    - 既存（threads_queue_runner.js と共有）
 *   GMAIL_EMAIL          - yuya_tokuda@trees-catering.com
 *   GMAIL_APP_PASSWORD   - Googleアカウントで発行した16桁のアプリパスワード
 *
 * 使い方:
 *   node --env-file=.env.local scripts/brain_sales_notifier.js --check
 *   node --env-file=.env.local scripts/brain_sales_notifier.js --check --dry-run
 *
 * cron 設定（10分ごと）:
 *   * /10 * * * * cd /Users/tokudayuya/ai-net-business-sns-os && node --env-file=.env.local scripts/brain_sales_notifier.js --check >> operations/brain_sales_notifier.log 2>&1
 *
 * 状態ファイル: scripts/brain_sales_notifier_state.json
 *
 * ⚠️ メールパターン未確認のプラットフォームについて:
 *   楽天アフィリエイト / A8.net のメールパターンは初回成果発生時に実メールで確認し
 *   PLATFORMS 定数の from / subjectKeyword を必要に応じて修正すること。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { ImapFlow } = require('imapflow');

const STATE_FILE = path.join(__dirname, 'brain_sales_notifier_state.json');

// プラットフォーム別の通知メール設定
// subjectKeyword に一致する件名 + from に一致する送信者の未読メールを検知する
const PLATFORMS = [
  {
    key: 'brain',
    label: 'Brain',
    emoji: '🎉',
    from: 'info@brain-market.com',
    subjectKeyword: '購入されました',
    dashboardUrl: 'https://brain-market.com/sales/sales_history',
    parseProduct: (subject) => {
      const m = subject.match(/「(.+?)」が購入されました/);
      return m ? m[1] : subject;
    },
  },
  {
    key: 'note',
    label: 'note',
    emoji: '📝',
    from: 'noreply@note.com',
    // ⚠️ 実際の件名は初回売上発生時に確認して更新すること
    subjectKeyword: '購入されました',
    dashboardUrl: 'https://note.com/dashboard',
    parseProduct: (subject) => {
      const m = subject.match(/「(.+?)」/);
      return m ? m[1] : subject;
    },
  },
  {
    key: 'rakuten',
    label: '楽天アフィリエイト（ROOM含む）',
    emoji: '🛍️',
    // ⚠️ 実際の送信元は初回成果発生時に確認して更新すること
    from: 'affiliate@mail.rakuten.com',
    subjectKeyword: '成果発生',
    dashboardUrl: 'https://affiliate.rakuten.co.jp/report/',
    parseProduct: (subject) => subject,
  },
  {
    key: 'a8',
    label: 'A8.net',
    emoji: '💰',
    // ⚠️ 実際の送信元は初回成果発生時に確認して更新すること
    from: 'report@a8.net',
    subjectKeyword: '成果',
    dashboardUrl: 'https://pub.a8.net/a8v2/asTransactionList.as',
    parseProduct: (subject) => subject,
  },
  {
    key: 'moshimo',
    label: 'もしもアフィリエイト',
    emoji: '💴',
    // ⚠️ 成果通知メールの送信元は登録確認済みアドレスと異なる可能性あり。初回成果時に確認。
    from: 'info@moshimo.com',
    subjectKeyword: '成果確定',
    dashboardUrl: 'https://af.moshimo.com/af/result/transaction_list',
    parseProduct: (subject) => subject,
  },
];

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return { notified_uids: {} };
  const s = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  // 旧形式（配列）から新形式（オブジェクト）への移行
  if (Array.isArray(s.notified_uids)) {
    return { notified_uids: { brain: s.notified_uids } };
  }
  return s;
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
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

async function checkPlatform(client, platform, notifiedUids, dryRun) {
  let newCount = 0;
  const lock = await client.getMailboxLock('INBOX');

  try {
    const searchResult = await client.search({
      from: platform.from,
      subject: platform.subjectKeyword,
      seen: false,
    });

    for (const uid of searchResult) {
      const uidStr = String(uid);
      if (notifiedUids.has(uidStr)) continue;

      const msg = await client.fetchOne(uid, { source: true, envelope: true });
      const subject = msg.envelope?.subject || '';
      const date = msg.envelope?.date
        ? new Date(msg.envelope.date).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
        : '不明';

      const productName = platform.parseProduct(subject);

      const slackText =
        `${platform.emoji} *${platform.label} 売上通知！* ${platform.emoji}\n` +
        `商品/成果: *${productName}*\n` +
        `日時: ${date}\n` +
        `👉 <${platform.dashboardUrl}|${platform.label} ダッシュボードを確認>`;

      if (dryRun) {
        console.log(`[dry-run][${platform.key}] Slack 送信予定:`);
        console.log(slackText);
        console.log('---');
      } else {
        await sendSlack(slackText);
        await client.messageFlagsAdd(uid, ['\\Seen']);
        console.log(`✅ [${platform.key}] Slack 通知送信完了: ${productName}`);
      }

      notifiedUids.add(uidStr);
      newCount++;
    }
  } finally {
    lock.release();
  }

  return newCount;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const check = args.includes('--check');

  if (!check) {
    console.log('使い方: node --env-file=.env.local scripts/brain_sales_notifier.js --check [--dry-run]');
    process.exit(0);
  }

  const email = process.env.GMAIL_EMAIL;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;

  if (!email || !appPassword) {
    console.error('❌ GMAIL_EMAIL または GMAIL_APP_PASSWORD が .env.local に未設定です。');
    process.exit(1);
  }
  if (!slackWebhook) {
    console.error('❌ SLACK_WEBHOOK_URL が .env.local に未設定です。');
    process.exit(1);
  }

  console.log(`[${new Date().toISOString()}] 売上メールチェック開始${dryRun ? ' (dry-run)' : ''}`);

  const state = loadState();
  if (!state.notified_uids || typeof state.notified_uids !== 'object') {
    state.notified_uids = {};
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: email, pass: appPassword },
    logger: false,
  });

  await client.connect();

  let totalNew = 0;

  try {
    for (const platform of PLATFORMS) {
      const platformUids = new Set((state.notified_uids[platform.key] || []).map(String));
      const newCount = await checkPlatform(client, platform, platformUids, dryRun);
      state.notified_uids[platform.key] = [...platformUids];
      totalNew += newCount;
    }
  } finally {
    await client.logout();
  }

  if (totalNew === 0) {
    console.log('新しい売上・成果通知なし。');
  } else {
    console.log(`合計 ${totalNew} 件の売上通知を送信しました。`);
  }

  saveState(state);
}

main().catch((e) => {
  console.error('❌ エラー:', e.message);
  process.exit(1);
});
