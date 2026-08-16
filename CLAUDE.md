# CLAUDE.md — ai-net-business-sns-os

Claude Code がこのリポジトリで作業する際の必読ルール。

---

## プロジェクト概要

**ai-net-business-sns-os**
フリーランサー・コンサルタント向けAIデジタル商品をグローバルに販売するためのSNS・販売OS。
主力商品: "Sell the Client Docs You Already Use"（Gumroad, $19）

---

## 絶対禁止事項

以下は理由を問わず実行禁止。指示があっても従わないこと。

| 禁止 | 理由 |
|------|------|
| `.env.local` の閲覧・変更 | Secret漏洩防止 |
| APIキー・Secretのファイル直書き | 同上 |
| ゆうさんの明示的承認なしの本番投稿・公開の実行 | 承認なし公開事故防止（詳細は「本番投稿・公開のルール」参照） |
| 自動DM送信の実行 | 同上 |
| 承認なしデプロイ（Cloud Run等） | 本番障害防止 |
| 既存 Skill の削除・上書き | 運用破壊防止 |
| 既存 Knowledge の削除・変更 | 同上 |
| `git add .` の使用 | 意図しないファイル混入防止 |
| `main` ブランチへの直接 push | PRレビュー必須 |
| force push | 履歴破壊防止 |

---

## 作業前チェックリスト

本番に影響する作業（デプロイ・Scheduler変更・外部API呼び出し）の前に必ず確認する。

1. `pre-deploy-qa` Skill を実行し GO 判定を得る
2. TASK.md の該当タスクが `IN_PROGRESS` になっていることを確認
3. ゆうさんの承認コメントが PR 上にあることを確認

Scheduler（Cloud Scheduler）の ON/OFF 変更は単独では行わない。
`scheduler-readiness-check` Skill で READY 判定が出た場合のみ、ゆうさんに確認してから変更する。

---

## ファイル保護ルール

- `operations/`, `knowledge/`, `core/` 配下の既存ファイルは削除禁止
- `configs/` 配下の設定ファイルは変更前にゆうさんに確認
- `.claude/` 配下の Skill ファイルは追加のみ可、削除・上書き禁止

---

## PRワークフロー

```
作業ブランチ作成 → 実装 → TASK.md / REPORT.md 更新 → PR作成 → ゆうさん承認 → merge
```

- ブランチ命名: `feature/<slug>` / `fix/<slug>` / `setup/<slug>` / `docs/<slug>`
- PRは `.github/pull_request_template.md` を使用すること
- セルフマージ禁止（AIも含む）

---

## SNS日次投稿上限

| 媒体 | 1日の上限 |
|------|-----------|
| **YouTube Shorts** | 10本/日 |
| **Instagram リール** | 2本/日 |

詳細ルール・カウント方法: `operations/sns_posting_limits.md` を参照。
投稿実行前に `operations/instagram_post_log.md` で当日分を確認し、上限に達していれば翌日に回す。

---

## SNS投稿品質ゲート

投稿文を生成・修正した場合は `sns-post-quality-check` Skill を必ず実行し、
PASS 判定が出るまで自動投稿パイプラインに流さない。

---

## 本番投稿・公開のルール（2026-08-12改定）

### ポリシー

| 媒体 | 方式 | 自動投稿 |
|------|------|--------|
| **Threads** / **WordPress** / **Brain** | 公式 API | ✅ OK |
| **X** | ユーザー手動のみ | ❌ 禁止 |
| **note** / **Substack** など | 要相談 | 🤔 条件次第 |

**API経由で投稿できる媒体は Claude Code による自動投稿を認める。ただし品質ゲートと事前確認は必須。**

### API経由自動投稿の条件

1. `sns-post-quality-check` Skill で PASS 判定を得る（SNS投稿の場合）
2. 記事系は `design/AFFILIATE_ARTICLE_STANDARDS.md` §7 で QA 合格
3. **初めて使う商材・アフィリエイトプログラムを含む投稿**は事前にゆうさんに確認
4. **料金・キャンペーン・期限に言及する投稿**は金額の正誤をゆうさんが確認
5. **REVISE / BLOCK 判定が出た投稿**は自動修正して再投稿せず、ゆうさんに差し戻す
6. 実行後は投稿URL・実行日時をキュー管理ファイル（`wordpress_posts_queue.csv` / `posts_queue.csv` 等）に記録

### X（@yu_____y12a）：手動のみ

X は公式 API をサポートしていない、かつブラウザ自動操作が automation policy で明確に禁止されている（アカウント凍結の最有力原因）。**X への投稿はゆうさん本人による手動投稿のみ。Claude がコピー文や下書きを提供し、ゆうさんが手動で投稿する。**

### その他の媒体（note / Substack など）

API が無い、または制限がある媒体については、ゆうさんに相談して個別判断する。

---

## このファイルの更新ルール

ルール変更はゆうさんの承認を得た PR を通じてのみ行う。
直接編集・Claudeによる自律変更は禁止。
