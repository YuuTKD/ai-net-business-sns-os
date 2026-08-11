// scripts/send_weekly_report_slack.js
// 週次レポートをSlackへ送信する。既存の SLACK_WEBHOOK_URL（.env.local）を再利用。
// 実行: node --env-file=.env.local scripts/send_weekly_report_slack.js

const https = require('https');

async function sendSlack(text) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) throw new Error('SLACK_WEBHOOK_URL が未設定です（.env.local を確認してください）');
  return new Promise((resolve, reject) => {
    const parsed = new URL(webhookUrl);
    const body = JSON.stringify({ text });
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
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const REPORT_TEXT = `【店主のAI時短メモ 週次レポート 8/5-8/11】
■ 全体：表示20 / 訪問者19 / いいね0 / アフィリクリック0
■ 人気記事：①見積太郎(4) ②消耗品(3) ③POSレジ(2) ④販促グッズ(2)
■ 課題：検索流入0・日本からの流入3のみ・米国bot疑い17
■ 結論：記事の質は完成。次の勝負は「集客（SEO＋日本ターゲット露出）」

■ 実施済み施策（8/11夜間）
・全24記事の購買心理リライト＋画像＋カテゴリ整備＋内部リンク網
・Google Search Console登録・サイトマップ送信・主要9記事インデックス登録
・アフィリCTAボタン化（10記事）・Amazon/楽天リンクボタン化（8記事）
・重複記事3本を統合（WP-016/007/022に一本化）
・Threads送客ドラフト17本・note送客ドラフト5本を用意
・24記事まとめ商品（フェーズ診断＋優先順位マップ付き）を企画・執筆

■ 次のアクション
・WordPress/n8n有料化（8/12予定）→ Yoast SEO導入・広告除去・独自ドメイン
・n8n Credential登録（Gumroad/Threads APIトークン）
・LINE公式アカウント導線の追加検討
・まとめ商品の価格確定・公開判断`;

(async () => {
  try {
    const result = await sendSlack(REPORT_TEXT);
    console.log(`[${new Date().toISOString()}] Slack送信結果: status=${result.status} body=${result.body}`);
    if (result.status !== 200) process.exit(1);
  } catch (err) {
    console.error('❌ Slack送信失敗:', err.message);
    process.exit(1);
  }
})();
