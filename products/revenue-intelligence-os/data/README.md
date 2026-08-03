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
