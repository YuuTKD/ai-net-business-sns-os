# SNS日次投稿上限ルール（2026-08-16制定）

## 上限

| 媒体 | 1日の上限 | 理由 |
|------|-----------|------|
| **YouTube Shorts** | 10本/日 | APIクォータ・アルゴリズム健全性 |
| **Instagram リール** | 2本/日 | API負荷・WordPressレート制限回避 |
| **Threads** | 既存ルールに従う | — |

## 運用ルール

### YouTube
- 1セッションで10本を超えてアップロードしない
- サムネイル設定は別途 `youtube_thumbnail_queue.json` で管理し、1日最大10本ずつ処理
- 残りがある場合は翌日のCron（9:23 AM）で自動継続

### Instagram
- 1日2本を超えてリールを投稿しない
- 投稿間隔は最低60秒あける（コンテナERROR防止）
- WordPressへのメディアアップロードも集中させない（429対策）
- 投稿ログ: `operations/instagram_post_log.md`

## カウント方法

`operations/instagram_post_log.md` の当日日付エントリ数でカウント。
スクリプト実行前に当日分を確認し、上限に達していれば翌日にスケジュールする。
