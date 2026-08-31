'use strict';
/**
 * wp_design_patcher.js
 * ainetbiz.com の公開済み記事のうち、インラインCSSデザインが未適用のものを
 * markdownToHtml() で再変換して PATCH する。
 *
 * 使い方:
 *   node --env-file=.env.local scripts/wp_design_patcher.js --dry   # 確認のみ
 *   node --env-file=.env.local scripts/wp_design_patcher.js --run   # 実際に修正
 */

const fs = require('fs');
const path = require('path');

const SITE = 'ainetbiz.com';
const API_BASE = `https://public-api.wordpress.com/wp/v2/sites/${SITE}`;
const QUEUE_FILE = path.join(__dirname, '..', 'products', 'revenue-intelligence-os', 'data', 'wordpress_posts_queue.csv');
const DRAFTS_DIR = path.join(__dirname, '..', 'products', 'revenue-intelligence-os', 'data', 'wp_drafts');

const DRY = process.argv.includes('--dry');
const RUN = process.argv.includes('--run');
if (!DRY && !RUN) { console.log('使い方: --dry（確認） または --run（実行）'); process.exit(0); }

// ---- CSVパーサー ----
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  const lines = text.split(/\r\n|\n/);
  for (const rawLine of lines) {
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
  return rows.slice(1).map(r => {
    const obj = {};
    header.forEach((h, i) => { obj[h] = r[i] ?? ''; });
    return obj;
  });
}

function findDraftFile(id) {
  const files = fs.readdirSync(DRAFTS_DIR);
  const m = files.find(f => (f.startsWith(`${id}_`) || f === `${id}.md`) && f.endsWith('.md'));
  return m ? path.join(DRAFTS_DIR, m) : null;
}

// ---- Markdown → HTML（wp_scheduled_publisher.jsと同一） ----
const BRAND_COLOR = '#1a6b3c';
const ACCENT_COLOR = '#f59e0b';
const BOX_BG = '#f0faf4';
const TABLE_HEAD_BG = '#1a6b3c';

function designCtaButton(text, url) {
  return `<div style="text-align:center;margin:28px 0;"><a href="${url}" target="_blank" rel="noopener" style="display:inline-block;background:${ACCENT_COLOR};color:#fff;font-weight:bold;font-size:16px;padding:14px 32px;border-radius:6px;text-decoration:none;letter-spacing:0.03em;">${text}</a></div>`;
}

function markdownToHtml(md) {
  let body = md.replace(/^<!--[\s\S]*?-->\s*\n+/, '');
  body = body.replace(/^[^\n]*アフィリエイト[^\n]*\n+/, '');
  body = body.replace(/^#\s+.+\n+/m, '');

  const affiliateLinks = [];
  body = body.replace(/\[([^\]]+)\]\((https?:\/\/af\.[^\s)]+|https?:\/\/brmk\.[^\s)]+)\)/g, (_, text, url) => {
    affiliateLinks.push({ text, url }); return `[${text}](${url})`;
  });

  const lines = body.split('\n');
  const out = [];
  let inList = false, inOl = false, paraBuf = [];

  const flushPara = () => { if (paraBuf.length) { out.push('<p>' + inline(paraBuf.join(' ')) + '</p>'); paraBuf = []; } };
  const closeList = () => {
    if (inList) { out.push('</ul>'); inList = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };

  function inline(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, `<code style="background:#f1f5f9;padding:2px 6px;border-radius:3px;font-size:0.9em;">$1</code>`)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, `<a href="$2" target="_blank" rel="noopener" style="color:${BRAND_COLOR};text-decoration:underline;">$1</a>`);
  }

  function parseRow(line) {
    if (!/^\|.*\|$/.test(line)) return null;
    return line.slice(1, -1).split('|').map(c => c.trim());
  }

  out.push('<p style="font-size:12px;color:#888;margin-bottom:8px;">※本記事にはアフィリエイト広告（プロモーション）を含みます。</p>');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { flushPara(); i++; continue; }
    if (line.includes('アフィリエイト') && line.includes('含みます')) { i++; continue; }
    if (line === '---') { flushPara(); closeList(); out.push('<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">'); i++; continue; }
    const img = line.match(/^!\[([^\]]*)\]\((\S+)\)$/);
    if (img) { flushPara(); closeList(); out.push(`<p><img src="${img[2]}" alt="${img[1]}" style="max-width:100%;height:auto;border-radius:6px;" /></p>`); i++; continue; }
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) { flushPara(); closeList(); out.push(`<h2 style="border-left:4px solid ${BRAND_COLOR};padding-left:12px;margin-top:32px;">${inline(h2[1])}</h2>`); i++; continue; }
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) { flushPara(); closeList(); out.push(`<h3 style="color:#374151;margin-top:20px;">${inline(h3[1])}</h3>`); i++; continue; }
    const h4 = line.match(/^####\s+(.+)/);
    if (h4) { flushPara(); closeList(); out.push(`<h4 style="color:#6b7280;margin-top:16px;">${inline(h4[1])}</h4>`); i++; continue; }
    const hcells = parseRow(line);
    if (hcells) {
      const sep = i+1 < lines.length ? parseRow(lines[i+1].trim()) : null;
      if (sep && sep.every(c => /^:?-+:?$/.test(c))) {
        flushPara(); closeList();
        const thead = `<tr>${hcells.map(c => `<th style="background:${TABLE_HEAD_BG};color:#fff;padding:10px 14px;text-align:left;font-size:14px;">${inline(c)}</th>`).join('')}</tr>`;
        const tbody = [];
        let j = i+2;
        while (j < lines.length) {
          const cells = parseRow(lines[j].trim());
          if (!cells) break;
          const isEven = tbody.length % 2 === 1;
          tbody.push(`<tr style="background:${isEven ? '#f9fafb' : '#fff'};">${cells.map(c => `<td style="padding:9px 14px;border-bottom:1px solid #e5e7eb;font-size:14px;">${inline(c)}</td>`).join('')}</tr>`);
          j++;
        }
        out.push(`<div style="overflow-x:auto;margin:20px 0;"><table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;"><thead>${thead}</thead><tbody>${tbody.join('')}</tbody></table></div>`);
        i = j; continue;
      }
    }
    const bullet = line.match(/^[-*]\s+(.+)/);
    if (bullet) {
      flushPara();
      if (!inList) { out.push('<ul style="padding-left:1.4em;line-height:1.9;">'); inList = true; }
      out.push(`<li style="margin-bottom:6px;">${inline(bullet[1])}</li>`);
      i++; continue;
    }
    const numBullet = line.match(/^\d+\.\s+(.+)/);
    if (numBullet) {
      flushPara();
      if (!inOl) { out.push('<ol style="padding-left:1.4em;line-height:1.9;">'); inOl = true; }
      out.push(`<li style="margin-bottom:6px;">${inline(numBullet[1])}</li>`);
      i++; continue;
    }
    closeList();
    paraBuf.push(line);
    i++;
  }
  flushPara(); closeList();

  if (affiliateLinks.length > 0) {
    const mainLink = affiliateLinks[affiliateLinks.length - 1];
    out.push(`<div style="margin:32px 0;padding:24px;background:#f0faf4;border-radius:8px;text-align:center;">`);
    out.push(`<p style="font-weight:bold;font-size:16px;margin-bottom:12px;">👇 まずは無料・公式サイトで詳細を確認</p>`);
    out.push(designCtaButton('▶ 公式サイトを見てみる', mainLink.url));
    out.push(`<p style="font-size:12px;color:#888;margin-top:8px;">※成果報酬型広告を利用しています</p>`);
    out.push(`</div>`);
  }
  return out.join('\n\n');
}

function extractTitle(md) {
  const body = md.replace(/^<!--[\s\S]*?-->\s*\n+/, '');
  const m = body.match(/^#\s+(.+)/m);
  return m ? m[1].trim() : null;
}

// ---- WP API ----
async function getPostBySlug(token, slug) {
  const res = await fetch(`${API_BASE}/posts?slug=${encodeURIComponent(slug)}&_fields=id,link,content`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`API ${res.status}: ${JSON.stringify(json)}`);
  return json[0] || null;
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

// URLからslugを抽出
function slugFromUrl(url) {
  const m = url.match(/\/([^/]+)\/?$/);
  return m ? decodeURIComponent(m[1]) : null;
}

async function main() {
  const token = process.env.WP_ACCESS_TOKEN;
  if (!token) { console.error('WP_ACCESS_TOKEN が未設定です'); process.exit(1); }

  const records = loadQueue();
  const targets = records.filter(r =>
    r.draft_status === 'published' &&
    r.published_url && r.published_url.includes('ainetbiz.com')
  );

  console.log(`ainetbiz.com 公開済み記事: ${targets.length}件\n`);

  const toFix = [];

  for (const rec of targets) {
    const draftFile = findDraftFile(rec.id);
    if (!draftFile) {
      console.log(`[${rec.id}] ソースMDなし → スキップ`);
      continue;
    }

    const slug = slugFromUrl(rec.published_url);
    if (!slug) { console.log(`[${rec.id}] slug抽出失敗 → スキップ`); continue; }

    let post;
    try {
      post = await getPostBySlug(token, slug);
    } catch (e) {
      console.log(`[${rec.id}] API取得エラー: ${e.message}`);
      continue;
    }

    if (!post) { console.log(`[${rec.id}] 記事が見つかりません (slug: ${slug})`); continue; }

    const hasDesign = post.content?.rendered?.includes('#1a6b3c') || post.content?.raw?.includes('#1a6b3c');

    if (hasDesign) {
      console.log(`[${rec.id}] ✅ デザイン済み → スキップ`);
    } else {
      console.log(`[${rec.id}] ❌ デザイン未適用 (post_id: ${post.id})`);
      toFix.push({ rec, post, draftFile });
    }
  }

  console.log(`\n修正対象: ${toFix.length}件`);
  if (DRY || toFix.length === 0) return;

  for (const { rec, post, draftFile } of toFix) {
    const md = fs.readFileSync(draftFile, 'utf8');
    const title = extractTitle(md);
    if (!title) { console.error(`[${rec.id}] タイトル抽出失敗`); continue; }
    const content = markdownToHtml(md);
    try {
      await patchPost(token, post.id, title, content);
      console.log(`[${rec.id}] ✅ デザイン適用完了 (post_id: ${post.id})`);
    } catch (e) {
      console.error(`[${rec.id}] PATCH失敗: ${e.message}`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
