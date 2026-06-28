# スプレッドシート設計

---

## SNS_POST_MASTER（投稿マスター）

| 列名 | 型 | 説明 |
|---|---|---|
| post_id | TEXT | 一意ID（例: POST-001） |
| platform | TEXT | threads / instagram |
| scheduled_date | DATE | 投稿予定日 |
| theme | TEXT | 投稿テーマ |
| body | TEXT | 投稿本文 |
| hashtags | TEXT | ハッシュタグ（カンマ区切り） |
| image_url | TEXT | 使用画像URL（任意） |
| status | TEXT | draft / ready / posted / skip |
| cta | TEXT | CTA内容（LINE誘導など） |
| notes | TEXT | 備考 |

---

## Threads投稿

| 列名 | 型 | 説明 |
|---|---|---|
| post_id | TEXT | SNS_POST_MASTERのpost_id参照 |
| account | TEXT | Threadsアカウント名 |
| body | TEXT | 投稿本文（Threads用） |
| scheduled_date | DATE | 投稿予定日 |
| status | TEXT | draft / ready / posted |
| threads_post_id | TEXT | API返却の投稿ID |
| posted_url | TEXT | 投稿URL |
| posted_at | DATETIME | 実際の投稿日時 |

---

## Instagram投稿

| 列名 | 型 | 説明 |
|---|---|---|
| post_id | TEXT | SNS_POST_MASTERのpost_id参照 |
| account | TEXT | Instagramアカウント名 |
| format | TEXT | reel / carousel / single |
| caption | TEXT | キャプション本文 |
| hashtags | TEXT | ハッシュタグ |
| image_urls | TEXT | 画像URL（複数はカンマ区切り） |
| scheduled_date | DATE | 投稿予定日 |
| status | TEXT | draft / ready / posted |
| posted_url | TEXT | 投稿URL |
| posted_at | DATETIME | 実際の投稿日時 |

---

## SNS_RESULT（投稿結果）

| 列名 | 型 | 説明 |
|---|---|---|
| post_id | TEXT | 対応するpost_id |
| platform | TEXT | threads / instagram |
| posted_at | DATETIME | 投稿日時 |
| likes | NUMBER | いいね数 |
| replies | NUMBER | 返信・コメント数 |
| reposts | NUMBER | リポスト数 |
| reach | NUMBER | リーチ数 |
| profile_clicks | NUMBER | プロフィールクリック数 |
| link_clicks | NUMBER | リンククリック数 |
| saves | NUMBER | 保存数（Instagram） |
| score | NUMBER | 総合スコア（独自算出） |
| synced_at | DATETIME | インサイト取得日時 |

---

## SNS_WINNING_POSTS（勝ち投稿）

| 列名 | 型 | 説明 |
|---|---|---|
| post_id | TEXT | 対応するpost_id |
| platform | TEXT | threads / instagram |
| theme | TEXT | 投稿テーマ |
| body | TEXT | 投稿本文 |
| score | NUMBER | スコア |
| reason | TEXT | 勝ち判定の理由 |
| reuse_status | TEXT | pending / reused |
| registered_at | DATE | 登録日 |

---

## SNS_REUSE_ACTIONS（再利用タスク）

| 列名 | 型 | 説明 |
|---|---|---|
| action_id | TEXT | 一意ID |
| source_post_id | TEXT | 元のpost_id |
| reuse_type | TEXT | threads_remix / instagram_carousel / lp_copy / line_msg |
| new_body | TEXT | 再利用後の本文 |
| status | TEXT | pending / done |
| due_date | DATE | 対応期限 |
| notes | TEXT | 備考 |

---

## IMAGE_LIBRARY（画像ライブラリ）

| 列名 | 型 | 説明 |
|---|---|---|
| image_id | TEXT | 一意ID（例: IMG-001） |
| title | TEXT | 画像タイトル |
| url | TEXT | 画像URL（Drive等） |
| format | TEXT | carousel / reel_cover / single |
| theme | TEXT | 関連テーマ |
| used_in | TEXT | 使用済みpost_id（カンマ区切り） |
| created_at | DATE | 作成日 |

---

## FUNNEL_KPI（収益導線KPI）

| 列名 | 型 | 説明 |
|---|---|---|
| week | DATE | 週（月曜日の日付） |
| posts_count | NUMBER | 投稿数合計 |
| total_reach | NUMBER | 総リーチ |
| profile_clicks | NUMBER | プロフィールクリック合計 |
| line_registrations | NUMBER | LINE登録数 |
| lp_clicks | NUMBER | LP誘導クリック数 |
| sales_count | NUMBER | 販売件数 |
| revenue | NUMBER | 売上（円） |
| notes | TEXT | 備考 |
