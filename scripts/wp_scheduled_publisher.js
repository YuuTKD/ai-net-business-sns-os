/**
 * wp_scheduled_publisher.js
 * wordpress_posts_queue.csv の draft_status = scheduled_YYYY-MM-DD で
 * 日付が今日以前の記事を ainetbiz.com へ自動公開する。
 *
 * 使い方:
 *   node --env-file=.env.local scripts/wp_scheduled_publisher.js --dry   # 確認のみ
 *   node --env-file=.env.local scripts/wp_scheduled_publisher.js --run   # 実際に公開
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SITE = 'ainetbiz.com';
const API_BASE = `https://public-api.wordpress.com/wp/v2/sites/${SITE}`;
const QUEUE_FILE = path.join(__dirname, '..', 'products', 'revenue-intelligence-os', 'data', 'wordpress_posts_queue.csv');
const DRAFTS_DIR = path.join(__dirname, '..', 'products', 'revenue-intelligence-os', 'data', 'wp_drafts');

const TODAY = new Date().toISOString().slice(0, 10);
const DRY = process.argv.includes('--dry');
const RUN = process.argv.includes('--run');

if (!DRY && !RUN) {
  console.log('使い方: --dry（確認） または --run（実行）');
  process.exit(0);
}

// ---- CSV パーサー ----
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
        if (c === '"') {
          if (rawLine[i + 1] === '"') { field += '"'; i += 2; continue; }
          inQuotes = false; i++; continue;
        }
        field += c; i++; continue;
      }
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ',') { row.push(field); field = ''; i++; continue; }
      field += c; i++;
    }
    if (inQuotes) { field += '\n'; continue; }
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function loadQueue() {
  const raw = fs.readFileSync(QUEUE_FILE, 'utf8');
  const rows = parseCsv(raw);
  const header = rows[0];
  const records = rows.slice(1).map(r => {
    const obj = {};
    header.forEach((h, i) => { obj[h] = r[i] ?? ''; });
    return obj;
  });
  return { header, records, raw };
}

function writeQueue(header, records, rawOrig) {
  const comments = rawOrig.split(/\r\n|\n/).filter(l => l.startsWith('#')).join('\n');
  const lines = [comments, '#', header.join(',')];
  for (const rec of records) lines.push(header.map(h => csvEscape(rec[h])).join(','));
  fs.writeFileSync(QUEUE_FILE, lines.join('\n') + '\n');
}

function findDraftFile(id) {
  const files = fs.readdirSync(DRAFTS_DIR);
  const m = files.find(f => (f.startsWith(`${id}_`) || f === `${id}.md`) && f.endsWith('.md'));
  return m ? path.join(DRAFTS_DIR, m) : null;
}

// ---- Markdown → HTML ----
// デザイン定数
const BRAND_COLOR = '#1a6b3c';        // サイトブランドグリーン
const ACCENT_COLOR = '#f59e0b';       // CTA アクセントオレンジ
const BOX_BG = '#f0faf4';            // イントロボックス背景
const TABLE_HEAD_BG = '#1a6b3c';     // テーブルヘッダー背景

function designIntroBox(content) {
  return `<div style="background:${BOX_BG};border-left:4px solid ${BRAND_COLOR};padding:16px 20px;margin:20px 0;border-radius:4px;font-size:15px;line-height:1.7;">${content}</div>`;
}

function designCtaButton(text, url) {
  return `<div style="text-align:center;margin:28px 0;">` +
    `<a href="${url}" target="_blank" rel="noopener" style="display:inline-block;background:${ACCENT_COLOR};color:#fff;font-weight:bold;font-size:16px;padding:14px 32px;border-radius:6px;text-decoration:none;letter-spacing:0.03em;">` +
    `${text}` +
    `</a></div>`;
}

function designCallout(content) {
  return `<div style="background:#fff8e1;border:1px solid #f59e0b;border-radius:6px;padding:14px 18px;margin:18px 0;font-size:14px;line-height:1.7;">${content}</div>`;
}

function markdownToHtml(md) {
  // コメントブロックと免責行を除去してからH1を除去（位置に依存しない）
  let body = md.replace(/^<!--[\s\S]*?-->\s*\n+/, '');
  body = body.replace(/^[^\n]*アフィリエイト[^\n]*\n+/, ''); // 免責行除去
  body = body.replace(/^#\s+.+\n+/m, '');                   // H1除去（先頭でなくてもOK）

  // アフィリエイトリンクを抽出（CTAボタン用）
  const affiliateLinks = [];
  body = body.replace(/\[([^\]]+)\]\((https?:\/\/af\.[^\s)]+|https?:\/\/brmk\.[^\s)]+)\)/g, (_, text, url) => {
    affiliateLinks.push({ text, url });
    return `[${text}](${url})`;
  });

  const lines = body.split('\n');
  const out = [];
  let inList = false, inOl = false, paraBuf = [];
  let firstH2Done = false;

  const flushPara = () => { if (paraBuf.length) { out.push('<p>' + inline(paraBuf.join(' ')) + '</p>'); paraBuf = []; } };
  const closeList = () => {
    if (inList) { out.push('</ul>'); inList = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };

  function inline(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:3px;font-size:0.9em;">$1</code>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, `<a href="$2" target="_blank" rel="noopener" style="color:${BRAND_COLOR};text-decoration:underline;">$1</a>`);
  }

  function parseRow(line) {
    if (!/^\|.*\|$/.test(line)) return null;
    return line.slice(1, -1).split('|').map(c => c.trim());
  }

  // アフィリエイト免責を先頭に追加
  out.push('<p style="font-size:12px;color:#888;margin-bottom:8px;">※本記事にはアフィリエイト広告（プロモーション）を含みます。</p>');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { flushPara(); i++; continue; }
    // 免責行をスキップ（除去済みでも念のため）
    if (line.includes('アフィリエイト') && line.includes('含みます')) { i++; continue; }
    if (line === '---') { flushPara(); closeList(); out.push('<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">'); i++; continue; }
    const img = line.match(/^!\[([^\]]*)\]\((\S+)\)$/);
    if (img) { flushPara(); closeList(); out.push(`<p><img src="${img[2]}" alt="${img[1]}" style="max-width:100%;height:auto;border-radius:6px;" /></p>`); i++; continue; }
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      flushPara(); closeList();
      // 最初のH2の前にイントロボックスを挿入
      if (!firstH2Done && out.length > 1) {
        // 直前のpタグ群をイントロボックスにまとめる
        firstH2Done = true;
      }
      out.push(`<h2 style="border-left:4px solid ${BRAND_COLOR};padding-left:12px;margin-top:32px;">${inline(h2[1])}</h2>`);
      i++; continue;
    }
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) { flushPara(); closeList(); out.push(`<h3 style="color:#374151;margin-top:20px;">${inline(h3[1])}</h3>`); i++; continue; }
    const h4 = line.match(/^####\s+(.+)/);
    if (h4) { flushPara(); closeList(); out.push(`<h4 style="color:#6b7280;margin-top:16px;">${inline(h4[1])}</h4>`); i++; continue; }
    const hcells = parseRow(line);
    if (hcells) {
      const sep = i + 1 < lines.length ? parseRow(lines[i + 1].trim()) : null;
      if (sep && sep.every(c => /^:?-+:?$/.test(c))) {
        flushPara(); closeList();
        const thead = `<tr>${hcells.map(c => `<th style="background:${TABLE_HEAD_BG};color:#fff;padding:10px 14px;text-align:left;font-size:14px;">${inline(c)}</th>`).join('')}</tr>`;
        const tbody = [];
        let j = i + 2;
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

  // アフィリエイトリンクがあればCTAボタンを末尾に追加
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

async function publishToWP(token, title, content, postId = null) {
  const url = postId ? `${API_BASE}/posts/${postId}` : `${API_BASE}/posts`;
  const method = postId ? 'POST' : 'POST'; // WordPress.com REST API は UPDATE も POST
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, status: 'publish' }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`WP API ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

async function main() {
  const token = process.env.WP_ACCESS_TOKEN;
  if (!token) { console.error('WP_ACCESS_TOKEN が未設定です'); process.exit(1); }

  const { header, records, raw } = loadQueue();

  // scheduled_YYYY-MM-DD で日付 ≤ 今日のレコードを抽出
  const targets = records.filter(r => {
    const m = r.draft_status?.match(/^scheduled_(\d{4}-\d{2}-\d{2})$/);
    return m && m[1] <= TODAY;
  });

  if (!targets.length) {
    console.log(`[${TODAY}] 公開対象なし`);
    process.exit(0);
  }

  console.log(`[${TODAY}] 公開対象: ${targets.map(r => r.id).join(', ')}`);

  if (DRY) {
    for (const r of targets) {
      const f = findDraftFile(r.id);
      console.log(`  ${r.id}: ${r.keyword} → ファイル: ${f ? path.basename(f) : 'NOT FOUND'}`);
    }
    console.log('--dry モード: 実際の公開は行いません');
    return;
  }

  const results = [];
  for (const rec of targets) {
    const draftFile = findDraftFile(rec.id);
    if (!draftFile) { console.error(`[${rec.id}] Markdownファイルが見つかりません`); continue; }

    const md = fs.readFileSync(draftFile, 'utf8');
    const title = extractTitle(md);
    if (!title) { console.error(`[${rec.id}] タイトル抽出失敗`); continue; }

    const content = markdownToHtml(md);
    console.log(`[${rec.id}] 公開中: ${title}`);

    try {
      const result = await publishToWP(token, title, content);
      const url = result.link || result.URL || result.url || '';
      console.log(`[${rec.id}] 公開完了: ${url}`);
      rec.draft_status = 'published';
      rec.published_url = url;
      rec.published_at = TODAY;
      results.push({ id: rec.id, title, url });
    } catch (e) {
      console.error(`[${rec.id}] 公開エラー: ${e.message}`);
    }
  }

  writeQueue(header, records, raw);

  if (results.length) {
    console.log('\n=== 公開完了 ===');
    for (const r of results) console.log(`${r.id}: ${r.url}`);

    // Slack通知（SLACK_WEBHOOK_URL が設定されていれば）
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (webhook) {
      const text = results.map(r => `✅ *${r.id}* 公開: ${r.url}`).join('\n');
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `📝 WP自動公開完了（${TODAY}）\n${text}` }),
      }).catch(e => console.error('Slack通知エラー:', e.message));
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
