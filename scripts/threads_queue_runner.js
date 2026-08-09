/**
 * Threads Queue Runner — @ai_store_lab
 * 「ゆうさん承認済みキュー（threads_posts_queue.csv）」から1件だけ発火する安全装置つきランナー。
 *
 * design/PROPOSAL_THREADS_N8N_AUTO_SCHEDULE.md（PR #76・承認済み）に基づく実装。
 * 新規コンテンツの生成・選定は一切行わない。キューに既に status=approved で
 * 入っている行（＝ゆうさんが事前に文面を見て承認済みのもの）だけを、
 * 古い予定日順に1件ずつ公開する。
 *
 * 安全装置（scheduler-readiness-check の第1層・第2層に対応）:
 *   - auto_post_enabled フラグ（scripts/threads_auto_state.json）
 *     --disable で誰でもいつでも即OFFにできる（off_switch_confirmed）
 *   - 連続2回投稿失敗で自動的に auto_post_enabled=false（fail_stop_enabled）
 *   - トークン疎通確認（GET /me）を投稿前に必ず実施。失敗は「投稿失敗」として扱う
 *   - LINE通知（LINE_NOTIFY_TOKEN）が未設定の場合、--run は無人実行を拒否する
 *     （--allow-no-line-notify を明示した手動実行時のみ例外）
 *   - 1日の投稿本数は daily_limit で固定（デフォルト2、キューのCSVで運用ルールに合わせる）
 *
 * 使い方:
 *   node scripts/threads_queue_runner.js --status
 *   node scripts/threads_queue_runner.js --enable
 *   node scripts/threads_queue_runner.js --disable
 *   node --env-file=.env.local scripts/threads_queue_runner.js --run
 *   node --env-file=.env.local scripts/threads_queue_runner.js --run --allow-no-line-notify   （手動テスト用）
 */

'use strict';

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://graph.threads.net/v1.0';
const STATE_FILE = path.join(__dirname, 'threads_auto_state.json');
const QUEUE_FILE = path.join(
  __dirname,
  '..',
  'products',
  'revenue-intelligence-os',
  'data',
  'threads_posts_queue.csv'
);
const POST_LOG = path.join(__dirname, '..', 'operations', 'threads_post_log.md');

function parseArgs() {
  const a = process.argv.slice(2);
  return {
    status: a.includes('--status'),
    enable: a.includes('--enable'),
    disable: a.includes('--disable'),
    run: a.includes('--run'),
    allowNoLineNotify: a.includes('--allow-no-line-notify'),
    dailyLimit: (() => {
      const i = a.indexOf('--daily-limit');
      return i !== -1 && a[i + 1] ? parseInt(a[i + 1], 10) : null;
    })(),
  };
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return {
      auto_post_enabled: false,
      consecutive_failures: 0,
      daily_limit: 2,
      last_post_date: null,
      posts_today: 0,
    };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

function todayStr() {
  // ローカルタイムゾーン依存を避けるため、実行環境の日付をそのまま使う
  return new Date().toISOString().slice(0, 10);
}

// ---- 簡易CSVパーサー（RFC4180準拠・ダブルクォート/カンマ/エスケープ対応） ----
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const lines = text.split(/\r\n|\n/);
  for (const rawLine of lines) {
    if (!inQuotes && (rawLine.startsWith('#') || rawLine.trim() === '')) {
      continue;
    }
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

async function apiGet(endpoint, params) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Threads API ${res.status}: ${JSON.stringify(json.error || json)}`);
  }
  return json;
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
    throw new Error(`Threads API ${res.status}: ${JSON.stringify(json.error || json)}`);
  }
  return json;
}

const sleep = (sec) => new Promise((r) => setTimeout(r, sec * 1000));

function getToken() {
  const token = process.env.THREADS_ACCESS_TOKEN;
  if (!token) {
    throw new Error('THREADS_ACCESS_TOKEN が未設定です（--env-file=.env.local を付けて実行してください）');
  }
  return token;
}

async function verifyToken() {
  const token = getToken();
  const me = await apiGet('me', { fields: 'id,username', access_token: token });
  return me;
}

async function publishText({ token, text, replyToId, delay = 30 }) {
  const createParams = { media_type: 'TEXT', text, access_token: token };
  if (replyToId) createParams.reply_to_id = replyToId;
  const container = await api('POST', `me/threads`, createParams);
  const creationId = container.id;
  if (delay > 0) await sleep(delay);
  const published = await api('POST', `me/threads_publish`, {
    creation_id: creationId,
    access_token: token,
  });
  const mediaId = published.id;
  let permalink = '(permalink取得失敗)';
  try {
    const info = await apiGet(mediaId, { fields: 'permalink', access_token: token });
    permalink = info.permalink || permalink;
  } catch (_) {}
  return { mediaId, permalink };
}

async function sendLineNotify(message) {
  const token = process.env.LINE_NOTIFY_TOKEN;
  if (!token) {
    console.warn('⚠️  LINE_NOTIFY_TOKEN未設定のため通知をスキップしました（無人運用の必須条件が未達です）');
    return false;
  }
  try {
    const res = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ message }),
    });
    if (!res.ok) {
      console.warn(`⚠️  LINE通知送信に失敗しました（HTTP ${res.status}）`);
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`⚠️  LINE通知送信でエラー: ${e.message}`);
    return false;
  }
}

function appendLog({ id, permalink, replyPermalink }) {
  const stamp = new Date().toISOString();
  const line =
    `\n- [auto] ${stamp} / ${id}\n` +
    `    本投稿: ${permalink}\n` +
    `    リンク返信: ${replyPermalink || '(なし)'}\n`;
  fs.appendFileSync(POST_LOG, line);
}

function printStatus(state, queueInfo) {
  console.log('\n==================== Threads Queue Runner 状態 ====================');
  console.log(`auto_post_enabled : ${state.auto_post_enabled ? '🟢 ON' : '🔴 OFF'}`);
  console.log(`連続失敗回数       : ${state.consecutive_failures}`);
  console.log(`本日の投稿本数     : ${state.posts_today}（上限 ${state.daily_limit}）`);
  console.log(`最終投稿日         : ${state.last_post_date || '(なし)'}`);
  if (queueInfo) {
    console.log(`承認済み未公開件数 : ${queueInfo.approvedCount}`);
    console.log(`次に公開予定       : ${queueInfo.next ? `${queueInfo.next.id}（${queueInfo.next.target_date}）` : '(キューが空)'}`);
  }
  console.log('=====================================================================\n');
}

async function main() {
  const args = parseArgs();
  let state = loadState();

  if (args.enable) {
    state.auto_post_enabled = true;
    state.consecutive_failures = 0;
    saveState(state);
    console.log('🟢 auto_post_enabled を true にしました。');
    return;
  }

  if (args.disable) {
    state.auto_post_enabled = false;
    saveState(state);
    console.log('🔴 auto_post_enabled を false にしました（即OFF）。');
    return;
  }

  if (args.dailyLimit !== null) {
    state.daily_limit = args.dailyLimit;
    saveState(state);
    console.log(`daily_limit を ${args.dailyLimit} に設定しました。`);
  }

  const { header, records } = loadQueue();
  const approved = records.filter((r) => r.status === 'approved');
  approved.sort((a, b) => (a.target_date || '').localeCompare(b.target_date || ''));
  const queueInfo = { approvedCount: approved.length, next: approved[0] || null };

  if (args.status || (!args.run && !args.enable && !args.disable)) {
    printStatus(state, queueInfo);
    return;
  }

  if (!args.run) return;

  // 日付が変わっていたらカウンタをリセット
  const today = todayStr();
  if (state.last_post_date !== today) {
    state.posts_today = 0;
  }

  console.log('\n==================== Threads Queue Runner 実行 ====================');

  if (!state.auto_post_enabled) {
    console.log('🔴 auto_post_enabled=false のため実行しません。--enable で有効化してください。');
    return;
  }

  if (!process.env.LINE_NOTIFY_TOKEN && !args.allowNoLineNotify) {
    console.log(
      '❌ LINE_NOTIFY_TOKEN 未設定のため無人実行を拒否しました。\n' +
        '   （scheduler-readiness-check の必須条件：LINE通知なしで完全無人は不可）\n' +
        '   手動テストの場合のみ --allow-no-line-notify を付けて実行してください。'
    );
    return;
  }

  if (state.posts_today >= state.daily_limit) {
    console.log(`✅ 本日分（${state.daily_limit}本）は投稿済みです。何もしません。`);
    return;
  }

  const next = approved.find((r) => (r.target_date || '') <= today) || null;
  if (!next) {
    console.log('ℹ️  本日公開可能な承認済み投稿がキューにありません（target_dateが未来のみ）。');
    return;
  }

  try {
    console.log(`対象: ${next.id}（${next.related_wp_id}） / 予定日 ${next.target_date}`);
    await verifyToken();

    const token = getToken();
    const main1 = await publishText({ token, text: next.post_text.replace(' / 👉', '\n👉') });
    console.log(`✅ 本投稿 公開: ${main1.permalink}`);

    let replyResult = null;
    if (next.reply_url) {
      replyResult = await publishText({ token, text: next.reply_url, replyToId: main1.mediaId });
      console.log(`✅ リンク返信 公開: ${replyResult.permalink}`);
    }

    // キュー更新
    const idx = records.findIndex((r) => r.id === next.id);
    records[idx].status = 'published';
    records[idx].published_url = main1.permalink;
    records[idx].published_at = new Date().toISOString();
    writeQueue(header, records);

    appendLog({ id: next.id, permalink: main1.permalink, replyPermalink: replyResult?.permalink });

    state.consecutive_failures = 0;
    state.posts_today += 1;
    state.last_post_date = today;
    saveState(state);

    await sendLineNotify(`✅ Threads自動投稿成功: ${next.id}（${next.related_wp_id}）\n${main1.permalink}`);
    console.log('🎉 完了。');
  } catch (e) {
    console.error(`\n❌ 失敗: ${e.message}`);
    state.consecutive_failures += 1;
    let stopped = false;
    if (state.consecutive_failures >= 2) {
      state.auto_post_enabled = false;
      stopped = true;
    }
    saveState(state);
    await sendLineNotify(
      `❌ Threads自動投稿失敗: ${next.id}（連続${state.consecutive_failures}回目）\n${e.message}` +
        (stopped ? '\n🔴 連続失敗のため auto_post_enabled を自動的にOFFにしました。' : '')
    );
    process.exit(1);
  }
}

main();
