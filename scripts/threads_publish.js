/**
 * Threads Publisher — @ai_store_lab
 * 公式 Threads Graph API 経由で「1回の実行につき1本だけ」投稿する CLI。
 *
 * 設計方針（CLAUDE.md / RIO_804 準拠）:
 *   - 本番投稿は投稿1件ごとのゆうさん明示承認が必須。よって --live は1 postずつ実行する。
 *   - 完全無人のスケジュール一括投稿には使わない（このCLIは手動トリガー専用）。
 *   - トークン等のSecretはリポジトリに置かない。process.env から読む。
 *     推奨: node --env-file=.env.local scripts/threads_publish.js ...
 *     (.env.local は .gitignore 済み。中身はこのCLIが実行時に読むのみ)
 *
 * 必要な環境変数:
 *   THREADS_ACCESS_TOKEN  ... Threads Graph API のユーザーアクセストークン
 *                             (スコープ: threads_basic, threads_content_publish)
 *   THREADS_USER_ID       ... 省略可。省略時は "me" を使用（トークンの所有者）。
 *
 * 使い方:
 *   # 1) トークン疎通確認（アカウント名を表示するだけ・投稿しない）
 *   node --env-file=.env.local scripts/threads_publish.js --verify
 *
 *   # 2) ドライラン（既定・API を叩かない。投稿内容と手順を表示）
 *   node scripts/threads_publish.js --post 004
 *
 *   # 3) 本番投稿（承認済みの1本のみ）。本文を投稿→数十秒後に1コメント目としてリンクを返信
 *   node --env-file=.env.local scripts/threads_publish.js --post 004 --live
 *
 * オプション:
 *   --post <id>   threads_posts.json の posts キー（004〜011）。必須（--verify時を除く）
 *   --live        本番投稿を実行（未指定なら dry-run）
 *   --verify      トークン疎通確認のみ
 *   --no-reply    リンク（1コメント目）を付けない
 *   --delay <sec> コンテナ作成→公開の待機秒数（既定 30）
 *   --text "..."  threads_posts.json を使わず本文を直接指定（アドホック投稿用）
 *   --reply "..." アドホック投稿時の1コメント目本文
 */

'use strict';

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://graph.threads.net/v1.0';
const POSTS_FILE = path.join(__dirname, 'threads_posts.json');
const POST_LOG = path.join(__dirname, '..', 'operations', 'threads_post_log.md');

function parseArgs() {
  const a = process.argv.slice(2);
  const val = (flag) => {
    const i = a.indexOf(flag);
    return i !== -1 && a[i + 1] ? a[i + 1] : null;
  };
  return {
    post: val('--post'),
    live: a.includes('--live'),
    verify: a.includes('--verify'),
    noReply: a.includes('--no-reply'),
    delay: parseInt(val('--delay') || '30', 10),
    text: val('--text'),
    reply: val('--reply'),
  };
}

function getToken() {
  const token = process.env.THREADS_ACCESS_TOKEN;
  if (!token) {
    console.error(
      '\n❌ THREADS_ACCESS_TOKEN が未設定です。\n' +
        '   .env.local に THREADS_ACCESS_TOKEN=... を記載し、\n' +
        '   node --env-file=.env.local scripts/threads_publish.js ... で実行してください。\n' +
        '   (Secret はこのCLIが実行時に読むだけで、リポジトリには保存されません)\n'
    );
    process.exit(1);
  }
  return token;
}

function userId() {
  return process.env.THREADS_USER_ID || 'me';
}

async function api(method, endpoint, params) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  const body = new URLSearchParams(params);
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: method === 'GET' ? undefined : body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Threads API ${res.status}: ${JSON.stringify(json.error || json)}`
    );
  }
  return json;
}

async function apiGet(endpoint, params) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Threads API ${res.status}: ${JSON.stringify(json.error || json)}`
    );
  }
  return json;
}

const sleep = (sec) => new Promise((r) => setTimeout(r, sec * 1000));

async function verify() {
  const token = getToken();
  const me = await apiGet(`${userId()}`, {
    fields: 'id,username',
    access_token: token,
  });
  console.log(`✅ 疎通OK: @${me.username} (id: ${me.id})`);
  return me;
}

// 単一テキスト投稿を作成→公開し、公開されたメディアID/permalinkを返す
async function publishText({ token, text, replyToId, delay }) {
  const createParams = {
    media_type: 'TEXT',
    text,
    access_token: token,
  };
  if (replyToId) createParams.reply_to_id = replyToId;

  const container = await api('POST', `${userId()}/threads`, createParams);
  const creationId = container.id;
  console.log(`   ・コンテナ作成: ${creationId}`);

  // Threads推奨: コンテナ作成後、公開まで少し待つ
  if (delay > 0) {
    console.log(`   ・公開まで ${delay}s 待機...`);
    await sleep(delay);
  }

  const published = await api('POST', `${userId()}/threads_publish`, {
    creation_id: creationId,
    access_token: token,
  });
  const mediaId = published.id;

  let permalink = '(permalink取得失敗)';
  try {
    const info = await apiGet(`${mediaId}`, {
      fields: 'permalink',
      access_token: token,
    });
    permalink = info.permalink || permalink;
  } catch (_) {}

  return { mediaId, permalink };
}

function loadPost(id) {
  const data = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
  const p = data.posts[id];
  if (!p) {
    console.error(
      `❌ post id "${id}" が見つかりません。利用可能: ${Object.keys(data.posts).join(', ')}`
    );
    process.exit(1);
  }
  return p;
}

function appendLog({ id, theme, permalink, replyPermalink }) {
  const stamp = new Date().toISOString();
  const line =
    `\n- [live] ${stamp} / 餌-${id} (${theme})\n` +
    `    本投稿: ${permalink}\n` +
    `    リンク返信: ${replyPermalink || '(なし)'}\n`;
  try {
    fs.appendFileSync(POST_LOG, line);
    console.log(`📝 ログ追記: operations/threads_post_log.md`);
  } catch (e) {
    console.warn(`⚠️ ログ追記に失敗: ${e.message}`);
  }
}

async function main() {
  const args = parseArgs();

  if (args.verify) {
    await verify();
    return;
  }

  // 投稿内容の解決（threads_posts.json または --text）
  let id, theme, text, reply;
  if (args.text) {
    id = 'adhoc';
    theme = 'adhoc';
    text = args.text;
    reply = args.reply || null;
  } else {
    if (!args.post) {
      console.error('❌ --post <id> か --text "..." を指定してください（--verify を除く）。');
      process.exit(1);
    }
    const p = loadPost(args.post);
    id = args.post;
    theme = p.theme;
    text = p.text;
    reply = p.reply || null;
  }
  if (args.noReply) reply = null;

  // ── 表示（dry / live 共通） ──
  console.log('\n==================== Threads 投稿プレビュー ====================');
  console.log(`アカウント : @ai_store_lab`);
  console.log(`投稿ID     : 餌-${id} (${theme})`);
  console.log(`モード     : ${args.live ? '🔴 LIVE（本番投稿）' : '🟡 DRY-RUN（送信しない）'}`);
  console.log('---------------- 本投稿 ----------------');
  console.log(text);
  console.log(`（本文 ${[...text].length} 文字）`);
  if (reply) {
    console.log('---------------- 1コメント目（リンク） ----------------');
    console.log(reply);
  }
  console.log('==============================================================\n');

  if (!args.live) {
    console.log('🟡 DRY-RUN のため送信していません。');
    console.log('   本番投稿するには承認のうえ --live を付けて再実行してください。');
    console.log('   例) node --env-file=.env.local scripts/threads_publish.js --post ' + id + ' --live');
    return;
  }

  // ── 本番投稿 ──
  const token = getToken();
  console.log('🔴 本投稿を送信します...');
  const main1 = await publishText({ token, text, delay: args.delay });
  console.log(`✅ 本投稿 公開: ${main1.permalink}`);

  let replyResult = null;
  if (reply) {
    console.log('🔴 1コメント目（リンク）を送信します...');
    replyResult = await publishText({
      token,
      text: reply,
      replyToId: main1.mediaId,
      delay: args.delay,
    });
    console.log(`✅ リンク返信 公開: ${replyResult.permalink}`);
  }

  appendLog({
    id,
    theme,
    permalink: main1.permalink,
    replyPermalink: replyResult ? replyResult.permalink : null,
  });

  console.log('\n🎉 完了。posts_queue / threads_post_log に記録済み。次の1本も承認のうえ実行してください。');
}

main().catch((e) => {
  console.error(`\n❌ 失敗: ${e.message}\n`);
  process.exit(1);
});
