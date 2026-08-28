'use strict';
/**
 * md_to_gutenberg.js
 * MD（HTML混在）→ WordPress Gutenbergブロック形式HTMLへ変換して投稿更新
 *
 * 使い方:
 *   node --env-file=.env.local scripts/md_to_gutenberg.js --id WP-034
 *   node --env-file=.env.local scripts/md_to_gutenberg.js --ids WP-034,WP-035,WP-036
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

if (!IDS.length) { console.log('使い方: --id WP-034 または --ids WP-034,WP-035,WP-036'); process.exit(0); }

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
  return rows.slice(1).map(r => { const o={}; header.forEach((h,i) => o[h]=r[i]??''); return o; });
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
  // コメントヘッダー除去
  md = md.replace(/^<!--[\s\S]*?-->\n?/, '');

  const lines = md.split('\n');
  const output = [];
  let i = 0;

  let lastHtmlBlockContent = ''; // 直前のwp:htmlブロックの内容（H2重複検出用）

  while (i < lines.length) {
    const line = lines[i];

    // wp:image ブロック全体をまとめて処理（中のfigureがwp:htmlで二重包みされるバグ防止）
    if (line.trim().startsWith('<!-- wp:image')) {
      // 偽ブロック（id:9xxx）または相対パス画像はスキップ
      if (line.includes('"id":9') || !line.includes('"id":')) {
        while (i < lines.length && !lines[i].includes('<!-- /wp:image -->')) i++;
        i++;
        continue;
      }
      // 実在するブロックはまとめて出力
      const block = [line];
      i++;
      while (i < lines.length) {
        block.push(lines[i]);
        if (lines[i].includes('<!-- /wp:image -->')) { i++; break; }
        i++;
      }
      output.push(block.join('\n'));
      output.push('');
      continue;
    }
    if (line.trim().startsWith('<!-- wp:')) {
      // wp:html ブロックの内容を記録して重複H2検出に使う
      if (line.trim().startsWith('<!-- wp:html -->')) {
        const htmlLines = [line];
        i++;
        while (i < lines.length) {
          htmlLines.push(lines[i]);
          if (lines[i].includes('<!-- /wp:html -->')) { i++; break; }
          i++;
        }
        lastHtmlBlockContent = htmlLines.join('\n');
        output.push(lastHtmlBlockContent);
        output.push('');
        continue;
      }
      output.push(line);
      i++;
      continue;
    }

    // H1（MDタイトル）はスキップ（WPタイトルとして別送済み）
    if (/^# /.test(line)) { i++; continue; }

    // H2 — 直前のwp:htmlブロックに同一テキストのh2があれば重複スキップ
    if (/^## /.test(line)) {
      const text = inlineConvert(line.replace(/^## /, ''));
      // 直前HTMLブロック内に同じテキストを含むh2があれば重複なのでスキップ
      const stripped = text.replace(/<[^>]+>/g, '').trim();
      if (lastHtmlBlockContent && lastHtmlBlockContent.includes(stripped)) {
        lastHtmlBlockContent = '';
        i++; continue;
      }
      lastHtmlBlockContent = '';
      output.push('<!-- wp:heading -->');
      output.push(`<h2 class="wp-block-heading">${text}</h2>`);
      output.push('<!-- /wp:heading -->');
      output.push('');
      i++; continue;
    }

    // H3
    if (/^### /.test(line)) {
      const text = inlineConvert(line.replace(/^### /, ''));
      output.push('<!-- wp:heading {"level":3} -->');
      output.push(`<h3 class="wp-block-heading">${text}</h3>`);
      output.push('<!-- /wp:heading -->');
      output.push('');
      i++; continue;
    }

    // H4
    if (/^#### /.test(line)) {
      const text = inlineConvert(line.replace(/^#### /, ''));
      output.push('<!-- wp:heading {"level":4} -->');
      output.push(`<h4 class="wp-block-heading">${text}</h4>`);
      output.push('<!-- /wp:heading -->');
      output.push('');
      i++; continue;
    }

    // 区切り線
    if (/^---+$/.test(line.trim())) {
      output.push('<!-- wp:separator -->');
      output.push('<hr class="wp-block-separator has-alpha-channel-opacity"/>');
      output.push('<!-- /wp:separator -->');
      output.push('');
      i++; continue;
    }

    // 箇条書きリスト（連続する- 行をまとめる）
    if (/^- /.test(line)) {
      const items = [];
      while (i < lines.length && /^- /.test(lines[i])) {
        items.push(`<li>${inlineConvert(lines[i].replace(/^- /, ''))}</li>`);
        i++;
      }
      output.push('<!-- wp:list -->');
      output.push('<ul class="wp-block-list">');
      items.forEach(item => output.push(item));
      output.push('</ul>');
      output.push('<!-- /wp:list -->');
      output.push('');
      continue;
    }

    // 番号付きリスト（連続する数字. 行をまとめる）
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li>${inlineConvert(lines[i].replace(/^\d+\. /, ''))}</li>`);
        i++;
      }
      output.push('<!-- wp:list {"ordered":true} -->');
      output.push('<ol class="wp-block-list">');
      items.forEach(item => output.push(item));
      output.push('</ol>');
      output.push('<!-- /wp:list -->');
      output.push('');
      continue;
    }

    // 空行
    if (line.trim() === '') { output.push(''); i++; continue; }

    // HTML開始タグを含む行（生HTML）→ wp:html ブロックで包む（<div, <table, <figure等）
    if (/^<(div|table|figure|p|blockquote|ul|ol|h[1-6]|a )[^>]*>/.test(line.trim()) ||
        /^<\//.test(line.trim()) ||
        line.trim().startsWith('</')) {
      // 生HTMLブロックを収集（空行か次のMD構文まで）
      const htmlLines = [];
      while (i < lines.length) {
        const l = lines[i];
        if (l.trim() === '' && htmlLines.length > 0) {
          // 空行で終了判断：次の行がHTMLかどうか確認
          if (i + 1 < lines.length && (/^<[a-zA-Z]/.test(lines[i+1].trim()) || lines[i+1].trim() === '')) {
            // HTMLが続く or 空行が続く → 空行も含めて続ける
            // ただし次の行がMD構文なら終了
            if (!/^[#\-\d\*]/.test(lines[i+1].trim()) || lines[i+1].trim() === '') {
              htmlLines.push(l);
              i++;
              continue;
            }
          }
          break;
        }
        if (l.trim() !== '' && !/^</.test(l.trim()) && !/^\|/.test(l.trim()) && htmlLines.length > 0) break;
        htmlLines.push(l);
        i++;
      }
      const htmlContent = htmlLines.join('\n').trim();
      if (htmlContent) {
        output.push('<!-- wp:html -->');
        output.push(htmlContent);
        output.push('<!-- /wp:html -->');
        output.push('');
      }
      continue;
    }

    // Markdownテーブル
    if (/^\|/.test(line.trim())) {
      const tableLines = [];
      while (i < lines.length && /^\|/.test(lines[i].trim())) {
        tableLines.push(lines[i]);
        i++;
      }
      // Markdownテーブル→HTMLテーブル変換
      const rows = tableLines.filter(l => !/^\|[-| :]+\|$/.test(l.trim()));
      const htmlTable = ['<table class="wp-block-table"><tbody>'];
      rows.forEach((r, idx) => {
        const cells = r.split('|').filter((_, ci) => ci > 0 && ci < r.split('|').length - 1);
        const tag = idx === 0 ? 'th' : 'td';
        htmlTable.push('<tr>' + cells.map(c => `<${tag}>${inlineConvert(c.trim())}</${tag}>`).join('') + '</tr>');
      });
      htmlTable.push('</tbody></table>');
      output.push('<!-- wp:table -->');
      output.push('<figure class="wp-block-table">');
      htmlTable.forEach(l => output.push(l));
      output.push('</figure>');
      output.push('<!-- /wp:table -->');
      output.push('');
      continue;
    }

    // 通常の段落テキスト
    const text = inlineConvert(line);
    output.push('<!-- wp:paragraph -->');
    output.push(`<p>${text}</p>`);
    output.push('<!-- /wp:paragraph -->');
    output.push('');
    i++;
  }

  return output.join('\n');
}

async function updatePost(token, postId, content, aioseoMeta) {
  const body = { content, status: 'publish', meta: aioseoMeta };
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`update ${res.status}: ${await res.text()}`);
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

const AIOSEO_META = {
  'WP-034': {
    _aioseo_title: 'ローカルゴートの評判・料金・機能まとめ｜MEO×AIO×SNS',
    _aioseo_description: 'ローカルゴートとは何か。AI検索時代に店舗集客で何が変わったか、MEO・AIO・SNS三軸対策の実践方法と料金・評判を徹底解説。',
    _aioseo_keywords: 'ローカルゴート,MEO対策,AI検索,店舗集客',
  },
  'WP-035': {
    _aioseo_title: 'ヤヨイ キギョウカイギョウナビで起業・開業を完全サポート',
    _aioseo_description: 'ヤヨイ キギョウカイギョウナビの特徴・使い方・料金を解説。起業・開業直後の会計・手続きを楽にするクラウドサービスの全貌。',
    _aioseo_keywords: 'ヤヨイ キギョウカイギョウナビ,弥生,起業,開業,会計',
  },
  'WP-036': {
    _aioseo_title: 'ヤヨイ カクテイシンコクで個人事業主の確定申告を楽に',
    _aioseo_description: 'ヤヨイ カクテイシンコクの機能・料金・使い方を徹底解説。青色申告65万円控除対応・帳簿管理を自動化するクラウド会計ソフトの全貌。',
    _aioseo_keywords: 'ヤヨイ カクテイシンコク,弥生,確定申告,青色申告,個人事業主',
  },
};

async function main() {
  const token = process.env.WP_ACCESS_TOKEN;
  if (!token) { console.error('WP_ACCESS_TOKEN 未設定'); process.exit(1); }

  const records = loadQueue();

  for (const id of IDS) {
    const rec = records.find(r => r.id === id);
    if (!rec) { console.log(`[${id}] CSV未登録 → スキップ`); continue; }

    const draftFile = findDraftFile(id);
    if (!draftFile) { console.log(`[${id}] MDファイルなし → スキップ`); continue; }

    const postIdMatch = rec.wp_edit_url && rec.wp_edit_url.match(/post=(\d+)/);
    if (!postIdMatch) { console.log(`[${id}] wp_edit_url未設定 → スキップ`); continue; }
    const postId = postIdMatch[1];

    const md = fs.readFileSync(path.join(DRAFTS_DIR, draftFile), 'utf8');
    const content = mdToGutenberg(md);
    const meta = AIOSEO_META[id] || {};

    console.log(`\n[${id}] post_id:${postId} 変換後文字数:${content.length}`);

    try {
      await updatePost(token, postId, content, meta);
      const dbChars = await verifyContent(token, postId);
      const ratio = Math.round(dbChars / content.length * 100);
      console.log(`  ✅ DB確認済み: ${dbChars}文字（送信比 ${ratio}%）`);
      if (ratio < 80) console.error(`  ❌ DB確認失敗（80%未満）— 再送が必要`);
      else console.log(`  ✅ 送信成功`);
    } catch(e) {
      console.error(`  ❌ [${id}] エラー: ${e.message}`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
