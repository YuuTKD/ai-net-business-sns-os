# Threads 投稿CLI セットアップ手順（@ai_store_lab）

公式 Threads Graph API 経由で、承認済みの撒き餌スレッドを1本ずつ投稿するためのCLIです。
`scripts/threads_publish.js` / データは `scripts/threads_posts.json`。

> **重要（CLAUDE.md）**: 本番投稿は投稿1件ごとのゆうさんの明示承認が必須。このCLIは
> 「承認された1本だけを手動で実行する」用途。完全無人のスケジュール一括投稿には使わない。
> Secret（トークン）はリポジトリに保存しない。Claude はトークンを閲覧・入力しない。

---

## 1. トークンを用意する（ゆうさんの作業）

`@ai_store_lab` は既に公式 Threads Graph API 経由で運用実績あり（DEV_RIO_705）。
そのユーザーアクセストークンをそのまま使えます。

必要なもの:
- **THREADS_ACCESS_TOKEN** … スコープ `threads_basic` と `threads_content_publish` を含むユーザーアクセストークン
- （任意）**THREADS_USER_ID** … 省略時は `me`（トークン所有者）を使用

既存トークンの所在（いずれか）:
- n8n の `threads_post` クレデンシャル（DEV_RIO_705 で使用中）
- または Meta 開発者ダッシュボード（Threads API 使用中のアプリ）で再発行

> トークンには有効期限があります（長期トークンで約60日）。期限切れ時は再発行して差し替え。

## 2. `.env.local` に書く（ゆうさんの作業）

リポジトリ直下の `.env.local`（`.gitignore` 済み）に、次の1行を追記してください。
**この操作はゆうさんが行い、Claude は `.env.local` を開きません。**

```
THREADS_ACCESS_TOKEN=＜あなたのトークン＞
```

（別アカウントIDを明示したい場合のみ）
```
THREADS_USER_ID=＜数値のThreadsユーザーID＞
```

## 3. 疎通確認（投稿しない）

トークンが有効か、アカウント名を表示して確認します。

```bash
node --env-file=.env.local scripts/threads_publish.js --verify
```

→ `✅ 疎通OK: @ai_store_lab (id: ...)` が出れば準備完了。

---

## 4. 投稿する

### まずドライラン（送信しない・内容確認）
```bash
node scripts/threads_publish.js --post 004
```

### 承認後、本番投稿（1本のみ）
本文を投稿 → 既定30秒後に「1コメント目」として note リンクを自動ぶら下げ。
```bash
node --env-file=.env.local scripts/threads_publish.js --post 004 --live
```

投稿IDは `004`〜`011`（`scripts/threads_posts.json`）。
- `008`（イベント見積）と `009`（値段だけ〜）は**テーマ近接のため別日**に。
- 実行後、`operations/threads_post_log.md` に投稿URL・日時を自動追記。

### オプション
| オプション | 意味 |
|---|---|
| `--post <id>` | 投稿する餌ID（004〜011） |
| `--live` | 本番投稿（未指定は dry-run） |
| `--verify` | トークン疎通確認のみ |
| `--no-reply` | 1コメント目リンクを付けない |
| `--delay <sec>` | コンテナ作成→公開の待機秒数（既定30） |
| `--text "..."` | JSONを使わず本文直接指定（アドホック） |
| `--reply "..."` | アドホック時の1コメント目 |

---

## 5. 運用ルール（threads_launch_arsenal.md より）

- 1日2〜3本。うち1本は質問系でエンゲージ獲得。
- 連投スレッドは1本目→数分空けて返信でぶら下げ（一括連投しない）。
- リンクは本文に書かず1コメント目（このCLIは自動でそうする）。
- 各投稿は `sns-post-quality-check` PASS 済み → ゆうさん承認 → `--live`。承認は1本ごと毎回。

---

## 6. 承認済みキューからの半自動実行（scripts/threads_queue_runner.js）

PR #76（`design/PROPOSAL_THREADS_N8N_AUTO_SCHEDULE.md`）で承認された、安全装置つきの
半自動実行ランナー。新規コンテンツは一切生成せず、`products/revenue-intelligence-os/data/threads_posts_queue.csv`
に**ゆうさんが事前に承認済み**（`status=approved`）の投稿だけを、古い予定日順に1件ずつ公開する。

### 安全装置
- `auto_post_enabled` フラグ（既定OFF）。誰でもいつでも `--disable` で即停止できる
- 連続2回投稿失敗で自動的に `auto_post_enabled=false`（fail-stop）
- 投稿前に必ずトークン疎通確認（失敗は「投稿失敗」としてカウント）
- **SLACK_WEBHOOK_URL が未設定の場合、`--run` は無人実行を拒否する**（scheduler-readiness-check の必須条件）
- 1日の投稿本数は `daily_limit`（既定2）で固定

### コマンド
```bash
# 状態確認（現在ON/OFFか、キュー残数、次の投稿予定）
node scripts/threads_queue_runner.js --status

# 有効化・無効化（即OFFスイッチ）
node scripts/threads_queue_runner.js --enable
node scripts/threads_queue_runner.js --disable

# 実行（SLACK_WEBHOOK_URL必須。手動テストのみ --allow-no-slack-notify で回避可）
node --env-file=.env.local scripts/threads_queue_runner.js --run
```

### 2026-08-10 有効化済み
- SLACK_WEBHOOK_URL 設定済み（既存Slackアプリ「RIOメトリクス通知機能」の`#日報`向けWebhookを流用）。テスト通知の到達を確認済み
- `auto_post_enabled=true`・`daily_limit=1`（観察期間中）で有効化
- **毎日10:00にmacOSのcronから自動実行**されるよう設定済み（`crontab -l`で確認可能）:
  ```
  0 10 * * * cd /Users/tokudayuya/ai-net-business-sns-os && /Users/tokudayuya/.nvm/versions/node/v22.23.1/bin/node --env-file=.env.local scripts/threads_queue_runner.js --run >> operations/threads_auto_cron.log 2>&1
  ```
  実行ログは `operations/threads_auto_cron.log`（gitignore対象）。停止したい場合は `node scripts/threads_queue_runner.js --disable` を実行するか、`crontab -e` で該当行を削除する。

### まだ揃っていないもの
- **トークン残日数の監視**: THREADS_ACCESS_TOKENの有効期限を定期確認する仕組み（別タスク）
- **n8n Cronからの呼び出し**: 上記の通りmacOSのcronで代替済み。n8n Cronへの移行は将来の検討課題
- **観察期間**: 有効化後14日間（〜2026-08-24目安）は `--daily-limit 1` を維持し、事故がないことを確認してから2〜3本に引き上げる
