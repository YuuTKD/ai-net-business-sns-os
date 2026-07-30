# data/

Google Sheets（正本 "Revenue Intelligence OS — Phase1"）へインポートする **CSVテンプレート** 置き場。
各CSVはヘッダー行のみ。運用時は Sheets を正本とし、ここは定期バックアップのミラーとする。

## シート/CSV一覧
audiences / offers / hypotheses / experiments / content / posts_queue / metrics / attribution / errors / decisions

## 原則
- 実績(actual)と推定(estimate)を分離。欠損は `unknown`（捏造しない）。
- 秘密情報（APIキー・パスワード・Cookie）は絶対に置かない。
