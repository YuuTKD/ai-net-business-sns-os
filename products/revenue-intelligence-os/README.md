# Revenue Browser Operations

Claude Code + ブラウザ操作（Claude in Chrome拡張機能）を使い、調査・コンテンツ作成・下書き・投稿準備・分析を行うためのプロジェクトです。

## ブラウザ操作について

このプロジェクトでは **Claude in Chrome拡張機能**（Claude Code内蔵のブラウザ操作機能）を使用します。
Python製の `browser-use` ライブラリ（CDP / ポート9333経由の専用Chrome接続）は使用しません。

## ディレクトリ構成

```
.claude/agents/     プロジェクト専用Subagent定義
.claude/skills/      プロジェクト専用Skill
config/media-rules/  媒体ごとの投稿ルール・規約メモ
content/master/       元となるマスターコンテンツ
content/drafts/        下書き
content/approved/      QA承認済み（未公開）
content/published/     公開済みの記録
queues/research/       調査待ち・調査結果
queues/content/        制作待ち・制作結果
queues/approval/       承認待ち
queues/publishing/     公開待ち
logs/browser/          ブラウザ操作ログ
logs/errors/           エラーログ
logs/executions/       実行ログ
reports/               レポート
scripts/               補助スクリプト
tests/                 テスト
```

## 安全ルール（詳細は CLAUDE.md を参照）

- 公開・送信・購入・契約・削除・権限変更は人間承認なしで行わない
- APIキー・パスワード・Cookie・認証情報をコードへ書かない
- .env は git にコミットしない
- 2段階認証・CAPTCHAを回避しない
- 自動クリックによる反応の水増しを行わない
