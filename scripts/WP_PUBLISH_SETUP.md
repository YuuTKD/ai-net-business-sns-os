# WordPress 下書き自動化セットアップ（店主のAI時短メモ）

WordPress.com REST API経由で、承認済み記事を**下書き（draft）として自動作成**するツール。
`scripts/wp_queue_runner.js` / データは `products/revenue-intelligence-os/data/wordpress_posts_queue.csv`。

> **重要**: このツールは**絶対に記事を公開（publish）しません**。常に下書き(status=draft)として
> 作成するのみです。最終の公開ボタンは必ずゆうさんがwp-adminで押してください。
> Threadsの自動投稿より慎重な設計です（記事はSNS投稿より影響範囲が大きいため）。

---

## 1. 認証情報（2026-08-10 セットアップ済み）

developer.wordpress.com/apps/ で「店主のAI時短メモ 記事下書き自動化」というOAuth2アプリを
作成済み（App ID: 145430）。`.env.local` に以下3つを設定済み:

```
WP_CLIENT_ID=145430
WP_CLIENT_SECRET=（発行済み・.env.localに設定済み）
WP_ACCESS_TOKEN=（OAuth認可フローで取得済み・.env.localに設定済み）
```

**注意**: トークンの値に `#` `$` 等の記号が含まれる場合、`.env.local` では必ず
ダブルクォートで囲むこと（`.env`形式は`#`をコメント開始として解釈するため、
クォートなしだと値が途中で切れて認証エラーになる）。

疎通確認は以下のコマンドで可能（値は表示しない）:
```bash
node --env-file=.env.local -e "
fetch('https://public-api.wordpress.com/rest/v1.1/me', {
  headers: { Authorization: 'Bearer ' + process.env.WP_ACCESS_TOKEN }
}).then(r => r.json()).then(j => console.log(j.username))
"
```

## 2. 使い方

```bash
# 状態確認（draft_status=qa_passed の記事一覧を表示。何も実行しない）
node scripts/wp_queue_runner.js --status

# 実行（qa_passedの記事をWordPressに下書きとして作成）
node --env-file=.env.local scripts/wp_queue_runner.js --run
```

## 3. 運用フロー

1. Claude Codeが新しい記事を執筆し、`products/revenue-intelligence-os/data/wp_drafts/WP-XXX_slug.md` に保存
2. `AFFILIATE_ARTICLE_STANDARDS.md` の品質基準でチェック
3. `wordpress_posts_queue.csv` の該当行を追加し、`draft_status=qa_passed` に設定
4. `node --env-file=.env.local scripts/wp_queue_runner.js --run` を実行
   → WordPress REST API経由で下書き記事を自動作成
   → `wordpress_posts_queue.csv` の `draft_status` が `draft_saved` に更新され、`wp_edit_url` が記入される
   → Slack（`#日報`）に「下書きができました」と通知
5. **ゆうさんがwp-adminで記事を確認し、問題なければ公開ボタンを押す**（ここは自動化しない）
6. 公開後、`published_url` / `published_at` / `draft_status=published` を手動 or 別途更新

## 4. Markdown→HTML変換の対応範囲

`wp_drafts/*.md` の記法のうち、以下に対応（それ以外は素の段落として出力される）:
- `## 見出し` → `<h2>` / `### 見出し` → `<h3>`
- `**太字**` → `<strong>`
- `[テキスト](URL)` → `<a href="URL" target="_blank">`
- `- 箇条書き` → `<ul><li>`
- `---` → `<hr>`

表組み（`|`区切り）やアフィリンクの`rel="nofollow sponsored"`属性など、複雑な装飾が必要な
記事は、従来通りClaude in Chromeでの手動貼付（WP-010/011で使った合成pasteイベント方式）
を使うほうが確実。このツールは「シンプルな記事の下書き作成を高速化する」位置づけ。

## 5. cron等での無人実行について

このツールは**cron等での無人実行を行わない**方針（記事執筆自体に人間の企画判断が
必要で、Threadsの「承認済み文面を決まった時間に流す」ほど機械的な作業ではないため）。
毎回、Claude Codeのセッション内で `--run` を手動実行する。
