/**
 * アフィリエイト自動パイプライン
 *
 * 承認された商材に対して以下を自動実行:
 *   1. Claude API でキーワード・WP記事・Threads投稿文を生成
 *   2. WP下書きファイルを保存（wp_drafts/WP-XXX.md）
 *   3. wordpress_posts_queue.csv に追加（draft_status=qa_pending）
 *   4. threads_posts_queue.csv に3本追加（status=approved → 10:00 cronで自動公開🔥）
 *   5. Slack で完了サマリーを通知
 *
 * 使い方（手動テスト）:
 *   node --env-file=.env.local scripts/affiliate_auto_pipeline.js \
 *     --run \
 *     --program "Relix勤怠｜勤怠管理システムの無料トライアルの申込" \
 *     --url "https://af.moshimo.com/..." \
 *     --network "moshimo" \
 *     --genre "勤怠管理 小規模"
 *
 * 必要な環境変数（.env.local）:
 *   ANTHROPIC_API_KEY  - Claude API キー
 *   SLACK_WEBHOOK_URL  - Slack Incoming Webhook URL
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_DIR = path.join(__dirname, '..');
const CSV_AFFILIATE = path.join(BASE_DIR, 'products/revenue-intelligence-os/data/affiliate_link_library_v2.csv');
const CSV_WP       = path.join(BASE_DIR, 'products/revenue-intelligence-os/data/wordpress_posts_queue.csv');
const CSV_THREADS  = path.join(BASE_DIR, 'products/revenue-intelligence-os/data/threads_posts_queue.csv');
const WP_DRAFTS    = path.join(BASE_DIR, 'products/revenue-intelligence-os/data/wp_drafts');

// ─── CSV ユーティリティ ────────────────────────────────────────

function parseCSVLine(line) {
  const cols = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ',' && !inQ) {
      cols.push(cur); cur = '';
    } else {
      cur += c;
    }
  }
  cols.push(cur);
  return cols;
}

function parseCSV(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const data = lines.filter(l => !l.startsWith('#') && l.trim());
  if (data.length < 2) return { headers: [], rows: [] };
  const headers = data[0].split(',').map(h => h.trim());
  const rows = data.slice(1).map(line => {
    const cols = parseCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, (cols[i] || '').trim()]));
  });
  return { headers, rows };
}

function escapeCSV(value) {
  const s = String(value || '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// ─── アフィリCSVから商材検索 ──────────────────────────────────

function findAffiliate(programName) {
  if (!fs.existsSync(CSV_AFFILIATE)) return null;
  const { rows } = parseCSV(CSV_AFFILIATE);
  // 区切り文字で細かく分割してキーワード抽出
  const norm = programName.toLowerCase().replace(/[｜|・（）()「」【】\s　]/g, ' ');
  const keywords = norm.split(/\s+/).filter(k => k.length > 1);

  let best = null;
  let bestScore = 0;
  for (const row of rows) {
    const name = (row.product_name || '').toLowerCase();
    const aliases = (row.aliases || '').toLowerCase();
    const combined = name + ' ' + aliases;
    const score = keywords.filter(k => combined.includes(k)).length;
    if (score > bestScore) { bestScore = score; best = row; }
  }
  // スコア1以上でマッチとする（メール件名とCSV商材名の表記ゆれを許容）
  return bestScore >= 1 ? best : null;
}

// ─── ID・日付ヘルパー ──────────────────────────────────────────

function getNextWpId() {
  const { rows } = parseCSV(CSV_WP);
  const nums = rows
    .map(r => parseInt((r.id || '').replace('WP-', ''), 10))
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 29;
  return `WP-${String(next).padStart(3, '0')}`;
}

function getNextThreadsSlots(count) {
  const { rows } = parseCSV(CSV_THREADS);
  const nums = rows
    .map(r => parseInt((r.id || '').replace('TQ-', ''), 10))
    .filter(n => !isNaN(n));
  const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 32;

  const dates = rows
    .map(r => r.target_date || '')
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();
  const lastDate = dates.length > 0 ? new Date(dates[dates.length - 1]) : new Date();

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + i + 1);
    return {
      id: `TQ-${String(nextNum + i).padStart(3, '0')}`,
      date: d.toISOString().slice(0, 10),
    };
  });
}

// ─── Claude API ────────────────────────────────────────────────

async function callClaude(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY が .env.local に未設定です');

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    });

    const req = https.request(
      {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) return reject(new Error(parsed.error.message));
            resolve(parsed.content[0].text);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function generateContent(programName, affiliateUrl, networkLabel, genre) {
  const prompt = `あなたは小規模店舗・個人事業主向けSEOアフィリエイト記事ライターです。

以下の商材について、WordPress記事とThreads投稿文を生成し、必ず末尾のJSON形式のみで返してください。

## 商材情報
- 商材名: ${programName}
- アフィリエイトURL: ${affiliateUrl}
- アフィリエイトネットワーク: ${networkLabel}
- ジャンル: ${genre}

## WordPress記事ルール
- 記事タイプ: 悩み解決・使い方記事
- 目標文字数: 2,500〜4,000字（情報密度を優先。水増し禁止）
- 読者: 小規模店舗オーナー・フリーランス・個人事業主
- アフィリエイトリンクは1か所のみ → <a href="${affiliateUrl}" rel="nofollow sponsored" target="_blank">（リンクテキスト）</a>
- 記事冒頭と末尾に必ず記載: ※本記事にはアフィリエイト広告（プロモーション）を含みます。
- 料金・機能の具体値は断定せず「公式サイトで最新情報をご確認ください」と誘導
- 体験談を捏造しない。根拠なき最上級表現（「最高」「ナンバーワン」）を使わない
- Markdown形式で出力（h2/h3見出し・箇条書き・表を適宜使用）

## Threads投稿文ルール（3本）
- 各200字以内
- 末尾に「👉 1コメント目のリンクから」を必ず入れる
- 3本は角度を変える: [1]悩み共感型 [2]ベネフィット訴求型 [3]比較検討中の人向け
- 改行は \\n で表現（JSON内で安全に扱えるよう）
- URLは含めない

## 出力形式（このJSONブロックのみを返す。他の文章は不要）
\`\`\`json
{
  "keyword": "メインキーワード（3〜5語・スペース区切り）",
  "search_intent": "問題解決",
  "article_type": "悩み解決・使い方記事",
  "article": "Markdown形式の記事本文（2500〜4000字）",
  "threads_posts": [
    "Threads投稿文1（悩み共感型）",
    "Threads投稿文2（ベネフィット訴求型）",
    "Threads投稿文3（比較検討中の人向け）"
  ]
}
\`\`\``;

  const raw = await callClaude(prompt);

  // JSONブロックを抽出
  const jsonMatch = raw.match(/```json\s*([\s\S]+?)\s*```/);
  if (!jsonMatch) {
    // フォールバック: 先頭の { から最後の } まで
    const fallback = raw.match(/\{[\s\S]+\}/);
    if (!fallback) throw new Error('Claude APIのレスポンスからJSONを抽出できませんでした');
    return JSON.parse(fallback[0]);
  }
  return JSON.parse(jsonMatch[1]);
}

// ─── Slack ────────────────────────────────────────────────────

async function sendSlack(text) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) { console.log('[Slack skip] SLACK_WEBHOOK_URL未設定'); return; }

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ text });
    const parsed = new URL(webhookUrl);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve(d));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── メインパイプライン ────────────────────────────────────────

async function runPipeline({ programName, affiliateUrl, network, genre }) {
  if (!programName) throw new Error('programName は必須です');

  // CSVから商材データを検索（URLが未指定またはダッシュボードURLの場合）
  const csvRow = findAffiliate(programName);
  const resolvedUrl  = affiliateUrl && !affiliateUrl.includes('pub.a8.net') && !affiliateUrl.includes('af.moshimo.com/af/shop')
    ? affiliateUrl
    : (csvRow ? csvRow.affiliate_url : affiliateUrl || '');
  const resolvedGenre = genre || (csvRow ? csvRow.genre : '');
  const resolvedNetwork = network || (csvRow ? csvRow.network : 'unknown');

  if (!resolvedUrl) {
    throw new Error(`アフィリURLが見つかりません: ${programName}`);
  }

  const networkLabel = resolvedNetwork === 'a8' ? 'A8.net'
    : resolvedNetwork === 'moshimo' ? 'もしもアフィリエイト'
    : resolvedNetwork;
  const today = new Date().toISOString().slice(0, 10);

  console.log(`[Pipeline] 開始: ${programName}`);
  console.log(`[Pipeline] URL: ${resolvedUrl} / ジャンル: ${resolvedGenre}`);

  // 1. Claude API でコンテンツ生成
  console.log('[Pipeline] Claude API でコンテンツ生成中...');
  const content = await generateContent(programName, resolvedUrl, networkLabel, resolvedGenre);
  console.log(`[Pipeline] キーワード: ${content.keyword}`);

  // 2. WP ID・Threads スロット決定
  const wpId = getNextWpId();
  const threadsSlots = getNextThreadsSlots(3);

  // 3. WP下書きファイル保存
  const wordCount = content.article
    .replace(/<[^>]+>/g, '')
    .replace(/[#*`\[\]|]/g, '')
    .trim().length;

  const draftMd = `<!--
${wpId}｜${content.keyword}
記事タイプ: ${content.article_type}（AFFILIATE_ARTICLE_STANDARDS §1a、2,500〜4,000字）
キーワード: ${content.keyword} / search_intent: ${content.search_intent} / article_type: ${content.article_type}
アフィリ: ${networkLabel}（${programName.slice(0, 30)}）
自動生成: affiliate_auto_pipeline.js（${today}）
コンプラ（厳守）:
  - 料金・機能は変動するため具体額を断定せず、公式サイト確認へ誘導（§4.4）。
  - 虚偽の体験談なし（§4.3）。
-->

${content.article}
`;
  const draftPath = path.join(WP_DRAFTS, `${wpId}.md`);
  fs.writeFileSync(draftPath, draftMd);
  console.log(`[Pipeline] WP下書き保存: ${draftPath}`);

  // 4. wordpress_posts_queue.csv に追加
  const wpRow = [
    wpId,
    content.keyword,
    content.search_intent,
    content.article_type,
    '2500',
    '4000',
    String(wordCount),
    networkLabel,
    programName.slice(0, 50),
    '0',
    '0',
    'inserted',
    '',
    'qa_pending',
    '',
    '',
    today,
  ].map(escapeCSV).join(',');
  fs.appendFileSync(CSV_WP, '\n' + wpRow);
  console.log(`[Pipeline] WPキュー追加: ${wpId}`);

  // 5. threads_posts_queue.csv に3本追加（status=approved → cron で自動公開🔥）
  const wpUrlPlaceholder = `（${wpId}公開後に更新）`;
  for (let i = 0; i < 3; i++) {
    const slot = threadsSlots[i];
    const postText = (content.threads_posts[i] || '').replace(/\\n/g, '\n');
    const threadsRow = [
      slot.id,
      wpId,
      networkLabel,
      slot.date,
      postText,
      wpUrlPlaceholder,
      '8',
      'approved',
      '',
      '',
    ].map(escapeCSV).join(',');
    fs.appendFileSync(CSV_THREADS, '\n' + threadsRow);
    console.log(`[Pipeline] Threadsキュー追加: ${slot.id} (${slot.date})`);
  }

  // 6. Slack 通知
  const slackText =
    `🚀 *アフィリ自動パイプライン完了* ✅\n` +
    `提携承認: *${programName.slice(0, 50)}*\n` +
    `ネットワーク: ${networkLabel}\n` +
    `\n` +
    `📝 *WP下書き完了*: \`${wpId}\`（${content.keyword}）\n` +
    `　→ draft_status: qa_pending（公開前にゆうさんの承認をお願いします）\n` +
    `\n` +
    `🔥 *Threads 3本をキューに追加*（集客着火）\n` +
    `　→ ${threadsSlots.map(s => `${s.id}(${s.date})`).join(' / ')}\n` +
    `　→ 毎朝10:00 cron で自動公開されます`;

  await sendSlack(slackText);
  console.log('[Pipeline] Slack通知完了');

  return { wpId, threadsSlots, keyword: content.keyword };
}

module.exports = { runPipeline };

// ─── CLI 直接実行 ─────────────────────────────────────────────

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (!argv.includes('--run')) {
    console.log([
      '使い方:',
      '  node --env-file=.env.local scripts/affiliate_auto_pipeline.js \\',
      '    --run \\',
      '    --program "プログラム名" \\',
      '    --url "アフィリURL" \\',
      '    --network "a8|moshimo" \\',
      '    --genre "ジャンル"',
    ].join('\n'));
    process.exit(0);
  }

  const get = (flag) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : '';
  };

  runPipeline({
    programName: get('--program'),
    affiliateUrl: get('--url'),
    network: get('--network') || 'unknown',
    genre: get('--genre') || '',
  })
    .then((result) => {
      console.log('[Pipeline] 完了:', JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error('[Pipeline] エラー:', err.message);
      process.exit(1);
    });
}
