'use strict';
/**
 * wp-article-quality-check 超厳格基準スクリプト
 * DEV_RIO_717 / Skill: wp-article-quality-check
 *
 * 使い方:
 *   node --env-file=.env.local scripts/wp_article_qa_strict.js [--post-id=1234] [--auto-fix] [--slack]
 *
 * オプション:
 *   --post-id=N   : 単一記事チェック（省略時は全公開記事）
 *   --auto-fix    : 自動修正可能な問題を自動修正する
 *   --slack       : Slack通知を送る（SLACK_WEBHOOK_URLが必要）
 */

const SITE = 'ainetbiz.com';
const API = `https://public-api.wordpress.com/wp/v2/sites/${SITE}`;
const token = process.env.WP_ACCESS_TOKEN;
const slackUrl = process.env.SLACK_WEBHOOK_URL;

const args = process.argv.slice(2);
const targetPostId = (args.find(a => a.startsWith('--post-id=')) || '').replace('--post-id=', '') || null;
const autoFix = args.includes('--auto-fix');
const sendSlack = args.includes('--slack');

// ---- チェック関数 ----

function checkArticle(post) {
  const html = post.content?.raw || '';
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
  const charCount = text.length;

  const issues = [];
  const autoFixable = [];

  // === CRITICAL ===
  const c1 = charCount < 500;
  if (c1) issues.push(`[BLOCK:C1] 本文空白: ${charCount}字（基準500字以上）`);

  const c2 = /##\s|\*\*[^*]+\*\*/.test(html);
  if (c2) {
    const samples = html.match(/##\s[^\n<]{0,30}|\*\*[^*]{0,30}\*\*/g)?.slice(0, 2) || [];
    issues.push(`[BLOCK:C2] Markdown生テキスト露出: ${samples.join(' / ')}`);
    autoFixable.push('C2_markdown');
  }

  const c3 = /post_id:\s*\d|type:\s*affiliate|qa_score:|target_keywords:|affiliate_url:/.test(html);
  if (c3) issues.push('[BLOCK:C3] フロントマター露出（post_id/type/qa_score等）');

  const bodyText = html.replace(/<[^>]+>/g, '');
  const c4 = /セルフQA|カテゴリ案|タグ案|DEV_RIO/.test(bodyText);
  if (c4) {
    const samples = bodyText.match(/セルフQA[^\n]{0,20}|カテゴリ案[^\n]{0,20}/g)?.slice(0, 2) || [];
    issues.push(`[BLOCK:C4] 開発コンテンツ露出: ${samples.join(' / ')}`);
  }

  const c5 = /src=["']?(images\/WP-|affiliate_images\/)/.test(html);
  if (c5) {
    const samples = html.match(/src=["']?(images\/WP-[^"'\s>]{0,40})/g)?.slice(0, 2) || [];
    issues.push(`[BLOCK:C5] ローカル画像パス残存: ${samples.join(' / ')}`);
  }

  // CTA内のhref="#"のみカウント（ナビ等の#除外）
  const ctaArea = html.match(/wp-block-button[^]*?<\/div>/g) || [];
  const c6count = ctaArea.filter(s => /href=["']#["']/.test(s)).length;
  // 通常のhref="#"も確認（アフィリ箇所）
  const allPhCount = (html.match(/href=["']#["']/g) || []).length;
  if (allPhCount > 0) issues.push(`[BLOCK:C6] アフィリリンクhref="#"残存: ${allPhCount}件`);

  // === HIGH ===
  const h1fail = charCount < 10000;
  if (h1fail) issues.push(`[REVISE:H1] 文字数${charCount.toLocaleString()}字（基準15,000字・最低10,000字）`);

  const h2count = (html.match(/<h2/g) || []).length;
  const h2fail = h2count < 3;
  if (h2fail) issues.push(`[REVISE:H2] H2見出し${h2count}本（基準8〜15本）`);
  else if (h2count < 8) issues.push(`[WARN:H2] H2見出し${h2count}本（基準8〜15本）`);

  const tableCount = (html.match(/<table/g) || []).length;
  if (tableCount < 2) {
    issues.push(`[REVISE:H3] 比較表${tableCount}個（基準2個以上）`);
  }

  const faqCount = (html.match(/<details/g) || []).length +
                   (html.match(/class="faq/g) || []).length;
  if (faqCount < 10) {
    issues.push(`[REVISE:H4] FAQ${faqCount}問（基準10問以上）`);
    autoFixable.push('H4_faq');
  }

  const ctaCount = (html.match(/wp-block-button__link/g) || []).length +
                   (html.match(/border-radius:50px/g) || []).length;
  if (ctaCount < 3) {
    issues.push(`[REVISE:H5] CTAボタン${ctaCount}個（基準3個: 冒頭・中盤・末尾）`);
    autoFixable.push('H5_cta');
  }

  const h6fail = !post.featured_media || post.featured_media === 0;
  if (h6fail) issues.push('[REVISE:H6] アイキャッチ画像未設定（featured_media=0）');

  const h7fail = !html.includes('linear-gradient');
  if (h7fail) {
    issues.push('[REVISE:H7] H2グラデーション未適用（linear-gradientなし）');
    autoFixable.push('H7_gradient');
  }

  const h8fail = !/(ez-toc|table-of-contents|📋.*目次|目次<\/h)/.test(html);
  if (h8fail) {
    issues.push('[REVISE:H8] TOC（目次）なし');
    autoFixable.push('H8_toc');
  }

  // === MEDIUM ===
  const intLinks = (html.match(/href="https?:\/\/ainetbiz\.com/g) || []).length;
  if (intLinks < 3) issues.push(`[WARN:M1] 内部リンク${intLinks}本（基準3本）`);

  const govLinks = (html.match(/href="https?:\/\/[^"]*\.go\.jp/g) || []).length;
  if (govLinks < 2) issues.push(`[WARN:M2] 政府機関リンク${govLinks}本（基準2本）`);

  // === 判定 ===
  const blockFlags = issues.filter(i => i.startsWith('[BLOCK'));
  const reviseFlags = issues.filter(i => i.startsWith('[REVISE'));
  const warnFlags = issues.filter(i => i.startsWith('[WARN'));

  let verdict;
  if (blockFlags.length > 0) verdict = 'BLOCK';
  else if (reviseFlags.length > 2) verdict = 'REVISE';
  else if (reviseFlags.length > 0 || warnFlags.length > 0) verdict = 'WARN';
  else verdict = 'PASS';

  return {
    post_id: post.id,
    title: post.title?.rendered || '',
    url: post.link || '',
    verdict,
    char_count: charCount,
    h2_count: h2count,
    table_count: tableCount,
    faq_count: faqCount,
    cta_count: ctaCount,
    featured_media: post.featured_media || 0,
    issues,
    autoFixable,
  };
}

// ---- 自動修正関数 ----

function applyAutoFix(html, fixKeys, affiliateUrl) {
  const changes = [];
  const aff = affiliateUrl || '#';

  if (fixKeys.includes('C2_markdown')) {
    const before = html;
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/<!-- wp:paragraph -->\s*<p>##\s+([^<]+)<\/p>\s*<!-- \/wp:paragraph -->/g,
      '<!-- wp:heading {"level":2} --><h2>$1</h2><!-- /wp:heading -->');
    if (html !== before) changes.push('Markdown生テキスト(**太字**・##見出し)を修正');
  }

  if (fixKeys.includes('H7_gradient')) {
    html = html.replace(/<h2(?![^>]*linear-gradient)(?![^>]*style=)[^>]*>/g,
      '<h2 style="background:linear-gradient(135deg,#1a3a5c,#2d6a9f);color:#fff;padding:12px 20px;border-radius:6px;margin:40px 0 16px;">');
    changes.push('H2グラデーション追加');
  }

  if (fixKeys.includes('H8_toc')) {
    const tocBlock = `\n<!-- wp:html -->\n<div style="background:#f0f7ff;border:2px solid #2d6a9f;border-radius:8px;padding:20px 24px;margin:24px 0;">\n<p style="font-weight:bold;color:#1a3a5c;margin:0 0 10px;">📋 目次</p>\n<ul style="margin:0;padding-left:20px;color:#2d6a9f;"></ul>\n</div>\n<!-- /wp:html -->\n`;
    html = tocBlock + html;
    changes.push('TOC（目次）ブロック追加');
  }

  if (fixKeys.includes('H5_cta')) {
    const ctaBtn = `\n<!-- wp:html -->\n<div style="text-align:center;margin:32px 0;">\n<a href="${aff}" rel="nofollow sponsored" style="display:inline-block;background:linear-gradient(135deg,#e74c3c,#c0392b);color:#fff;padding:16px 40px;border-radius:50px;font-weight:bold;font-size:1.1em;text-decoration:none;box-shadow:0 4px 15px rgba(231,76,60,0.4);">▶ 詳細・無料相談はこちら</a>\n</div>\n<!-- /wp:html -->\n`;
    // 冒頭に追加
    html = ctaBtn + html;
    // 末尾に追加
    html = html + ctaBtn;
    changes.push('CTA追加（冒頭・末尾）');
  }

  return { html, changes };
}

// ---- WP更新 ----

async function updatePost(postId, content) {
  const res = await fetch(`${API}/posts/${postId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(`UPDATE ${postId} => ${res.status}`);
  return res.json();
}

// ---- Slack通知 ----

async function notifySlack(text) {
  if (!slackUrl) return;
  await fetch(slackUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}

// ---- メイン ----

async function fetchPosts() {
  if (targetPostId) {
    const res = await fetch(`${API}/posts/${targetPostId}?context=edit`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return [await res.json()];
  }
  let all = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${API}/posts?per_page=50&page=${page}&status=publish&context=edit`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) break;
    const data = await res.json();
    if (!data.length) break;
    all.push(...data);
    if (data.length < 50) break;
  }
  return all;
}

async function main() {
  console.log(`\n=== WP記事超厳格QAチェック ===`);
  console.log(`対象: ${targetPostId ? 'post_id=' + targetPostId : '全記事'}`);
  console.log(`自動修正: ${autoFix ? 'ON' : 'OFF'}\n`);

  const posts = await fetchPosts();
  console.log(`取得: ${posts.length}件\n`);

  const results = [];
  let fixCount = 0;
  let exitCode = 0;

  for (const post of posts) {
    const result = checkArticle(post);
    results.push(result);

    const icon = result.verdict === 'PASS' ? '✅' :
                 result.verdict === 'WARN' ? '⚠️' :
                 result.verdict === 'REVISE' ? '🔧' : '🚫';

    console.log(`${icon} [${result.verdict}] post_id=${result.post_id} "${result.title.substring(0, 40)}"`);
    console.log(`   文字数:${result.char_count} H2:${result.h2_count} CTA:${result.cta_count} FAQ:${result.faq_count} 表:${result.table_count}`);

    if (result.issues.length) {
      result.issues.forEach(i => console.log(`   ${i}`));
    }

    // 自動修正
    if (autoFix && result.autoFixable.length > 0 && result.verdict !== 'BLOCK') {
      try {
        const raw = post.content?.raw || '';
        const { html: fixed, changes } = applyAutoFix(raw, result.autoFixable, null);
        if (changes.length > 0) {
          await updatePost(post.id, fixed);
          console.log(`   🔧 自動修正完了: ${changes.join(' / ')}`);
          fixCount++;
        }
      } catch (e) {
        console.error(`   ❌ 自動修正失敗: ${e.message}`);
      }
    }

    if (result.verdict === 'BLOCK' || result.verdict === 'REVISE') exitCode = 1;
    console.log('');
  }

  // サマリー
  const summary = {
    total: results.length,
    pass: results.filter(r => r.verdict === 'PASS').length,
    warn: results.filter(r => r.verdict === 'WARN').length,
    revise: results.filter(r => r.verdict === 'REVISE').length,
    block: results.filter(r => r.verdict === 'BLOCK').length,
    auto_fixed: fixCount,
  };

  console.log('=== サマリー ===');
  console.log(`✅ PASS: ${summary.pass} / ⚠️ WARN: ${summary.warn} / 🔧 REVISE: ${summary.revise} / 🚫 BLOCK: ${summary.block}`);
  if (fixCount > 0) console.log(`🔧 自動修正: ${fixCount}件`);

  // Slack通知
  if (sendSlack) {
    const problems = results.filter(r => r.verdict === 'BLOCK' || r.verdict === 'REVISE');
    if (problems.length > 0) {
      const msg = `🚨 *WP記事QAチェック結果*\n`
        + `BLOCK: ${summary.block}件 / REVISE: ${summary.revise}件\n`
        + problems.slice(0, 5).map(r =>
            `• [${r.verdict}] ${r.title.substring(0, 30)}\n  ${r.issues.slice(0, 2).join(' / ')}`
          ).join('\n')
        + (problems.length > 5 ? `\n...他${problems.length - 5}件` : '')
        + (fixCount > 0 ? `\n\n🔧 ${fixCount}件を自動修正済み` : '');
      await notifySlack(msg);
    } else {
      await notifySlack(`✅ *WP記事QAチェック: 全${summary.total}件PASS（WARN: ${summary.warn}件）*`);
    }
  }

  process.exit(exitCode);
}

main().catch(e => { console.error(e); process.exit(1); });
