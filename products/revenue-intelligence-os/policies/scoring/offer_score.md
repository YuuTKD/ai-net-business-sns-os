# Offer Score 定義（0-100）

`Offer = payout_margin×0.30 + est_cvr×0.15 + approval_rate×0.15 + continuity_LTV×0.15 + low_competition×0.10 + low_production_cost×0.07 + low_owner_time×0.08`

| 項目 | 重み | 説明 |
|---|---|---|
| payout_margin | 0.30 | 報酬×粗利。高単価ほど高 |
| est_cvr | 0.15 | 推定成約率 |
| approval_rate | 0.15 | 承認率（否認が多い案件は減点） |
| continuity_LTV | 0.15 | 継続報酬/リピート/LTV |
| low_competition | 0.10 | 競合が少ないほど高 |
| low_production_cost | 0.07 | 制作コストが低いほど高 |
| low_owner_time | 0.08 | オーナー稼働が少ないほど高 |

## ゲート（加点ではない）
- `compliance_flag = NG`（ASP規約違反/成果保証/景表法・薬機法懸念/著作権/画像無断）なら **即 BLOCK**。スコア無効。

## ルール
- 推定は estimate、実績が取れれば actual を優先。**捏造禁止・欠損はunknown**。
- 低単価アフィリ単独は不可。高単価ASP/SaaS/自社商品を必ず1つ以上候補に含める。
