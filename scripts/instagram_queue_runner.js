/**
 * Instagram Queue Runner — @ai_store_lab
 * 「ゆうさん承認済みキュー（instagram_posts_queue.csv）」からdaily_limit本まで
 * カルーセルを自動公開する、Threads Queue Runnerと同じ安全設計のランナー。
 *
 * 仕組み:
 *   1. instagram_drafts/<ID>.md からキャプション・ハッシュタグを読む
 *   2. instagram_drafts/images/<ID>/slide-01〜08.png をWordPressメディア
 *      ライブラリへアップロードして公開URLを得る（Instagram Graph APIは
 *      画像を直接アップロードできず、公開URLが必須のため）
 *   3. 8枚それぞれのメディアコンテナを作成 → カルーセルコンテナを作成
 *      → 公開（media_publish）
 *   4. キューCSVを更新・Slack通知
 *
 * 安全装置（threads_queue_runner.jsと同一設計）:
 *   - auto_post_enabled フラグ（scripts/instagram_auto_state.json）
 *     --disable で誰でもいつでも即OFFにできる
 *   - 連続2回投稿失敗で自動的に auto_post_enabled=false
 *   - トークン疎通確認（GET /me）を投稿前に必ず実施
 *   - Slack通知（SLACK_WEBHOOK_URL）が未設定の場合、--run は無人実行を拒否
 *   - 1日の投稿本数は daily_limit で固定（デフォルト1・要 --daily-limit で変更）
 *
 * 使い方:
 *   node scripts/instagram_queue_runner.js --status
 *   node scripts/instagram_queue_runner.js --enable
 *   node scripts/instagram_queue_runner.js --disable
 *   node --env-file=.env.local scripts/instagram_queue_runner.js --run
 *   node --env-file=.env.local scripts/instagram_queue_runner.js --run --allow-no-slack-notify
 *
 * 必須環境変数（.env.local）:
 *   INSTAGRAM_ACCESS_TOKEN : instagram_business_content_publish権限付きトークン
 *   WP_ACCESS_TOKEN        : wp_queue_runner.jsと共用（画像アップロード用）
 *   SLACK_WEBHOOK_URL       : 無人実行時の通知先
 */

'use strict';

const fs = require('fs');
const path = require('path');

const IG_API_BASE = 'https://graph.instagram.com/v21.0';
const IG_USER_ID = '27852748161045991'; // ai_store_lab
const WP_SITE = 'ainetbiz.com';
const WP_API_BASE = `https://public-api.wordpress.com/rest/v1.1/sites/${WP_SITE}`;

const STATE_FILE = path.join(__dirname, 'instagram_auto_state.json');
const QUEUE_FILE = path.join(
  __dirname,
  '..',
  'products',
  'revenue-intelligence-os',
  'data',
  'instagram_posts_queue.csv'
);
const DRAFTS_DIR = path.join(
  __dirname,
  '..',
  'products',
  'revenue-intelligence-os',
  'data',
  'instagram_drafts'
);
const IMAGES_DIR = path.join(DRAFTS_DIR, 'images');
const POST_LOG = path.join(__dirname, '..', 'operations', 'instagram_post_log.md');

function parseArgs() {
  const a = process.argv.slice(2);
  return {
    status: a.includes('--status'),
    enable: a.includes('--enable'),
    disable: a.includes('--disable'),
    run: a.includes('--run'),
    allowNoSlackNotify: a.includes('--allow-no-slack-notify'),
    dailyLimit: (() => {
      const i = a.indexOf('--daily-limit');
      return i !== -1 && a[i + 1] ? parseInt(a[i + 1], 10) : null;
    })(),
  };
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return {
      auto_post_enabled: false,
      consecutive_failures: 0,
      daily_limit: 1,
      last_post_date: null,
      posts_today: 0,
    };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ---- 簡易CSVパーサー（threads_queue_runner.jsと同じ実装） ----
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const lines = text.split(/\r\n|\n/);
  for (const rawLine of lines) {
    if (!inQuotes && (rawLine.startsWith('#') || rawLine.trim() === '')) continue;
    let line = rawLine;
    let i = 0;
    if (!inQuotes) {
      row = [];
      field = '';
    }
    while (i < line.length) {
      const c = line[i];
      if (inQuotes) {
        if (c === '"') {
          if (line[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        }
        field += c;
        i++;
        continue;
      }
      if (c === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (c === ',') {
        row.push(field);
        field = '';
        i++;
        continue;
      }
      field += c;
      i++;
    }
    if (inQuotes) {
      field += '\n';
      continue;
    }
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function csvEscape(value) {
  const v = String(value ?? '');
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

function loadQueue() {
  const raw = fs.readFileSync(QUEUE_FILE, 'utf8');
  const rows = parseCsv(raw);
  const header = rows[0];
  const records = rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((h, idx) => {
      obj[h] = r[idx] ?? '';
    });
    return obj;
  });
  return { header, records };
}

function writeQueue(header, records) {
  const headerComment = fs
    .readFileSync(QUEUE_FILE, 'utf8')
    .split(/\r\n|\n/)
    .filter((l) => l.startsWith('#'))
    .join('\n');
  const lines = [headerComment, '#', header.join(',')];
  for (const rec of records) {
    lines.push(header.map((h) => csvEscape(rec[h])).join(','));
  }
  fs.writeFileSync(QUEUE_FILE, lines.join('\n') + '\n');
}

function findDraftFile(id) {
  const files = fs.readdirSync(DRAFTS_DIR).filter((x) => x.endsWith('.md'));
  const match = files.find((x) => x.startsWith(`${id}_`) || x === `${id}.md`);
  return match ? path.join(DRAFTS_DIR, match) : null;
}

// Markdownドラフトから「# キャプション本文」と「# ハッシュタグ」を抽出し、
// Instagram投稿用の1つのcaption文字列に結合する。
function extractCaption(md) {
  const captionMatch = md.match(/# キャプション本文\s*\n([\s\S]*?)(?=\n# ハッシュタグ|\n#\s|$)/);
  const hashtagMatch = md.match(/# ハッシュタグ\s*\n([\s\S]*?)$/);
  const caption = captionMatch ? captionMatch[1].trim() : '';
  const hashtags = hashtagMatch ? hashtagMatch[1].trim() : '';
  if (!caption) throw new Error('キャプション本文が見つかりません');
  return hashtags ? `${caption}\n\n${hashtags}` : caption;
}

const sleep = (sec) => new Promise((r) => setTimeout(r, sec * 1000));

function getIgToken() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    throw new Error('INSTAGRAM_ACCESS_TOKEN が未設定です（--env-file=.env.local を付けて実行してください）');
  }
  return token;
}

function getWpToken() {
  const token = process.env.WP_ACCESS_TOKEN;
  if (!token) {
    throw new Error('WP_ACCESS_TOKEN が未設定です（画像アップロードにWordPressメディアAPIを使用します）');
  }
  return token;
}

async function igApi(method, endpoint, params) {
  const token = getIgToken();
  const url = new URL(`${IG_API_BASE}/${endpoint}`);
  const body = new URLSearchParams({ ...params, access_token: token });
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: method === 'GET' ? undefined : body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Instagram API ${res.status}: ${JSON.stringify(json.error || json)}`);
  }
  return json;
}

async function verifyToken() {
  const token = getIgToken();
  const url = new URL(`${IG_API_BASE}/me`);
  url.searchParams.set('fields', 'id,username,account_type');
  url.searchParams.set('access_token', token);
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`トークン疎通確認失敗: ${JSON.stringify(json.error || json)}`);
  }
  return json;
}

// WordPressメディアライブラリへローカル画像をアップロードし、公開URLを返す。
async function uploadImageToWp({ token, filePath }) {
  const buffer = fs.readFileSync(filePath);
  const form = new FormData();
  form.append('media[]', new Blob([buffer], { type: 'image/png' }), path.basename(filePath));
  const res = await fetch(`${WP_API_BASE}/media/new`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`WP media API ${res.status}: ${JSON.stringify(json)}`);
  }
  const media = json.media && json.media[0];
  if (!media || !media.URL) {
    throw new Error(`WP media API: URLが取得できませんでした ${JSON.stringify(json)}`);
  }
  return media.URL;
}

async function createCarouselItemContainer({ imageUrl }) {
  const res = await igApi('POST', `${IG_USER_ID}/media`, {
    image_url: imageUrl,
    is_carousel_item: 'true',
  });
  return res.id;
}

async function createCarouselContainer({ childrenIds, caption }) {
  const res = await igApi('POST', `${IG_USER_ID}/media`, {
    media_type: 'CAROUSEL',
    children: childrenIds.join(','),
    caption,
  });
  return res.id;
}

async function waitUntilFinished(containerId, { maxTries = 20, intervalSec = 5 } = {}) {
  for (let i = 0; i < maxTries; i++) {
    const res = await igApi('GET', containerId, { fields: 'status_code' });
    if (res.status_code === 'FINISHED') return true;
    if (res.status_code === 'ERROR') {
      throw new Error(`コンテナ処理エラー: ${containerId}`);
    }
    await sleep(intervalSec);
  }
  throw new Error(`コンテナ処理がタイムアウトしました: ${containerId}`);
}

async function publishContainer(containerId) {
  const res = await igApi('POST', `${IG_USER_ID}/media_publish`, {
    creation_id: containerId,
  });
  return res.id;
}

async function getPermalink(mediaId) {
  try {
    const res = await igApi('GET', mediaId, { fields: 'permalink' });
    return res.permalink || '(permalink取得失敗)';
  } catch (_) {
    return '(permalink取得失敗)';
  }
}

async function sendSlackNotify(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('⚠️  SLACK_WEBHOOK_URL未設定のため通知をスキップしました（無人運用の必須条件が未達です）');
    return false;
  }
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
    return res.ok;
  } catch (e) {
    console.warn(`⚠️  Slack通知送信でエラー: ${e.message}`);
    return false;
  }
}

function appendLog({ id, mediaId, permalink }) {
  const stamp = new Date().toISOString();
  const line = `\n- [auto] ${stamp} / ${id}\n    メディアID: ${mediaId}\n    投稿URL: ${permalink}\n`;
  fs.appendFileSync(POST_LOG, line);
}

function printStatus(state, queueInfo) {
  console.log('\n==================== Instagram Queue Runner 状態 ====================');
  console.log(`auto_post_enabled : ${state.auto_post_enabled ? '🟢 ON' : '🔴 OFF'}`);
  console.log(`連続失敗回数       : ${state.consecutive_failures}`);
  console.log(`本日の投稿本数     : ${state.posts_today}（上限 ${state.daily_limit}）`);
  console.log(`最終投稿日         : ${state.last_post_date || '(なし)'}`);
  console.log(`承認済み未公開件数 : ${queueInfo.readyCount}`);
  console.log(`次に公開予定       : ${queueInfo.next ? queueInfo.next.id : '(キューが空)'}`);
  console.log('=======================================================================\n');
}

async function publishOne(row) {
  const filePath = findDraftFile(row.id);
  if (!filePath) throw new Error(`${row.id}: 下書きファイルが見つかりません`);
  const md = fs.readFileSync(filePath, 'utf8');
  const caption = extractCaption(md);

  const postImagesDir = path.join(IMAGES_DIR, row.id);
  const slideFiles = fs
    .readdirSync(postImagesDir)
    .filter((f) => f.endsWith('.png'))
    .sort();
  if (slideFiles.length === 0) throw new Error(`${row.id}: 画像が見つかりません`);

  const wpToken = getWpToken();
  console.log(`  ${slideFiles.length}枚の画像をWordPressへアップロード中...`);
  const imageUrls = [];
  for (const f of slideFiles) {
    const url = await uploadImageToWp({ token: wpToken, filePath: path.join(postImagesDir, f) });
    imageUrls.push(url);
  }

  console.log('  Instagramメディアコンテナを作成中...');
  const childrenIds = [];
  for (const imageUrl of imageUrls) {
    const id = await createCarouselItemContainer({ imageUrl });
    childrenIds.push(id);
  }

  console.log('  カルーセルコンテナを作成中...');
  const carouselContainerId = await createCarouselContainer({ childrenIds, caption });
  await waitUntilFinished(carouselContainerId);

  console.log('  公開中...');
  const mediaId = await publishContainer(carouselContainerId);
  const permalink = await getPermalink(mediaId);

  return { mediaId, permalink };
}

async function main() {
  const args = parseArgs();
  let state = loadState();

  if (args.enable) {
    state.auto_post_enabled = true;
    state.consecutive_failures = 0;
    saveState(state);
    console.log('🟢 auto_post_enabled を true にしました。');
    return;
  }

  if (args.disable) {
    state.auto_post_enabled = false;
    saveState(state);
    console.log('🔴 auto_post_enabled を false にしました（即OFF）。');
    return;
  }

  if (args.dailyLimit !== null) {
    state.daily_limit = args.dailyLimit;
    saveState(state);
    console.log(`daily_limit を ${args.dailyLimit} に設定しました。`);
  }

  const { header, records } = loadQueue();
  const ready = records
    .filter((r) => r.draft_status === 'qa_passed' && r.images_status === 'generated')
    .sort((a, b) => a.id.localeCompare(b.id));
  const queueInfo = { readyCount: ready.length, next: ready[0] || null };

  if (args.status || (!args.run && !args.enable && !args.disable)) {
    printStatus(state, queueInfo);
    return;
  }

  if (!args.run) return;

  const today = todayStr();
  if (state.last_post_date !== today) {
    state.posts_today = 0;
  }

  console.log('\n==================== Instagram Queue Runner 実行 ====================');

  if (!state.auto_post_enabled) {
    console.log('🔴 auto_post_enabled=false のため実行しません。--enable で有効化してください。');
    return;
  }

  if (!process.env.SLACK_WEBHOOK_URL && !args.allowNoSlackNotify) {
    console.log(
      '❌ SLACK_WEBHOOK_URL 未設定のため無人実行を拒否しました。\n' +
        '   手動テストの場合のみ --allow-no-slack-notify を付けて実行してください。'
    );
    return;
  }

  if (state.posts_today >= state.daily_limit) {
    console.log(`✅ 本日分（${state.daily_limit}本）は投稿済みです。何もしません。`);
    return;
  }

  let postedCount = 0;
  while (state.posts_today < state.daily_limit) {
    const { records: freshRecords } = loadQueue();
    const readyNow = freshRecords
      .filter((r) => r.draft_status === 'qa_passed' && r.images_status === 'generated')
      .sort((a, b) => a.id.localeCompare(b.id));
    const next = readyNow[0] || null;
    if (!next) {
      if (postedCount === 0) {
        console.log('ℹ️  公開可能な承認済み投稿がキューにありません。');
      } else {
        console.log('ℹ️  公開可能な投稿を使い切りました。');
      }
      break;
    }

    try {
      console.log(`対象: ${next.id}（${next.theme}）`);
      await verifyToken();

      const { mediaId, permalink } = await publishOne(next);
      console.log(`✅ 公開完了: ${permalink}`);

      const idx = freshRecords.findIndex((r) => r.id === next.id);
      freshRecords[idx].draft_status = 'posted';
      freshRecords[idx].media_id = mediaId;
      freshRecords[idx].permalink = permalink;
      freshRecords[idx].posted_at = new Date().toISOString();
      writeQueue(header, freshRecords);

      appendLog({ id: next.id, mediaId, permalink });

      state.consecutive_failures = 0;
      state.posts_today += 1;
      state.last_post_date = today;
      saveState(state);
      postedCount += 1;

      await sendSlackNotify(`✅ Instagram自動投稿成功: ${next.id}（${next.theme}）\n${permalink}`);
      console.log('🎉 完了。');

      if (state.posts_today < state.daily_limit) {
        await sleep(600);
      }
    } catch (e) {
      console.error(`\n❌ 失敗: ${e.message}`);
      state.consecutive_failures += 1;
      let stopped = false;
      if (state.consecutive_failures >= 2) {
        state.auto_post_enabled = false;
        stopped = true;
      }
      saveState(state);
      await sendSlackNotify(
        `❌ Instagram自動投稿失敗: ${next.id}（連続${state.consecutive_failures}回目）\n${e.message}` +
          (stopped ? '\n🔴 連続失敗のため auto_post_enabled を自動的にOFFにしました。' : '')
      );
      process.exit(1);
    }
  }

  if (postedCount > 1) {
    console.log(`\n🎉 本日 ${postedCount} 本を公開しました。`);
  }
}

main();
