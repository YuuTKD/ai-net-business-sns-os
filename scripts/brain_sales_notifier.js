/**
 * 売上通知 → Slack リアルタイム通知スクリプト
 *
 * 対応プラットフォーム:
 *   Brain（APIポーリング）/ note / 楽天アフィリエイト（ROOM含む）/ A8.net / もしもアフィリエイト（メールIMAP）
 *
 * 必要な環境変数（.env.local）:
 *   SLACK_WEBHOOK_URL      - 既存（threads_queue_runner.js と共有）
 *   GMAIL_EMAIL            - yuya_tokuda@trees-catering.com
 *   GMAIL_APP_PASSWORD     - Googleアカウントで発行した16桁のアプリパスワード
 *   BRAIN_API_TOKEN        - （任意）Brain Access-Token。未設定時はBrainチェックをスキップ
 *   BRAIN_CLIENT           - （任意）Brain Client ヘッダー値（Access-Tokenとセット）
 *                            取得方法: Brainにログイン → DevTools(Cmd+Option+I) → Network →
 *                            sold_month でフィルタ → Request Headers の Access-Token / Client の値
 *
 * 使い方:
 *   node --env-file=.env.local scripts/brain_sales_notifier.js --check
 *   node --env-file=.env.local scripts/brain_sales_notifier.js --check --dry-run
 *
 * cron 設定（10分ごと）:
 *   * /10 * * * * cd /Users/tokudayuya/ai-net-business-sns-os && node ... scripts/brain_sales_notifier.js --check
 *
 * 状態ファイル: scripts/brain_sales_notifier_state.json
 *
 * ⚠️ メールパターン未確認のプラットフォーム:
 *   楽天アフィリエイト / A8.net / もしもアフィリエイト は初回成果発生時に実メールで
 *   PLATFORMS の from / subjectKeyword を確認・修正すること。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { ImapFlow } = require('imapflow');

const STATE_FILE = path.join(__dirname, 'brain_sales_notifier_state.json');

// プラットフォーム別メール通知設定
const EMAIL_PLATFORMS = [
  {
    key: 'note',
    label: 'note',
    emoji: '📝',
    from: 'noreply@note.com',
    subjectKeyword: '購入されました',
    dashboardUrl: 'https://note.com/dashboard',
    parseSubject: (subject) => {
      const m = subject.match(/「(.+?)」/);
      return { product: m ? m[1] : subject, amount: null };
    },
    // ⚠️ 金額はメール本文から抽出（初回成果時にパターン確認して更新）
    parseBody: (text) => {
      const m = text.match(/(\d[\d,]+)\s*円/);
      return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
    },
  },
  {
    key: 'rakuten',
    label: '楽天アフィリエイト（ROOM含む）',
    emoji: '🛍️',
    // ⚠️ 初回成果発生時に実メールで確認して更新
    from: 'affiliate@mail.rakuten.com',
    subjectKeyword: '成果発生',
    dashboardUrl: 'https://affiliate.rakuten.co.jp/report/',
    parseSubject: (subject) => ({ product: subject, amount: null }),
    parseBody: (text) => {
      const m = text.match(/(\d[\d,]+)\s*円/);
      return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
    },
  },
  {
    key: 'a8',
    label: 'A8.net',
    emoji: '💰',
    // ⚠️ 初回成果発生時に実メールで確認して更新
    from: 'report@a8.net',
    subjectKeyword: '成果',
    dashboardUrl: 'https://pub.a8.net/a8v2/asTransactionList.as',
    parseSubject: (subject) => ({ product: subject, amount: null }),
    parseBody: (text) => {
      const m = text.match(/(\d[\d,]+)\s*円/);
      return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
    },
  },
  {
    key: 'moshimo',
    label: 'もしもアフィリエイト',
    emoji: '💴',
    // ⚠️ 初回成果発生時に実メールで確認して更新
    from: 'info@moshimo.com',
    subjectKeyword: '成果確定',
    dashboardUrl: 'https://af.moshimo.com/af/result/transaction_list',
    parseSubject: (subject) => ({ product: subject, amount: null }),
    parseBody: (text) => {
      const m = text.match(/(\d[\d,]+)\s*円/);
      return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
    },
  },
];

// ─── 状態管理 ───────────────────────────────────────────────

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return { notified_uids: {}, daily_sales: {} };
  const s = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  if (Array.isArray(s.notified_uids)) {
    return { notified_uids: { brain: s.notified_uids }, daily_sales: {} };
  }
  if (!s.daily_sales) s.daily_sales = {};
  return s;
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

function todayJST() {
  const parts = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const get = (t) => parts.find(p => p.type === t)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function recordDailySale(state, platform, amount) {
  const today = todayJST();
  if (!state.daily_sales[today]) state.daily_sales[today] = {};
  if (!state.daily_sales[today][platform]) {
    state.daily_sales[today][platform] = { count: 0, amount: 0 };
  }
  state.daily_sales[today][platform].count += 1;
  if (amount) state.daily_sales[today][platform].amount += amount;
}

// ─── Slack 送信 ──────────────────────────────────────────────

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

// ─── Brain API ポーリング ──────────────────────────────────────

async function checkBrainApi(state, dryRun) {
  const token = process.env.BRAIN_API_TOKEN;
  const client = process.env.BRAIN_CLIENT;
  const uid = process.env.GMAIL_EMAIL || 'yuya_tokuda@trees-catering.com';
  if (!token || !client) {
    console.log('[brain] BRAIN_API_TOKEN または BRAIN_CLIENT 未設定のためスキップ。');
    return 0;
  }

  const today = todayJST();
  const month = today.slice(0, 7).replace('-', '/'); // "2026/08"
  const url = `https://api.brain-market.com/v2/sales/sales_histories?month=${month}&channel_type=all&currency=JPY&page=1`;

  const data = await new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'Access-Token': token,
        'Client': client,
        'Uid': uid,
        'Content-Type': 'application/json',
      },
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { resolve(null); }
      });
    });
    req.on('error', reject);
    req.end();
  });

  if (!data || !Array.isArray(data.data)) {
    console.log('[brain] API レスポンス異常。トークン期限切れの可能性あり。');
    return 0;
  }

  const seenIds = new Set((state.notified_uids.brain || []).map(String));
  let newCount = 0;

  for (const sale of data.data) {
    const id = String(sale.id);
    if (seenIds.has(id)) continue;

    const product = sale.article_title || '不明な商品';
    const price = sale.price || 0;
    const reward = sale.profit_price || 0;
    const dateStr = sale.created_at
      ? new Date(sale.created_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
      : '不明';

    const slackText =
      `🎉 *Brain 売上通知！* 🎉\n` +
      `商品: *${product}*\n` +
      `金額: ¥${price.toLocaleString()}（手取り ¥${reward.toLocaleString()}）\n` +
      `日時: ${dateStr}\n` +
      `👉 <https://brain-market.com/sales/sales_history|Brain 販売履歴を確認>`;

    if (dryRun) {
      console.log('[dry-run][brain] Slack 送信予定:');
      console.log(slackText);
      console.log('---');
    } else {
      await sendSlack(slackText);
      console.log(`✅ [brain] Slack 通知送信完了: ${product} ¥${price}`);
    }

    seenIds.add(id);
    recordDailySale(state, 'brain', price);
    newCount++;
  }

  state.notified_uids.brain = [...seenIds];
  return newCount;
}

// ─── メール IMAP チェック ────────────────────────────────────

async function extractTextFromMsg(msg) {
  if (!msg.source) return '';
  const raw = msg.source.toString('utf8');
  // quoted-printable デコード（簡易版）
  const body = raw.replace(/=[0-9A-F]{2}/gi, m => String.fromCharCode(parseInt(m.slice(1), 16)));
  return body;
}

async function checkEmailPlatforms(client, state, dryRun) {
  let totalNew = 0;

  for (const platform of EMAIL_PLATFORMS) {
    const lock = await client.getMailboxLock('INBOX');
    const platformUids = new Set((state.notified_uids[platform.key] || []).map(String));

    try {
      const searchResult = await client.search({
        from: platform.from,
        subject: platform.subjectKeyword,
        seen: false,
      });

      for (const uid of searchResult) {
        const uidStr = String(uid);
        if (platformUids.has(uidStr)) continue;

        const msg = await client.fetchOne(uid, { source: true, envelope: true });
        const subject = msg.envelope?.subject || '';
        const dateStr = msg.envelope?.date
          ? new Date(msg.envelope.date).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
          : '不明';

        const { product } = platform.parseSubject(subject);
        const bodyText = await extractTextFromMsg(msg);
        const amount = platform.parseBody(bodyText);

        const amountLine = amount
          ? `金額: *¥${amount.toLocaleString()}*（1件）\n`
          : '';

        const slackText =
          `${platform.emoji} *${platform.label} 売上通知！* ${platform.emoji}\n` +
          `商品/成果: *${product}*\n` +
          amountLine +
          `日時: ${dateStr}\n` +
          `👉 <${platform.dashboardUrl}|${platform.label} ダッシュボードを確認>`;

        if (dryRun) {
          console.log(`[dry-run][${platform.key}] Slack 送信予定:`);
          console.log(slackText);
          console.log('---');
        } else {
          await sendSlack(slackText);
          await client.messageFlagsAdd(uid, ['\\Seen']);
          console.log(`✅ [${platform.key}] Slack 通知送信完了: ${product}${amount ? ` ¥${amount}` : ''}`);
        }

        platformUids.add(uidStr);
        recordDailySale(state, platform.key, amount);
        totalNew++;
      }
    } finally {
      lock.release();
    }

    state.notified_uids[platform.key] = [...platformUids];
  }

  return totalNew;
}

// ─── メイン ──────────────────────────────────────────────────

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
  if (!state.notified_uids || typeof state.notified_uids !== 'object') state.notified_uids = {};
  if (!state.daily_sales) state.daily_sales = {};

  let totalNew = 0;

  // Brain API ポーリング
  totalNew += await checkBrainApi(state, dryRun);

  // メール IMAP チェック
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: email, pass: appPassword },
    logger: false,
  });

  await client.connect();
  try {
    totalNew += await checkEmailPlatforms(client, state, dryRun);
  } finally {
    await client.logout();
  }

  if (totalNew === 0) {
    console.log('新しい売上・成果通知なし。');
  } else {
    console.log(`合計 ${totalNew} 件の売上通知を送信しました。`);
  }

  if (!dryRun) saveState(state);
}

main().catch((e) => {
  console.error('❌ エラー:', e.message);
  process.exit(1);
});
