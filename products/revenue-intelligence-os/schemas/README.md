# schemas — データ契約

`design/DATA_MODEL.md` を機械可読なスキーマに落としたもの。

| ファイル | 対象 | 備考 |
|---|---|---|
| `jobs.schema.json` | jobs テーブル（Phase2追加） | 状態機械・冪等性キー |
| `evidence_pack.schema.json` | evidence_packs（Phase2追加） | 実測/推定/unknown を分離 |

## 既存CSV（10種）のカラム契約
`data/*.csv`（audiences/offers/hypotheses/experiments/content/posts_queue/metrics/attribution/errors/decisions）のカラムは `design/DATA_MODEL.md` の表を正とする。
将来、各CSVにも JSON Schema を追加し、n8n Codeノード/取り込み時にバリデーションする。

## 原則
- 推定値を実績値として保存しない（`source: actual/estimate/unknown`）。
- 相関を因果と断定しない。欠損は `unknown`。

関連: `design/DATA_MODEL.md` / `design/ID_AND_IDEMPOTENCY_POLICY.md`
