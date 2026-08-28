'use strict';
/**
 * create_and_publish_posts.js
 * WP新規投稿作成 + コンテンツ送信 + featured_media設定
 * 使い方: node --env-file=.env.local scripts/create_and_publish_posts.js --ids WP-037,WP-B05
 */

const fs = require('fs');
const path = require('path');

const SITE = 'ainetbiz.com';
const API_BASE = `https://public-api.wordpress.com/wp/v2/sites/${SITE}`;
const QUEUE_FILE = path.join(__dirname, '..', 'products', 'revenue-intelligence-os', 'data', 'wordpress_posts_queue.csv');
const DRAFTS_DIR = path.join(__dirname, '..', 'products', 'revenue-intelligence-os', 'data', 'wp_drafts');

const IDS = (() => {
  const i = process.argv.indexOf('--ids');
  if (i >= 0) return process.argv[i+1].split(',');
  const j = process.argv.indexOf('--id');
  if (j >= 0) return [process.argv[j+1]];
  return [];
})();
if (!IDS.length) { console.log('使い方: --id WP-037 または --ids WP-037,WP-B05'); process.exit(0); }

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (const rawLine of text.split(/\r\n|\n/)) {
    if (!inQuotes && (rawLine.startsWith('#') || rawLine.trim() === '')) continue;
    let i = 0;
    if (!inQuotes) { row = []; field = ''; }
    while (i < rawLine.length) {
      const c = rawLine[i];
      if (inQuotes) {
        if (c === '"') { if (rawLine[i+1] === '"') { field += '"'; i+=2; continue; } inQuotes=false; i++; continue; }
        field += c; i++; continue;
      }
      if (c === '"') { inQuotes=true; i++; continue; }
      if (c === ',') { row.push(field); field=''; i++; continue; }
      field += c; i++;
    }
    if (inQuotes) { field += '\n'; continue; }
    row.push(field); rows.push(row);
  }
  return rows;
}

function loadQueue() {
  const raw = fs.readFileSync(QUEUE_FILE, 'utf8');
  const rows = parseCsv(raw);
  const header = rows[0];
  return { header, records: rows.slice(1).map(r => { const o={}; header.forEach((h,i) => o[h]=r[i]??''); return o; }) };
}

function findDraftFile(id) {
  return fs.readdirSync(DRAFTS_DIR).find(f => (f.startsWith(`${id}_`) || f === `${id}.md`) && f.endsWith('.md'));
}

function inlineConvert(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

function mdToGutenberg(md) {
  md = md.replace(/^<!--[\s\S]*?-->\n?/, '');
  const lines = md.split('\n');
  const output = [];
  let i = 0;
  let lastHtmlBlockContent = '';

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('<!-- wp:image')) {
      if (line.includes('"id":9') || !line.includes('"id":')) {
        while (i < lines.length && !lines[i].includes('<!-- /wp:image -->')) i++;
        i++; continue;
      }
      const block = [line]; i++;
      while (i < lines.length) {
        block.push(lines[i]);
        if (lines[i].includes('<!-- /wp:image -->')) { i++; break; }
        i++;
      }
      output.push(block.join('\n')); output.push(''); continue;
    }
    if (line.trim().startsWith('<!-- wp:')) {
      if (line.trim().startsWith('<!-- wp:html -->')) {
        const htmlLines = [line]; i++;
        while (i < lines.length) {
          htmlLines.push(lines[i]);
          if (lines[i].includes('<!-- /wp:html -->')) { i++; break; }
          i++;
        }
        lastHtmlBlockContent = htmlLines.join('\n');
        output.push(lastHtmlBlockContent); output.push(''); continue;
      }
      output.push(line); i++; continue;
    }
    if (/^# /.test(line)) { i++; continue; }
    if (/^## /.test(line)) {
      const text = inlineConvert(line.replace(/^## /, ''));
      const stripped = text.replace(/<[^>]+>/g, '').trim();
      if (lastHtmlBlockContent && lastHtmlBlockContent.includes(stripped)) {
        lastHtmlBlockContent = ''; i++; continue;
      }
      lastHtmlBlockContent = '';
      output.push('<!-- wp:heading -->');
      output.push(`<h2 class="wp-block-heading">${text}</h2>`);
      output.push('<!-- /wp:heading -->'); output.push('');
      i++; continue;
    }
    if (/^### /.test(line)) {
      const text = inlineConvert(line.replace(/^### /, ''));
      output.push('<!-- wp:heading {"level":3} -->');
      output.push(`<h3 class="wp-block-heading">${text}</h3>`);
      output.push('<!-- /wp:heading -->'); output.push('');
      i++; continue;
    }
    if (/^#### /.test(line)) {
      const text = inlineConvert(line.replace(/^#### /, ''));
      output.push('<!-- wp:heading {"level":4} -->');
      output.push(`<h4 class="wp-block-heading">${text}</h4>`);
      output.push('<!-- /wp:heading -->'); output.push('');
      i++; continue;
    }
    if (/^---+$/.test(line.trim())) {
      output.push('<!-- wp:separator -->');
      output.push('<hr class="wp-block-separator has-alpha-channel-opacity"/>');
      output.push('<!-- /wp:separator -->'); output.push('');
      i++; continue;
    }
    if (/^- /.test(line)) {
      const items = [];
      while (i < lines.length && /^- /.test(lines[i])) {
        items.push(`<li>${inlineConvert(lines[i].replace(/^- /, ''))}</li>`); i++;
      }
      output.push('<!-- wp:list -->'); output.push('<ul class="wp-block-list">');
      items.forEach(item => output.push(item));
      output.push('</ul>'); output.push('<!-- /wp:list -->'); output.push('');
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li>${inlineConvert(lines[i].replace(/^\d+\. /, ''))}</li>`); i++;
      }
      output.push('<!-- wp:list {"ordered":true} -->'); output.push('<ol class="wp-block-list">');
      items.forEach(item => output.push(item));
      output.push('</ol>'); output.push('<!-- /wp:list -->'); output.push('');
      continue;
    }
    if (line.trim() === '') { output.push(''); i++; continue; }
    if (/^<(div|table|figure|p|blockquote|ul|ol|h[1-6]|a )[^>]*>/.test(line.trim()) ||
        /^<\//.test(line.trim()) || line.trim().startsWith('</')) {
      const htmlLines = [];
      while (i < lines.length) {
        const l = lines[i];
        if (l.trim() === '' && htmlLines.length > 0) {
          if (i + 1 < lines.length && (/^<[a-zA-Z]/.test(lines[i+1].trim()) || lines[i+1].trim() === '')) {
            if (!/^[#\-\d\*]/.test(lines[i+1].trim()) || lines[i+1].trim() === '') {
              htmlLines.push(l); i++; continue;
            }
          }
          break;
        }
        if (l.trim() !== '' && !/^</.test(l.trim()) && !/^\|/.test(l.trim()) && htmlLines.length > 0) break;
        htmlLines.push(l); i++;
      }
      const htmlContent = htmlLines.join('\n').trim();
      if (htmlContent) {
        output.push('<!-- wp:html -->'); output.push(htmlContent);
        output.push('<!-- /wp:html -->'); output.push('');
      }
      continue;
    }
    if (/^\|/.test(line.trim())) {
      const tableLines = [];
      while (i < lines.length && /^\|/.test(lines[i].trim())) { tableLines.push(lines[i]); i++; }
      const rows = tableLines.filter(l => !/^\|[-| :]+\|$/.test(l.trim()));
      const htmlTable = ['<table class="wp-block-table"><tbody>'];
      rows.forEach((r, idx) => {
        const cells = r.split('|').filter((_, ci) => ci > 0 && ci < r.split('|').length - 1);
        const tag = idx === 0 ? 'th' : 'td';
        htmlTable.push('<tr>' + cells.map(c => `<${tag}>${inlineConvert(c.trim())}</${tag}>`).join('') + '</tr>');
      });
      htmlTable.push('</tbody></table>');
      output.push('<!-- wp:table -->'); output.push('<figure class="wp-block-table">');
      htmlTable.forEach(l => output.push(l));
      output.push('</figure>'); output.push('<!-- /wp:table -->'); output.push('');
      continue;
    }
    const text = inlineConvert(line);
    output.push('<!-- wp:paragraph -->');
    output.push(`<p>${text}</p>`);
    output.push('<!-- /wp:paragraph -->'); output.push('');
    i++;
  }
  return output.join('\n');
}

// WPタイトル抽出 (H1 or タイトルブロック後のテキスト)
function extractTitle(md, id) {
  // まず # タイトル行を探す
  const h1Match = md.match(/^# (.+)$/m);
  if (h1Match && !h1Match[1].startsWith('WP-')) return h1Match[1].trim();
  // "タイトル" ブロックの直後のテキスト行を探す
  const titleBlockMatch = md.match(/タイトル<\/h2>\s*<\/div>\s*\n([^\n<#]+)/);
  if (titleBlockMatch) return titleBlockMatch[1].trim();
  // フォールバック: IDを使う
  return id;
}

async function createPost(token, title, content, featuredMediaId) {
  const body = {
    title,
    content,
    status: 'publish',
    ...(featuredMediaId ? { featured_media: parseInt(featuredMediaId) } : {}),
  };
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`create ${res.status}: ${await res.text()}`);
  return await res.json();
}

async function verifyContent(token, postId) {
  const res = await fetch(`${API_BASE}/posts/${postId}?context=edit`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`verify ${res.status}`);
  const json = await res.json();
  return (json.content && json.content.raw) ? json.content.raw.length : 0;
}

function updateCsvWpEditUrl(id, postId, publishedUrl) {
  let raw = fs.readFileSync(QUEUE_FILE, 'utf8');
  const lines = raw.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(`${id},`)) {
      const cols = lines[i].split(',');
      // col 12 = wp_edit_url, col 14 = published_url
      cols[12] = `https://wordpress.com/post/ainetbiz.com/${postId}`;
      cols[14] = publishedUrl || '';
      cols[13] = 'published';
      lines[i] = cols.join(',');
      break;
    }
  }
  fs.writeFileSync(QUEUE_FILE, lines.join('\n'), 'utf8');
}

async function main() {
  const token = process.env.WP_ACCESS_TOKEN;
  if (!token) { console.error('WP_ACCESS_TOKEN 未設定'); process.exit(1); }

  const { records } = loadQueue();

  for (const id of IDS) {
    const rec = records.find(r => r.id === id);
    if (!rec) { console.log(`[${id}] CSV未登録 → スキップ`); continue; }

    const draftFile = findDraftFile(id);
    if (!draftFile) { console.log(`[${id}] MDファイルなし → スキップ`); continue; }

    // 既にpost_idがある場合はスキップ
    if (rec.wp_edit_url && rec.wp_edit_url.includes('post=')) {
      console.log(`[${id}] 既にpost_id設定済み → スキップ (${rec.wp_edit_url})`);
      continue;
    }

    const md = fs.readFileSync(path.join(DRAFTS_DIR, draftFile), 'utf8');
    const title = extractTitle(md, id);
    const content = mdToGutenberg(md);
    const featuredMediaId = rec.featured_media_id || '';

    console.log(`\n[${id}] タイトル: ${title}`);
    console.log(`  変換後文字数: ${content.length} / featured_media_id: ${featuredMediaId || 'なし'}`);

    try {
      const post = await createPost(token, title, content, featuredMediaId);
      console.log(`  ✅ 新規投稿作成: post_id=${post.id} URL=${post.link}`);

      const dbChars = await verifyContent(token, post.id);
      const ratio = Math.round(dbChars / content.length * 100);
      console.log(`  ✅ DB確認: ${dbChars}文字（送信比 ${ratio}%）`);
      if (ratio < 80) console.error(`  ❌ DB確認失敗（80%未満）`);
      else console.log(`  ✅ 送信成功`);

      updateCsvWpEditUrl(id, post.id, post.link);
      console.log(`  ✅ CSV更新: wp_edit_url set → post=${post.id}`);
    } catch(e) {
      console.error(`  ❌ [${id}] エラー: ${e.message}`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
