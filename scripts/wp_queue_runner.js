/**
 * WordPress Queue Runner — 店主のAI時短メモ（treecosmehome.wordpress.com）
 * 「ゆうさん承認済み記事」をWordPress REST API経由で**下書きとして**作成するツール。
 *
 * 設計方針（Threadsの自動化より慎重）:
 *   - 公開(status=publish)は絶対に行わない。常に status=draft で作成する。
 *   - 最終の公開ボタンは必ずゆうさんがwp-adminで押す。
 *   - 新規コンテンツの生成・判断は行わない。wp_drafts/ に既に用意された
 *     Markdown原稿を、キュー(wordpress_posts_queue.csv)で draft_status=qa_passed
 *     のものだけ対象にする。
 *   - 完了後、Slack（SLACK_WEBHOOK_URL）で「下書きができました」と通知する。
 *   - cron等での無人実行はしない（手動 or Claude Codeセッション内でのみ実行）。
 *
 * 使い方:
 *   node scripts/wp_queue_runner.js --status
 *   node --env-file=.env.local scripts/wp_queue_runner.js --run
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SITE = 'treecosmehome.wordpress.com';
const API_BASE = `https://public-api.wordpress.com/rest/v1.1/sites/${SITE}`;
const QUEUE_FILE = path.join(
  __dirname,
  '..',
  'products',
  'revenue-intelligence-os',
  'data',
  'wordpress_posts_queue.csv'
);
const DRAFTS_DIR = path.join(
  __dirname,
  '..',
  'products',
  'revenue-intelligence-os',
  'data',
  'wp_drafts'
);

function parseArgs() {
  const a = process.argv.slice(2);
  const updateIdx = a.indexOf('--update');
  return {
    status: a.includes('--status'),
    run: a.includes('--run'),
    updateId: updateIdx !== -1 ? a[updateIdx + 1] : null,
  };
}

// ---- 簡易CSVパーサー（threads_queue_runner.js と同じ実装） ----
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
  const files = fs.readdirSync(DRAFTS_DIR);
  const match = files.find((f) => (f.startsWith(`${id}_`) || f === `${id}.md`) && f.endsWith('.md'));
  return match ? path.join(DRAFTS_DIR, match) : null;
}

// Markdown（本リポジトリのwp_drafts記法）→ WordPress用HTMLへの変換
function markdownToHtml(md) {
  // 先頭のHTMLコメント（<!-- ... -->のメタ情報ブロック）を除去
  let body = md.replace(/^<!--[\s\S]*?-->\s*\n+/, '');
  // 先頭のH1（記事タイトル）を除去（タイトルはWP側のtitleフィールドで別送するため）
  body = body.replace(/^#\s+.+\n+/, '');

  const lines = body.split('\n');
  const out = [];
  let inList = false;
  let paraBuf = [];

  const flushPara = () => {
    if (paraBuf.length) {
      out.push('<p>' + inlineFormat(paraBuf.join(' ')) + '</p>');
      paraBuf = [];
    }
  };
  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  function inlineFormat(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === '') {
      flushPara();
      continue;
    }
    if (line === '---') {
      flushPara();
      closeList();
      out.push('<hr>');
      continue;
    }
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      flushPara();
      closeList();
      out.push(`<h2>${inlineFormat(h2[1])}</h2>`);
      continue;
    }
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      flushPara();
      closeList();
      out.push(`<h3>${inlineFormat(h3[1])}</h3>`);
      continue;
    }
    const li = line.match(/^[-|]\s*(.+)/);
    // 表（|区切り）や箇条書き（- ）は簡易的に段落として扱うため、
    // 明示的な "- " の箇条書きのみリスト化する
    const bullet = line.match(/^-\s+(.+)/);
    if (bullet) {
      flushPara();
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inlineFormat(bullet[1])}</li>`);
      continue;
    }
    closeList();
    paraBuf.push(line);
  }
  flushPara();
  closeList();
  return out.join('\n\n');
}

function extractTitle(md) {
  const body = md.replace(/^<!--[\s\S]*?-->\s*\n+/, '');
  const m = body.match(/^#\s+(.+)/);
  return m ? m[1].trim() : null;
}

async function sendSlackNotify(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('⚠️  SLACK_WEBHOOK_URL未設定のため通知をスキップしました');
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
    console.warn(`⚠️  Slack通知エラー: ${e.message}`);
    return false;
  }
}

async function createDraftPost({ token, title, content }) {
  const res = await fetch(`${API_BASE}/posts/new`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ title, content, status: 'draft' }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`WP API ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

// 既存の下書き(draft)を、原稿ファイルの最新内容で上書きする。
// 公開状態(publish)の記事には絶対に使わない（呼び出し側でdraft_statusを確認すること）。
async function updateDraftPost({ token, postId, title, content }) {
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ title, content, status: 'draft' }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`WP API ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

function printStatus(readyRows) {
  console.log('\n==================== WP Queue Runner 状態 ====================');
  console.log(`draft_status=qa_passed（API下書き化待ち）件数: ${readyRows.length}`);
  readyRows.forEach((r) => console.log(`  - ${r.id}: ${r.keyword}`));
  console.log('※ 公開(publish)は行いません。常に下書き(draft)として作成し、公開はゆうさんが行います。');
  console.log('================================================================\n');
}

async function main() {
  const args = parseArgs();
  const { header, records } = loadQueue();
  const ready = records.filter((r) => r.draft_status === 'qa_passed');

  if (args.updateId) {
    const row = records.find((r) => r.id === args.updateId);
    if (!row) {
      console.error(`❌ ${args.updateId}: キューに見つかりません`);
      process.exit(1);
    }
    if (row.draft_status === 'published') {
      console.error(`❌ ${args.updateId}: 公開済み(published)のためこのコマンドでは更新しません`);
      process.exit(1);
    }
    if (!row.wp_edit_url) {
      console.error(`❌ ${args.updateId}: wp_edit_urlが未設定です（まだ下書き未作成）`);
      process.exit(1);
    }
    const postId = row.wp_edit_url.match(/post=(\d+)/)?.[1];
    if (!postId) {
      console.error(`❌ ${args.updateId}: wp_edit_urlからpost IDを取得できません`);
      process.exit(1);
    }
    const filePath = findDraftFile(args.updateId);
    if (!filePath) {
      console.error(`❌ ${args.updateId}: wp_drafts/ に原稿ファイルが見つかりません`);
      process.exit(1);
    }
    const token = process.env.WP_ACCESS_TOKEN;
    if (!token) {
      console.error('❌ WP_ACCESS_TOKEN が未設定です（--env-file=.env.local を付けて実行してください）');
      process.exit(1);
    }
    const md = fs.readFileSync(filePath, 'utf8');
    const title = extractTitle(md);
    const html = markdownToHtml(md);
    console.log(`${args.updateId}: 下書き(post=${postId})を最新原稿で更新中...`);
    await updateDraftPost({ token, postId, title, content: html });
    console.log(`✅ ${args.updateId}: 下書き更新完了 → ${row.wp_edit_url}`);
    return;
  }

  if (args.status || !args.run) {
    printStatus(ready);
    return;
  }

  if (ready.length === 0) {
    console.log('ℹ️  draft_status=qa_passed の記事がありません。何もしません。');
    return;
  }

  const token = process.env.WP_ACCESS_TOKEN;
  if (!token) {
    console.error('❌ WP_ACCESS_TOKEN が未設定です（--env-file=.env.local を付けて実行してください）');
    process.exit(1);
  }

  for (const row of ready) {
    const filePath = findDraftFile(row.id);
    if (!filePath) {
      console.warn(`⚠️  ${row.id}: wp_drafts/ に対応する原稿ファイルが見つかりません。スキップ`);
      continue;
    }
    const md = fs.readFileSync(filePath, 'utf8');
    const title = extractTitle(md);
    if (!title) {
      console.warn(`⚠️  ${row.id}: タイトル（# 見出し）が見つかりません。スキップ`);
      continue;
    }
    const html = markdownToHtml(md);

    try {
      console.log(`${row.id}: 下書き作成中... 「${title}」`);
      const result = await createDraftPost({ token, title, content: html });
      const editUrl = `https://treecosmehome.wordpress.com/wp-admin/post.php?post=${result.ID}&action=edit`;

      const idx = records.findIndex((r) => r.id === row.id);
      records[idx].draft_status = 'draft_saved';
      records[idx].wp_edit_url = editUrl;
      writeQueue(header, records);

      console.log(`✅ ${row.id}: 下書き作成完了 → ${editUrl}`);
      await sendSlackNotify(
        `📝 WordPress下書きができました: 「${title}」\n${editUrl}\n内容確認のうえ、公開はご自身の操作でお願いします。`
      );
    } catch (e) {
      console.error(`❌ ${row.id}: 下書き作成失敗 - ${e.message}`);
      await sendSlackNotify(`❌ WordPress下書き作成に失敗しました: ${row.id}\n${e.message}`);
    }
  }

  console.log('\n🎉 完了。');
}

main();
