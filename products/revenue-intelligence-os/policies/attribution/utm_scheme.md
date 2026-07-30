# UTM / アトリビューション規約

## UTMパラメータ
- `utm_source` = 媒体（substack / threads / instagram / x / note …）
- `utm_medium` = organic / social / email
- `utm_campaign` = `{theme}-{experiment_id}`（例: `dunning-EXP001`）
- `utm_content` = variant（例: `hookA` / `ctaB`）

## リンク管理
- ASPネイティブ計測リンクを使用（改変しない）。`data/attribution.csv` で `utm_campaign ↔ offer_id` を対応付け。
- 将来: 自前リダイレクト層を追加してクリックを一元計測。

## データ取り込み
- クリック/申込/承認/否認: ASP管理画面から**ユーザーが週次でCSV/画面取得**（エージェントはログイン・購入をしない）。
- 自社実売: **YU HOLDINGS AI MCP（read-only）**。
- 全レコードに `source = actual | estimate`、欠損は `unknown`。

## 禁止
- URL改変によるトラッキング詐称 / 自己クリック / 再生数・反応の水増し。
