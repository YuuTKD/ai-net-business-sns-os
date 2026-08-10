/**
 * アフィリエイト提携承認チェッカー
 *
 * 対象プラットフォーム:
 *   もしもアフィリエイト（IMAP: yuya_tokuda@trees-catering.com）
 *   A8.net             （IMAP: y.t88okinawa@gmail.com ← 別アカウント設定必要）
 *
 * 実メールで確認済みのパターン:
 *   もしも 承認: from=no-reply@personal.moshimo.com, subject="提携が承認されました！【もしもアフィリエイト】"
 *   もしも 否認: from=no-reply@personal.moshimo.com, subject="提携が否認されました【もしもアフィリエイト】"
 *   A8.net: ⚠️ y.t88okinawa@gmail.com に届く想定。初回承認メール受信後に from/subject を更新すること。
 *
 * 必要な環境変数（.env.local）:
 *   SLACK_WEBHOOK_URL        - Slack Incoming Webhook URL
 *   GMAIL_EMAIL              - yuya_tokuda@trees-catering.com（もしもアフィリエイト用）
 *   GMAIL_APP_PASSWORD       - 上記アカウントのGoogleアプリパスワード（16桁）
 *   GMAIL_EMAIL_A8           - y.t88okinawa@gmail.com（A8.net用。未設定時はA8チェックをスキップ）
 *   GMAIL_APP_PASSWORD_A8    - 上記アカウントのGoogleアプリパスワード（16桁）
 *
 * 使い方:
 *   node --env-file=.env.local scripts/affiliate_approval_checker.js --check
 *   node --env-file=.env.local scripts/affiliate_approval_checker.js --check --dry-run
 *
 * cron 設定（毎日9:00 JST = 0:00 UTC）:
 *   0 0 * * * cd /Users/tokudayuya/ai-net-business-sns-os && node --env-file=.env.local scripts/affiliate_approval_checker.js --check >> operations/affiliate_approval_checker.log 2>&1
 *
 * 状態ファイル: scripts/affiliate_approval_checker_state.json
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { ImapFlow } = require('imapflow');

const STATE_FILE = path.join(__dirname, 'affiliate_approval_checker_state.json');
const CSV_PATH = path.join(__dirname, '../products/revenue-intelligence-os/data/affiliate_link_library_v2.csv');

// ─── プラットフォーム設定 ─────────────────────────────────────

const PLATFORMS = [
  {
    key: 'moshimo_approved',
    label: 'もしもアフィリエイト',
    status: 'approved',
    emailAccount: 'main', // GMAIL_EMAIL / GMAIL_APP_PASSWORD
    from: 'no-reply@personal.moshimo.com',
    subjectKeyword: '提携が承認されました',
    dashboardUrl: 'https://af.moshimo.com/af/shop/promotion/search?shop_site_id=682685',
    parseBody: (text) => {
      const m = text.match(/●提携承認プロモーション：\r?\n(.+)/);
      return m ? m[1].trim() : null;
    },
  },
  {
    key: 'moshimo_rejected',
    label: 'もしもアフィリエイト',
    status: 'rejected',
    emailAccount: 'main',
    from: 'no-reply@personal.moshimo.com',
    subjectKeyword: '提携が否認されました',
    dashboardUrl: 'https://af.moshimo.com/af/shop/promotion/search?shop_site_id=682685',
    parseBody: (text) => {
      const m = text.match(/●提携否認プロモーション：\r?\n(.+)/);
      return m ? m[1].trim() : null;
    },
  },
  {
    key: 'a8_approved',
    label: 'A8.net',
    status: 'approved',
    emailAccount: 'a8', // GMAIL_EMAIL_A8 / GMAIL_APP_PASSWORD_A8
    // ⚠️ 初回承認メール受信後に実メールで確認して更新
    from: 'info@a8.net',
    subjectKeyword: '提携が承認',
    dashboardUrl: 'https://pub.a8.net/a8v2/asTransactionList.as',
    parseBody: (text) => {
      // ⚠️ A8.net の実メール本文を見てからパターンを更新すること
      const m = text.match(/プログラム[名称：:\s]*(.+)/);
      return m ? m[1].trim() : null;
    },
  },
  {
    key: 'a8_rejected',
    label: 'A8.net',
    status: 'rejected',
    emailAccount: 'a8',
    from: 'info@a8.net',
    subjectKeyword: '提携が否認',
    dashboardUrl: 'https://pub.a8.net/a8v2/asTransactionList.as',
    parseBody: (text) => {
      const m = text.match(/プログラム[名称：:\s]*(.+)/);
      return m ? m[1].trim() : null;
    },
  },
];

// ─── 状態管理 ─────────────────────────────────────────────────

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return { notified_uids: {} };
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

// ─── Slack 送信 ───────────────────────────────────────────────

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

// ─── CSV 更新（もしもアフィリエイト 承認時） ──────────────────

function updateCsvStatus(programName) {
  if (!fs.existsSync(CSV_PATH)) return false;
  const content = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = content.split('\n');
  let updated = false;

  const result = lines.map((line) => {
    if (line.startsWith('#') || !line.trim()) return line;
    // product_name カラム（4番目, 0-indexed: 3）にプログラム名の一部が含まれているか
    const cols = line.split(',');
    if (cols.length < 6) return line;
    const productName = cols[3] || '';
    // パターンマッチ: プログラム名の先頭20文字で検索
    const keyword = programName.slice(0, 20);
    if (productName.includes(keyword) && cols[10] === 'pending_review') {
      cols[10] = 'active';
      updated = true;
      console.log(`✅ CSV更新: ${productName} → active`);
      return cols.join(',');
    }
    return line;
  });

  if (updated) {
    fs.writeFileSync(CSV_PATH, result.join('\n'));
  }
  return updated;
}


// ─── IMAP チェック（1アカウント分） ──────────────────────────

async function checkOneAccount(imapClient, platforms, state, dryRun) {
  let totalNew = 0;

  for (const platform of platforms) {
    const platformUids = new Set((state.notified_uids[platform.key] || []).map(String));
    const lock = await imapClient.getMailboxLock('INBOX');

    try {
      const searchResult = await imapClient.search({
        from: platform.from,
        subject: platform.subjectKeyword,
      });

      for (const uid of searchResult) {
        const uidStr = String(uid);
        if (platformUids.has(uidStr)) continue;

        const msg = await imapClient.fetchOne(uid, { bodyParts: ['TEXT'], envelope: true });
        const subject = msg.envelope?.subject || '';
        const dateStr = msg.envelope?.date
          ? new Date(msg.envelope.date).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
          : '不明';

        // TEXT パートを ISO-2022-JP でデコード（Node.js TextDecoder使用）
        let bodyText = '';
        const textPart = msg.bodyParts?.get('TEXT') || msg.bodyParts?.get('text');
        if (textPart) {
          try {
            bodyText = new TextDecoder('iso-2022-jp').decode(textPart);
          } catch (_) {
            bodyText = textPart.toString('utf8');
          }
        }
        const programName = platform.parseBody(bodyText) || subject;

        const isApproved = platform.status === 'approved';
        const statusEmoji = isApproved ? '✅' : '❌';
        const statusText = isApproved ? '承認' : '否認';

        const slackText =
          `🔔 *アフィリ提携${statusText}通知* ${statusEmoji}\n` +
          `プラットフォーム: *${platform.label}*\n` +
          `プログラム: *${programName}*\n` +
          `ステータス: *${statusText}* ${statusEmoji}\n` +
          `日時: ${dateStr}\n` +
          `👉 <${platform.dashboardUrl}|${platform.label} 管理画面を確認>`;

        if (dryRun) {
          console.log(`[dry-run][${platform.key}] Slack 送信予定:`);
          console.log(slackText);
          console.log('---');
        } else {
          await sendSlack(slackText);
          console.log(`✅ [${platform.key}] Slack 通知送信完了: ${programName} (${statusText})`);

          // 承認時のみ CSV 更新を試みる
          if (isApproved && platform.key.startsWith('moshimo')) {
            updateCsvStatus(programName);
          }
        }

        platformUids.add(uidStr);
        totalNew++;
      }
    } finally {
      lock.release();
    }

    state.notified_uids[platform.key] = [...platformUids];
  }

  return totalNew;
}

// ─── メイン ───────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const check = args.includes('--check');

  if (!check) {
    console.log('使い方: node --env-file=.env.local scripts/affiliate_approval_checker.js --check [--dry-run]');
    process.exit(0);
  }

  const mainEmail = process.env.GMAIL_EMAIL;
  const mainPass = process.env.GMAIL_APP_PASSWORD;
  const a8Email = process.env.GMAIL_EMAIL_A8;
  const a8Pass = process.env.GMAIL_APP_PASSWORD_A8;
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;

  if (!mainEmail || !mainPass) {
    console.error('❌ GMAIL_EMAIL または GMAIL_APP_PASSWORD が .env.local に未設定です。');
    process.exit(1);
  }
  if (!slackWebhook) {
    console.error('❌ SLACK_WEBHOOK_URL が .env.local に未設定です。');
    process.exit(1);
  }

  console.log(`[${new Date().toISOString()}] アフィリ承認チェック開始${dryRun ? ' (dry-run)' : ''}`);

  const state = loadState();
  if (!state.notified_uids) state.notified_uids = {};

  let totalNew = 0;

  // ── もしもアフィリエイト（yuya_tokuda@trees-catering.com） ──
  const mainPlatforms = PLATFORMS.filter((p) => p.emailAccount === 'main');
  const mainClient = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: mainEmail, pass: mainPass },
    logger: false,
  });
  await mainClient.connect();
  try {
    totalNew += await checkOneAccount(mainClient, mainPlatforms, state, dryRun);
  } finally {
    await mainClient.logout();
  }

  // ── A8.net（y.t88okinawa@gmail.com、任意） ──
  const a8Platforms = PLATFORMS.filter((p) => p.emailAccount === 'a8');
  if (a8Email && a8Pass) {
    console.log(`[A8] ${a8Email} をチェック中...`);
    const a8Client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: { user: a8Email, pass: a8Pass },
      logger: false,
    });
    await a8Client.connect();
    try {
      totalNew += await checkOneAccount(a8Client, a8Platforms, state, dryRun);
    } finally {
      await a8Client.logout();
    }
  } else {
    console.log('[A8] GMAIL_EMAIL_A8 / GMAIL_APP_PASSWORD_A8 未設定のため A8.net チェックをスキップ。');
    console.log('     → .env.local に GMAIL_EMAIL_A8=y.t88okinawa@gmail.com と GMAIL_APP_PASSWORD_A8=xxxx を追加してください。');
  }

  if (totalNew === 0) {
    console.log('新しい提携承認・否認通知なし。');
  } else {
    console.log(`合計 ${totalNew} 件の承認/否認通知を送信しました。`);
  }

  if (!dryRun) saveState(state);
}

main().catch((err) => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
