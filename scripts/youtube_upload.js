/**
 * YouTube Shorts 自動アップロードスクリプト
 *
 * 使い方:
 *   node --env-file=.env.local scripts/youtube_upload.js
 *
 * 必要な .env.local 設定:
 *   YOUTUBE_CLIENT_SECRET_PATH=/path/to/client_secret_xxx.json  （推奨）
 *   または YOUTUBE_CLIENT_ID + YOUTUBE_CLIENT_SECRET
 *   YOUTUBE_REFRESH_TOKEN=...  （youtube_auth.js で取得）
 *
 * キューファイル: products/revenue-intelligence-os/data/youtube_shorts_queue.csv
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');
const QUEUE_PATH = path.join(REPO_ROOT, 'products', 'revenue-intelligence-os', 'data', 'youtube_shorts_queue.json');
const UPLOAD_LOG = path.join(REPO_ROOT, 'operations', 'youtube_upload_log.md');
const HEADERS_TMP = '/tmp/yt_upload_headers.txt';

function getClientSecrets() {
  const jsonPath = process.env.YOUTUBE_CLIENT_SECRET_PATH;
  if (jsonPath) {
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(raw);
    const creds = parsed.installed || parsed.web;
    return { clientId: creds.client_id, clientSecret: creds.client_secret };
  }
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('YOUTUBE_CLIENT_SECRET_PATH または YOUTUBE_CLIENT_ID + YOUTUBE_CLIENT_SECRET を .env.local に設定してください');
  }
  return { clientId, clientSecret };
}

function getRefreshToken() {
  const token = process.env.YOUTUBE_REFRESH_TOKEN;
  if (!token) throw new Error('YOUTUBE_REFRESH_TOKEN が .env.local に設定されていません（youtube_auth.js で取得してください）');
  return token;
}

function refreshAccessToken(clientId, clientSecret, refreshToken) {
  const output = execFileSync(
    'curl',
    [
      '-s', '--max-time', '30',
      '-X', 'POST',
      'https://oauth2.googleapis.com/token',
      '--data-urlencode', `client_id=${clientId}`,
      '--data-urlencode', `client_secret=${clientSecret}`,
      '--data-urlencode', `refresh_token=${refreshToken}`,
      '--data-urlencode', `grant_type=refresh_token`,
    ],
    { encoding: 'utf-8' }
  );
  const json = JSON.parse(output);
  if (!json.access_token) throw new Error(`トークンリフレッシュ失敗: ${output.slice(0, 200)}`);
  return json.access_token;
}

function loadQueue() {
  return JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf-8'));
}

function saveQueue(rows) {
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(rows, null, 2) + '\n');
}

function initiateResumableUpload(accessToken, metadata) {
  const metaJson = JSON.stringify(metadata);
  const fileSize = metadata._fileSize;
  delete metadata._fileSize;

  if (fs.existsSync(HEADERS_TMP)) fs.unlinkSync(HEADERS_TMP);

  execFileSync(
    'curl',
    [
      '-s', '--max-time', '30',
      '-X', 'POST',
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      '-H', `Authorization: Bearer ${accessToken}`,
      '-H', 'Content-Type: application/json; charset=UTF-8',
      '-H', 'X-Upload-Content-Type: video/mp4',
      '-H', `X-Upload-Content-Length: ${fileSize}`,
      '-d', metaJson,
      '-D', HEADERS_TMP,
      '-o', '/dev/null',
    ],
    { encoding: 'utf-8' }
  );

  const headers = fs.readFileSync(HEADERS_TMP, 'utf-8');
  const locationMatch = headers.match(/^[Ll]ocation:\s*(.+)$/m);
  if (!locationMatch) throw new Error(`Locationヘッダーが見つかりません:\n${headers.slice(0, 500)}`);
  return locationMatch[1].trim();
}

function uploadFile(locationUrl, filePath, fileSize) {
  const output = execFileSync(
    'curl',
    [
      '-s', '--max-time', '600',
      '-X', 'PUT',
      locationUrl,
      '-H', 'Content-Type: video/mp4',
      '-H', `Content-Length: ${fileSize}`,
      '--upload-file', filePath,
    ],
    { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10, timeout: 620000 }
  );
  const json = JSON.parse(output);
  if (json.error) throw new Error(`YouTube API エラー: ${JSON.stringify(json.error)}`);
  return json;
}

function appendLog(line) {
  fs.appendFileSync(UPLOAD_LOG, line + '\n');
}

async function main() {
  console.log('=== YouTube Shorts 自動アップロード ===');

  const { clientId, clientSecret } = getClientSecrets();
  const refreshToken = getRefreshToken();

  console.log('1. アクセストークン取得中...');
  const accessToken = refreshAccessToken(clientId, clientSecret, refreshToken);
  console.log('   OK');

  const rows = loadQueue();
  const pending = rows.filter((r) => r.status === 'pending');

  if (pending.length === 0) {
    console.log('キューにpendingのアイテムがありません。');
    return;
  }

  const item = pending[0];
  const filePath = path.join(REPO_ROOT, item.file_path);

  if (!fs.existsSync(filePath)) {
    throw new Error(`動画ファイルが見つかりません: ${filePath}`);
  }

  const fileSize = fs.statSync(filePath).size;
  console.log(`2. アップロード対象: ${item.video_id} (${(fileSize / 1024 / 1024).toFixed(1)}MB)`);
  console.log(`   タイトル: ${item.title}`);

  const metadata = {
    snippet: {
      title: item.title,
      description: item.description,
      tags: Array.isArray(item.tags) ? item.tags : item.tags.split(',').map((t) => t.trim()),
      categoryId: item.category_id || '22',
      defaultLanguage: 'ja',
      defaultAudioLanguage: 'ja',
    },
    status: {
      privacyStatus: 'public',
      selfDeclaredMadeForKids: false,
    },
    _fileSize: fileSize,
  };

  console.log('3. アップロードセッション開始...');
  const locationUrl = initiateResumableUpload(accessToken, metadata);
  console.log('   OK');

  console.log('4. 動画アップロード中（最大10分）...');
  const result = uploadFile(locationUrl, filePath, fileSize);
  const videoId = result.id;
  const youtubeUrl = `https://www.youtube.com/shorts/${videoId}`;
  console.log(`✅ アップロード完了: ${youtubeUrl}`);

  // キューのステータス更新
  const now = new Date().toISOString();
  const updatedRows = rows.map((r) => {
    if (r.video_id === item.video_id) {
      return { ...r, status: 'uploaded', uploaded_at: now, youtube_url: youtubeUrl };
    }
    return r;
  });
  saveQueue(updatedRows);

  appendLog(`- [${now}] ${item.video_id} → ${youtubeUrl}`);
  console.log(`   ログに記録しました。`);
}

main().catch((err) => {
  console.error('❌ アップロード失敗:', err.message || err);
  const now = new Date().toISOString();
  try {
    const rows = loadQueue();
    // 最初のpendingを取得してエラーログ
    const item = rows.find((r) => r.status === 'pending');
    if (item) {
      appendLog(`- [${now}] ${item.video_id} アップロード失敗: ${err.message}`);
    }
  } catch (_) {}
  process.exit(1);
});
