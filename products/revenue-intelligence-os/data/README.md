# data/

Google Sheets（正本 "Revenue Intelligence OS — Phase1"）へインポートする **CSVテンプレート** 置き場。
各CSVはヘッダー行のみ。運用時は Sheets を正本とし、ここは定期バックアップのミラーとする。

## シート/CSV一覧
audiences / offers / hypotheses / experiments / content / posts_queue / metrics / attribution / errors / decisions

## 原則
- 実績(actual)と推定(estimate)を分離。欠損は `unknown`（捏造しない）。
- 秘密情報（APIキー・パスワード・Cookie）は絶対に置かない。

## posts_queue.csv 拡張（2026-08-03 検討中・未採用）
複数媒体（note / Instagram / メルマガ）対応の v2 スキーマ案を
`posts_queue_v2_proposed_schema.csv` として検討用に置いている。
**本番の `posts_queue.csv` はまだ変更していない。** note は公式APIが存在しないため、
API連携ではなくブラウザ下書き補助＋人間の手動公開を前提にスキーマを設計している。
詳細は TASK.md の TASK-023 を参照。

## note_posts_queue.csv（2026-08-03 新規・設計のみ）
note記事専用の公開進捗キュー（ヘッダー・スキーマのみ、実データなし）。
価格・無料/有料文字数・実体験プレースホルダー状態など note固有の項目を管理する。
運用フローは `design/RIO_801_NOTE_OPERATIONS_SOP.md` を参照。詳細は TASK.md の TASK-024。

## affiliate_link_library_v2.csv（2026-08-03 実データ投入済み・ワークフロー未統合）
`rakuten_link_library.csv` を拡張したマルチアフィリエイト対応ライブラリ
（`network` 列で rakuten/a8/moshimo を判別、genre照合ロジックは
ネットワーク非依存のまま拡張）。**本番の `rakuten_link_library.csv` は
まだ変更していない。** 当初は両ASPとも新規アカウント開設がゆうさん本人にしか
できないため統合を保留する方針だったが、ゆうさんが既にA8.net・もしも
アフィリエイトのアカウントを開設済みだったことが判明し、実際に発行された
広告リンク6件（会計2件・確定申告1件・勤怠管理1件・労務アウトソーシング1件・
ドメイン取得1件）を投入済み。すべて既存の提携中プログラムから取得したもので、
新規の提携申請は行っていない。**DEV_RIO_705等の
自動投稿ワークフローへの組み込みはまだ行っていない**（ゆうさんの承認待ち）。
設計背景・ASP比較は `design/MULTI_AFFILIATE_NETWORK_EXPANSION.md`、
詳細は TASK.md の TASK-024・TASK-025 を参照。

## wordpress_posts_queue.csv（2026-08-04 新規・実データ1行あり）
WordPress（店主のAI時短メモ、treecosme.home.blog）記事専用の公開進捗キュー。
`note_posts_queue.csv` と対のスキーマ。運用フローは
`design/RIO_802_WORDPRESS_OPERATIONS_SOP.md` を参照。詳細は TASK.md の TASK-031。

## 記事品質・文字数基準（2026-08-04 新規、content.csv / note_posts_queue.csv / wordpress_posts_queue.csv 共通）
アフィリエイト記事（note・WordPress・Brain）の目標文字数・QAスコアリングの基準を
`design/AFFILIATE_ARTICLE_STANDARDS.md` に新規追加した。これに伴い、`content.csv` に
`article_type` / `target_word_count_min` / `target_word_count_max`、
`note_posts_queue.csv` に `keyword` / `search_intent` / `article_type` /
`target_word_count_min` / `target_word_count_max` / `qa_score` / `compliance_score`
を末尾に追加（既存列・既存データ行は変更せず追記のみ、既存行の新規列は空欄）。
詳細は TASK.md の TASK-031。
