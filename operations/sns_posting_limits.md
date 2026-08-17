# SNS日次投稿上限ルール（2026-08-16制定）

## 上限

| 媒体 | 1日の上限 | 理由 |
|------|-----------|------|
| **YouTube Shorts** | 10本/日 | APIクォータ・アルゴリズム健全性 |
| **Instagram リール** | 2本/日 | API負荷・WordPressレート制限回避 |
| **Threads** | 3本/日 | アルゴリズム評価・スパム判定回避 |
| **WordPress** | 3本/日 | SEO的な大量公開によるクロール評価低下防止 |
| **Brain** | 2本/日 | 新商品は1本ずつ丁寧に告知する運用が効果的 |

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

### Threads
- 1日3本を超えて投稿しない
- 投稿間隔は最低30分あける（スパム判定回避）
- 投稿ログ: `operations/threads_post_log.md`

### WordPress
- 1日3本を超えて公開しない
- 同日に複数公開する場合は2時間以上間隔をあける
- 投稿ログ: `products/revenue-intelligence-os/data/wordpress_posts_queue.csv`

### Brain
- 1日2本を超えて新規公開しない
- 公開後は必ずInstagram・Threadsで告知投稿をセットで行う
- 公開ログ: `products/revenue-intelligence-os/data/brain_products/` 配下のファイルで管理

## カウント方法

各媒体の当日ログを確認し、上限に達していれば翌日にスケジュールする。

| 媒体 | カウント対象ログ |
|------|----------------|
| YouTube | `operations/youtube_upload_log.md` |
| Instagram | `operations/instagram_post_log.md` |
| Threads | `operations/threads_post_log.md` |
| WordPress | `wordpress_posts_queue.csv` の `published_at` 当日分 |
| Brain | 当日の手動公開数を目視確認 |
