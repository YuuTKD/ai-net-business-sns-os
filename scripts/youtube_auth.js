/**
 * YouTube OAuth2 認証スクリプト（一度だけ実行）
 *
 * 使い方:
 *   node --env-file=.env.local scripts/youtube_auth.js
 *
 * 実行後にブラウザが開くので、ゆうさんのGoogleアカウントで認証してください。
 * リフレッシュトークンが表示されたら .env.local の YOUTUBE_REFRESH_TOKEN に設定してください。
 */

'use strict';

const fs = require('fs');
const http = require('http');
const { execFileSync } = require('child_process');

const PORT = 3456;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPE = 'https://www.googleapis.com/auth/youtube.upload';

function getClientSecrets() {
  // JSONファイルから読む方式（.env.localにパスを設定）
  const jsonPath = process.env.YOUTUBE_CLIENT_SECRET_PATH;
  if (jsonPath) {
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(raw);
    const creds = parsed.installed || parsed.web;
    return { clientId: creds.client_id, clientSecret: creds.client_secret };
  }
  // または .env.local に直接設定
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      '以下のいずれかを .env.local に設定してください:\n' +
      '  YOUTUBE_CLIENT_SECRET_PATH=/path/to/client_secret_xxx.json\n' +
      '  または YOUTUBE_CLIENT_ID + YOUTUBE_CLIENT_SECRET'
    );
  }
  return { clientId, clientSecret };
}

function buildAuthUrl(clientId) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function exchangeCode(clientId, clientSecret, code) {
  const output = execFileSync(
    'curl',
    [
      '-s', '--max-time', '30',
      '-X', 'POST',
      'https://oauth2.googleapis.com/token',
      '--data-urlencode', `client_id=${clientId}`,
      '--data-urlencode', `client_secret=${clientSecret}`,
      '--data-urlencode', `code=${code}`,
      '--data-urlencode', `grant_type=authorization_code`,
      '--data-urlencode', `redirect_uri=${REDIRECT_URI}`,
    ],
    { encoding: 'utf-8' }
  );
  return JSON.parse(output);
}

async function main() {
  const { clientId, clientSecret } = getClientSecrets();

  const authUrl = buildAuthUrl(clientId);
  console.log('\n=== YouTube OAuth2 認証 ===');
  console.log(`\nブラウザで以下のURLを開いてください:\n${authUrl}\n`);

  // macOS: ブラウザを自動的に開く
  try {
    execFileSync('open', [authUrl]);
    console.log('ブラウザを開きました。');
  } catch (_) {
    console.log('（自動でブラウザが開かない場合は上記URLを手動でコピーしてください）');
  }

  console.log(`\nlocalhostポート ${PORT} でコールバック待機中...`);

  await new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      if (url.pathname !== '/callback') {
        res.end('Not found');
        return;
      }

      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.end(`<h1>認証失敗: ${error}</h1>`);
        server.close();
        reject(new Error(`認証エラー: ${error}`));
        return;
      }

      if (!code) {
        res.end('<h1>認証コードが見つかりません</h1>');
        return;
      }

      res.end('<h1>認証成功！このウィンドウを閉じてターミナルをご確認ください。</h1>');
      server.close();

      try {
        console.log('\nトークンを取得中...');
        const tokens = exchangeCode(clientId, clientSecret, code);

        if (tokens.error) {
          reject(new Error(`トークン取得失敗: ${JSON.stringify(tokens)}`));
          return;
        }

        console.log('\n✅ 認証成功！\n');
        console.log('以下を .env.local に追記してください:\n');
        console.log(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log(`\n（access_token は自動更新されるため保存不要です）`);
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    server.listen(PORT, () => {
      console.log(`待機中... ブラウザで認証してください。`);
    });

    server.on('error', (err) => {
      reject(new Error(`サーバーエラー: ${err.message}`));
    });
  });
}

main().catch((err) => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
