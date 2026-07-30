# Demand Score 定義（0-100）

`Demand = urgency×0.30 + purchase_intent×0.25 + market_signal×0.15 + evidence_strength×0.15 + brand_fit×0.15`

| 項目 | 重み | 説明 | 0-100の目安 |
|---|---|---|---|
| urgency 緊急度 | 0.30 | 今すぐ解決したい痛みか | 5段階×20 |
| purchase_intent 購入意図 | 0.25 | 検索/比較/「おすすめ」等の意図語 | 弱20〜強100 |
| market_signal 市場シグナル | 0.15 | 検索量・SNS言及・競合数 | 小20〜大100 |
| evidence_strength 根拠強度 | 0.15 | 出典の質・数（推定のみは低） | 推定20〜一次資料100 |
| brand_fit ブランド適合 | 0.15 | 複数店舗経営者ブランドとの一致 | 低20〜高100 |

## ルール
- 不明項は0扱いせず**除外し confidence を下げる**（例: 3/5項のみ→confidence=Medium）。
- **数値の捏造禁止**。データ無しは `unknown`。
- confidence: High(5項) / Medium(3-4項) / Low(<3項)。
