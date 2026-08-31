'use strict';
/**
 * update_post_design.js
 * MDファイルを読み込み、Gutenberg変換してWP既存記事のcontentを更新する
 * 使い方: node --env-file=.env.local scripts/update_post_design.js --post-id 873 --md WP-034.md
 *         node --env-file=.env.local scripts/update_post_design.js --post-id 873 --md-path /absolute/path.md
 */

const fs = require('fs');
const path = require('path');

const SITE = 'ainetbiz.com';
const API_BASE = `https://public-api.wordpress.com/wp/v2/sites/${SITE}`;
const DRAFTS_DIR = path.join(__dirname, '..', 'products', 'revenue-intelligence-os', 'data', 'wp_drafts');

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
}

const POST_ID = getArg('--post-id');
const MD_NAME = getArg('--md');
const MD_PATH = getArg('--md-path');

if (!POST_ID || (!MD_NAME && !MD_PATH)) {
  console.log('使い方: --post-id <id> --md <filename.md>  または  --post-id <id> --md-path <絶対パス>');
  process.exit(0);
}

function inlineConvert(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="width:100%;max-width:100%;height:auto;display:block;border-radius:8px;margin:16px 0;">')
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
        output.push('<!-- wp:html -->');
        output.push(`<div style="max-width:750px;margin-left:auto;margin-right:auto;">${htmlContent}</div>`);
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
    // Markdown image syntax: ![alt](url)
    if (/^!\[/.test(line.trim())) {
      const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (imgMatch) {
        const alt = imgMatch[1], src = imgMatch[2];
        output.push('<!-- wp:html -->');
        output.push(`<div style="max-width:750px;margin-left:auto;margin-right:auto;"><figure style="width:100%;margin:20px 0;"><img src="${src}" alt="${alt}" style="width:100%;max-width:100%;height:auto;display:block;border-radius:8px;"></figure></div>`);
        output.push('<!-- /wp:html -->'); output.push('');
        i++; continue;
      }
    }
    const text = inlineConvert(line);
    output.push('<!-- wp:paragraph -->');
    output.push(`<p>${text}</p>`);
    output.push('<!-- /wp:paragraph -->'); output.push('');
    i++;
  }
  return output.join('\n');
}

async function main() {
  const token = process.env.WP_ACCESS_TOKEN;
  if (!token) { console.error('WP_ACCESS_TOKEN 未設定'); process.exit(1); }

  const mdFile = MD_PATH || path.join(DRAFTS_DIR, MD_NAME);
  if (!fs.existsSync(mdFile)) {
    console.error(`MDファイルが見つかりません: ${mdFile}`);
    process.exit(1);
  }

  const md = fs.readFileSync(mdFile, 'utf8');
  const content = mdToGutenberg(md);

  console.log(`post_id: ${POST_ID}`);
  console.log(`MDファイル: ${mdFile}`);
  console.log(`変換後文字数: ${content.length}`);

  const res = await fetch(`${API_BASE}/posts/${POST_ID}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ 更新失敗 ${res.status}: ${err}`);
    process.exit(1);
  }

  const json = await res.json();
  console.log(`✅ 更新完了: ${json.link}`);

  // DBから確認
  const verify = await fetch(`${API_BASE}/posts/${POST_ID}?context=edit`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const vj = await verify.json();
  const dbChars = vj.content?.raw?.length || 0;
  const ratio = Math.round(dbChars / content.length * 100);
  console.log(`✅ DB確認: ${dbChars}文字 (送信比 ${ratio}%)`);
}

main().catch(e => { console.error(e); process.exit(1); });
