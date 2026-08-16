/**
 * 日次メトリクス収集スクリプト（PDCA基盤）
 * Instagram投稿のインプレッション・保存数と、WordPressサイトのアクセス数を
 * 毎日記録し、CSVログに追記する。「インプレッションを稼ぐこと」自体が目的
 * ではなく、WP記事・Brain商品への送客がどれだけ効いているかを追うための
 * データ基盤（design判断はDECISIONS.md参照）。
 *
 * Instagram Insights取得には instagram_business_manage_insights 権限が必要。
 * 未付与の場合はエラーを記録してスキップする（他の収集は継続する）。
 *
 * 使い方:
 *   node --env-file=.env.local scripts/daily_metrics_collector.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const IG_API_BASE = 'https://graph.instagram.com/v21.0';
const WP_SITE = 'treecosmehome.wordpress.com';
const WP_API_BASE = `https://public-api.wordpress.com/rest/v1.1/sites/${WP_SITE}`;

const IG_QUEUE_FILE = path.join(
  __dirname,
  '..',
  'products',
  'revenue-intelligence-os',
  'data',
  'instagram_posts_queue.csv'
);
const METRICS_LOG_FILE = path.join(
  __dirname,
  '..',
  'products',
  'revenue-intelligence-os',
  'data',
  'daily_metrics_log.csv'
);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ---- 簡易CSVパーサー（他スクリプトと同じ実装） ----
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

function loadIgQueue() {
  if (!fs.existsSync(IG_QUEUE_FILE)) return [];
  const raw = fs.readFileSync(IG_QUEUE_FILE, 'utf8');
  const rows = parseCsv(raw);
  const header = rows[0];
  return rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((h, idx) => {
      obj[h] = r[idx] ?? '';
    });
    return obj;
  });
}

function csvEscape(value) {
  const v = String(value ?? '');
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

function appendMetricsRow(row) {
  const header = [
    'date',
    'source',
    'id',
    'metric_impressions',
    'metric_reach',
    'metric_saved',
    'metric_likes',
    'metric_comments',
    'wp_views',
    'wp_visitors',
    'note',
  ];
  if (!fs.existsSync(METRICS_LOG_FILE)) {
    fs.writeFileSync(
      METRICS_LOG_FILE,
      '# daily_metrics_log.csv — Instagram投稿・WordPressサイトの日次メトリクス記録\n' +
        '# PDCA基盤: インプレッションそのものではなく、WP記事・Brain商品への送客効果を追うためのログ\n' +
        header.join(',') +
        '\n'
    );
  }
  const line = header.map((h) => csvEscape(row[h])).join(',');
  fs.appendFileSync(METRICS_LOG_FILE, line + '\n');
}

async function igApiGet(endpoint, params) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) throw new Error('INSTAGRAM_ACCESS_TOKEN未設定');
  const url = new URL(`${IG_API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('access_token', token);
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Instagram API ${res.status}: ${JSON.stringify(json.error || json)}`);
  }
  return json;
}

async function collectInstagramMetrics(today) {
  const rows = loadIgQueue();
  const posted = rows.filter((r) => r.draft_status === 'posted' && r.media_id);
  if (posted.length === 0) {
    console.log('ℹ️  投稿済みInstagram投稿がまだありません（media_id記録なし）。スキップします。');
    return;
  }
  for (const row of posted) {
    try {
      const insights = await igApiGet(`${row.media_id}/insights`, {
        metric: 'impressions,reach,saved,likes,comments',
      });
      const metrics = {};
      (insights.data || []).forEach((m) => {
        metrics[m.name] = m.values?.[0]?.value ?? m.total_value?.value ?? '';
      });
      appendMetricsRow({
        date: today,
        source: 'instagram',
        id: row.id,
        metric_impressions: metrics.impressions ?? '',
        metric_reach: metrics.reach ?? '',
        metric_saved: metrics.saved ?? '',
        metric_likes: metrics.likes ?? '',
        metric_comments: metrics.comments ?? '',
        wp_views: '',
        wp_visitors: '',
        note: '',
      });
      console.log(`✅ ${row.id}: インプレッション取得完了`);
    } catch (e) {
      appendMetricsRow({
        date: today,
        source: 'instagram',
        id: row.id,
        metric_impressions: '',
        metric_reach: '',
        metric_saved: '',
        metric_likes: '',
        metric_comments: '',
        wp_views: '',
        wp_visitors: '',
        note: `ERROR: ${e.message}`,
      });
      console.log(`⚠️  ${row.id}: 取得失敗（${e.message}）`);
    }
  }
}

async function collectWordpressStats(today) {
  const token = process.env.WP_ACCESS_TOKEN;
  if (!token) {
    console.log('⚠️  WP_ACCESS_TOKEN未設定のためWordPress統計をスキップします');
    return;
  }
  try {
    const res = await fetch(`${WP_API_BASE}/stats/summary?period=day&num=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(`WP Stats API ${res.status}: ${JSON.stringify(json)}`);
    }
    appendMetricsRow({
      date: today,
      source: 'wordpress',
      id: 'site_total',
      metric_impressions: '',
      metric_reach: '',
      metric_saved: '',
      metric_likes: '',
      metric_comments: '',
      wp_views: json.views ?? '',
      wp_visitors: json.visitors ?? '',
      note: '',
    });
    console.log(`✅ WordPressサイト統計取得完了（表示数: ${json.views}, 訪問者: ${json.visitors}）`);
  } catch (e) {
    appendMetricsRow({
      date: today,
      source: 'wordpress',
      id: 'site_total',
      metric_impressions: '',
      metric_reach: '',
      metric_saved: '',
      metric_likes: '',
      metric_comments: '',
      wp_views: '',
      wp_visitors: '',
      note: `ERROR: ${e.message}`,
    });
    console.log(`⚠️  WordPress統計取得失敗（${e.message}）`);
  }
}

async function main() {
  const today = todayStr();
  console.log(`\n==================== 日次メトリクス収集 ${today} ====================`);
  await collectInstagramMetrics(today);
  await collectWordpressStats(today);
  console.log('=====================================================================\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
