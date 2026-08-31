'use strict';
/**
 * wp_html_design_patcher.js
 * Markdownソースなしの公開済み記事HTMLに直接インラインCSSを注入する。
 * 
 * 使い方:
 *   node --env-file=.env.local scripts/wp_html_design_patcher.js --dry
 *   node --env-file=.env.local scripts/wp_html_design_patcher.js --run
 */

const SITE = 'ainetbiz.com';
const API_BASE = `https://public-api.wordpress.com/wp/v2/sites/${SITE}`;
const DRY = process.argv.includes('--dry');
const RUN = process.argv.includes('--run');
if (!DRY && !RUN) { console.log('使い方: --dry または --run'); process.exit(0); }

const BRAND = '#1a6b3c';
const ACCENT = '#f59e0b';

function injectDesign(html) {
  let out = html;

  // H2 に border-left スタイルを注入（既にスタイルありはスキップ）
  out = out.replace(/<h2(?![^>]*border-left)([^>]*)>/g,
    `<h2$1 style="border-left:4px solid ${BRAND};padding-left:12px;margin-top:32px;">`);

  // H3 スタイル
  out = out.replace(/<h3(?![^>]*color:#374)([^>]*)>/g,
    `<h3$1 style="color:#374151;margin-top:20px;">`);

  // table の th スタイル（未スタイルのもの）
  out = out.replace(/<th(?![^>]*background)([^>]*)>/g,
    `<th$1 style="background:${BRAND};color:#fff;padding:10px 14px;text-align:left;font-size:14px;">`);

  // ul にスタイル
  out = out.replace(/<ul(?![^>]*padding-left)([^>]*)>/g,
    `<ul$1 style="padding-left:1.4em;line-height:1.9;">`);

  // アフィリエイト免責文を先頭に追加（なければ）
  const disclaimer = '<p style="font-size:12px;color:#888;margin-bottom:8px;">※本記事にはアフィリエイト広告（プロモーション）を含みます。</p>';
  if (!out.includes('アフィリエイト広告') && !out.includes('プロモーション')) {
    out = disclaimer + '\n' + out;
  }

  return out;
}

async function getAllPosts(token) {
  const posts = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${API_BASE}/posts?status=publish&per_page=100&page=${page}&_fields=id,link,title,content`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 400) break;
    if (!res.ok) throw new Error(`API ${res.status}`);
    const batch = await res.json();
    if (!batch.length) break;
    posts.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return posts;
}

async function patchPost(token, postId, title, content) {
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, status: 'publish' }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`PATCH ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

async function main() {
  const token = process.env.WP_ACCESS_TOKEN;
  if (!token) { console.error('WP_ACCESS_TOKEN が未設定です'); process.exit(1); }

  const posts = await getAllPosts(token);
  const needFix = posts.filter(p => {
    const html = p.content?.rendered || '';
    return !html.includes('#1a6b3c');
  });

  console.log(`デザイン未適用: ${needFix.length}件 / 全${posts.length}件\n`);

  for (const post of needFix) {
    const title = post.title?.rendered || '';
    const rawHtml = post.content?.raw || post.content?.rendered || '';
    console.log(`  [ID:${post.id}] ${title.slice(0, 40)}...`);
    if (DRY) continue;

    const newHtml = injectDesign(rawHtml);
    try {
      await patchPost(token, post.id, title, newHtml);
      console.log(`    ✅ 完了`);
    } catch (e) {
      console.error(`    ❌ 失敗: ${e.message}`);
    }
  }

  if (DRY) console.log('\n--dry: 実際の変更なし');
  else console.log('\n全件処理完了');
}

main().catch(e => { console.error(e); process.exit(1); });
