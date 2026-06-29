# スプレッドシート設計
# Google Sheets名：AI-NET-BUSINESS-OS

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

---

## NICHE_RESEARCH（ジャンル調査・スコアリング）

Deep ResearchのジャンルQ結果を貼り付け、100点満点で採用判断する。

| 列名 | 型 | 説明 |
|---|---|---|
| niche_id | TEXT | 一意ID（例: NICHE-001） |
| ジャンル名 | TEXT | ジャンル・テーマ名 |
| 概要 | TEXT | どんな領域か（1〜2行） |
| 想定ターゲット | TEXT | 主な読者・視聴者像 |
| 収益モデル | TEXT | アフィリエイト / 商品販売 / 相談 / 複合 |
| 30日以内の現金化可能性 | NUMBER | 0〜10点 |
| 報酬単価_利益率 | NUMBER | 0〜10点 |
| AI自動化との相性 | NUMBER | 0〜10点 |
| 投稿ネタ継続性 | NUMBER | 0〜10点 |
| 経営者背景_実店舗実績との相性 | NUMBER | 0〜10点 |
| 競合強度（逆転） | NUMBER | 0〜10点（競合弱いほど高点） |
| 差別化余地 | NUMBER | 0〜10点 |
| 無料プレゼント化しやすさ | NUMBER | 0〜10点 |
| LINE登録に繋げやすさ | NUMBER | 0〜10点 |
| 高単価商品展開可能性 | NUMBER | 0〜10点 |
| 総合スコア | NUMBER | 上記10項目の合計（最大100点） |
| 判定 | TEXT | 採用 / 保留 / 除外 |
| 採用理由 | TEXT | 採用する場合の根拠 |
| 除外理由 | TEXT | 除外する場合の根拠 |
| 最初の検証アクション | TEXT | 採用時に最初にやること |

---

## AFFILIATE_PROGRAM_RESEARCH（アフィリエイト案件調査）

A8.net等のASPで調べた案件20件を入力し、採用/保留/除外を判断する。

| 列名 | 型 | 説明 |
|---|---|---|
| program_id | TEXT | 一意ID（例: AFF-001） |
| 案件名 | TEXT | アフィリエイト案件名 |
| ASP名 | TEXT | A8.net / もしもAF / afb / バリューコマース 等 |
| ジャンル | TEXT | 金融 / 美容 / 教育 / ツール 等 |
| 報酬単価 | TEXT | 円 or ％（例: 3,000円/件） |
| 承認条件 | TEXT | クリック / 会員登録 / 購入 等 |
| 承認率予測 | NUMBER | 0〜10点 |
| SNS訴求可否 | NUMBER | 0〜10点 |
| ブログ記事化しやすさ | NUMBER | 0〜10点 |
| ショート動画化しやすさ | NUMBER | 0〜10点 |
| LINE導線との相性 | NUMBER | 0〜10点 |
| 無料プレゼントとの相性 | NUMBER | 0〜10点 |
| ゆうさんが自然に語れるか | NUMBER | 0〜10点 |
| 競合強度（逆転） | NUMBER | 0〜10点（競合弱いほど高点） |
| 総合スコア | NUMBER | 上記8項目の合計（最大80点） |
| 採用_保留_除外 | TEXT | 採用 / 保留 / 除外 |
| 初回テスト投稿案 | TEXT | 最初に試す投稿の概要 |
| 初回CTA案 | TEXT | 最初のCTA文言 |
| 注意事項 | TEXT | 規約上の禁止事項など |

---

## FREEBIE_IDEAS（無料プレゼント候補）

LINE登録につながる無料プレゼント候補5件を評価し、1件を採用する。

| 列名 | 型 | 説明 |
|---|---|---|
| freebie_id | TEXT | 一意ID（例: FREE-001） |
| 無料プレゼント名 | TEXT | プレゼント名称 |
| 対象読者 | TEXT | 誰向けか |
| 解決する悩み | TEXT | どんな悩みを解消するか |
| 作成所要時間 | TEXT | 例：2時間 / 半日 / 1日 |
| LINE登録に繋がる強さ | NUMBER | 0〜10点 |
| アフィリエイト案件との相性 | NUMBER | 0〜10点 |
| 低単価商品への展開可能性 | NUMBER | 0〜10点 |
| 高単価商品への展開可能性 | NUMBER | 0〜10点 |
| 作成優先度 | NUMBER | 0〜10点 |
| 総合スコア | NUMBER | 上記5項目の合計（最大50点） |
| 採用_保留_除外 | TEXT | 採用 / 保留 / 除外 |
| 採用理由 | TEXT | 採用する場合の根拠 |
| 改善メモ | TEXT | 保留時の改善ポイント |
