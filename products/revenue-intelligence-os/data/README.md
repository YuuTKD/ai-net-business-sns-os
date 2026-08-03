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

## affiliate_link_library_v2_proposed_schema.csv（2026-08-03 検討中・未採用）
`rakuten_link_library.csv` を拡張し、A8.net・もしもアフィリエイトを将来
追加するための提案スキーマ（`network` 列で判別、genre照合ロジックは
ネットワーク非依存のまま拡張）。**本番の `rakuten_link_library.csv` は
まだ変更していない。** 両ASPは口座/税務情報の登録を伴う新規アカウント開設が
ゆうさん本人にしかできないため、開設完了後に統合を判断する。
設計背景・ASP比較は `design/MULTI_AFFILIATE_NETWORK_EXPANSION.md`、
詳細は TASK.md の TASK-024 を参照。
