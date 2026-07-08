# MICRO_SAAS — AUTOMATION SCOPE

---

## 自動化してよいもの

| 項目 | ツール |
|---|---|
| ジェネレーター本体（入力→出力） | Google Sheets + GAS / Gemini API（DRY_RUN後に本番） |
| Brain購入決済 | Brain側の自動処理 |
| KPI集計式（Sheets内） | Google Sheets |

---

## 禁止

| 項目 | 理由 |
|---|---|
| 自動SNS投稿 | 規約違反 |
| 自動DM（ツール紹介） | 規約違反 |
| 本番API実行（GAS+Gemini） | APPROVED_FOR_LIVE=false維持 |
| 顧客データの自動収集 | 個人情報保護 |
| .env / APIキー表示 | セキュリティ |
