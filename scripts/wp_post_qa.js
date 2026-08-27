'use strict';
/**
 * wp_post_qa.js
 * ainetbiz.com の公開済み記事を全件スキャンし、品質ルール違反を検出する。
 *
 * チェック項目:
 *   [1] デザイン適用済み (#1a6b3c が含まれるか)
 *   [2] アフィリエイト免責文 (アフィリエイト広告)
 *   [3] H2 見出しのスタイル (border-left)
 *   [4] CTAボタンまたはアフィリエイトリンク
 *   [5] 本文が500文字以上
 *
 * 使い方:
 *   node --env-file=.env.local scripts/wp_post_qa.js
 *   node --env-file=.env.local scripts/wp_post_qa.js --slack
 */

const SITE = 'ainetbiz.com';
const API_BASE = `https://public-api.wordpress.com/wp/v2/sites/${SITE}`;
const SEND_SLACK = process.argv.includes('--slack');

const RULES = [
  { id: 'design',      label: 'デザイン適用 (#1a6b3c)',          check: h => h.includes('#1a6b3c') },
  { id: 'disclaimer',  label: 'アフィリエイト免責文',              check: h => h.includes('アフィリエイト広告') || h.includes('プロモーション') },
  { id: 'h2_style',    label: 'H2スタイル (border-left)',         check: h => h.includes('border-left') },
  { id: 'cta_or_link', label: 'CTAまたはアフィリエイトリンク',     check: h => h.includes('af.moshimo') || h.includes('brmk.') || h.includes('▶ 公式サイト') || h.includes('a8.net') || h.includes('rakuten') },
  { id: 'min_length',  label: '本文500文字以上',                   check: h => h.replace(/<[^>]+>/g, '').length >= 500 },
];

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

async function main() {
  const token = process.env.WP_ACCESS_TOKEN;
  if (!token) { console.error('WP_ACCESS_TOKEN が未設定です'); process.exit(1); }

  console.log('📋 ainetbiz.com WP記事QAスキャン開始\n');
  const posts = await getAllPosts(token);
  console.log(`取得: ${posts.length}件\n`);

  const violations = [];

  for (const post of posts) {
    const html = post.content?.rendered || '';
    const title = post.title?.rendered || `post_${post.id}`;
    const failed = RULES.filter(r => !r.check(html));
    if (failed.length > 0) violations.push({ id: post.id, title, url: post.link, failed });
  }

  const okCount = posts.length - violations.length;
  console.log(`✅ 合格: ${okCount}件 / ❌ 違反: ${violations.length}件\n`);

  for (const v of violations) {
    console.log(`  [ID:${v.id}] ${v.title}`);
    console.log(`  URL: ${v.url}`);
    for (const r of v.failed) console.log(`    ❌ ${r.label}`);
    console.log('');
  }

  if (violations.length === 0) console.log('🎉 全件ルール準拠！\n');

  if (SEND_SLACK) {
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) { console.log('SLACK_WEBHOOK_URL未設定'); return; }
    let text;
    if (violations.length === 0) {
      text = `✅ *WP記事QA: 全${posts.length}件OK*\nデザイン・免責・CTAリンク全件確認済み。`;
    } else {
      const lines = violations.map(v =>
        `❌ *${v.title}*\n  ${v.url}\n  違反: ${v.failed.map(r => r.label).join(' / ')}`
      ).join('\n\n');
      text = `⚠️ *WP記事QA違反: ${violations.length}件*\n\n${lines}\n\n修正: \`node --env-file=.env.local scripts/wp_design_patcher.js --run\``;
    }
    await fetch(webhook, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text }) });
    console.log('Slack通知送信済み');
  }

  process.exit(violations.length > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
