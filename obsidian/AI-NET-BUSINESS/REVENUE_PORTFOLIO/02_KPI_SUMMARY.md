# 02 KPI SUMMARY — 全モデルKPIサマリー

← [[00_DASHBOARD]] | 週間 → [[01_WEEKLY_ACTION]]

記録先CSV: `data/revenue_portfolio/model_kpi_matrix.csv`

---

## 毎日見る数字

| 指標 | B2B_AGENT | MICRO_SAAS | PROG_SEO | SNS_AFFILIATE |
|---|---|---|---|---|
| 投稿数（当日） | — | — | — | X:0 / Th:0 |
| SNSエンゲージメント | — | — | — | — |
| Brain閲覧数 | — | — | — | — |
| 問い合わせ数 | — | — | — | — |
| 売上 | — | — | — | ¥0 |

---

## 週次で見る数字

| 指標 | B2B_AGENT | MICRO_SAAS | PROG_SEO | SNS_AFFILIATE |
|---|---|---|---|---|
| 総投稿数 | — | — | — | X:1 / Th:1 |
| フォロワー増加 | — | — | — | — |
| Brain閲覧数（週計） | — | — | — | — |
| リプ/コメント送信数 | — | — | — | 0件 |
| Brain購入数 | — | — | — | 0件 |
| 売上合計 | — | — | — | ¥0 |

---

## 月次KPI目標

| モデル | 売上目標 | 副指標 | 判断ライン |
|---|---|---|---|
| B2B_AGENT | 診断1件成約 | 問合せ3件以上 | 問合せゼロなら訴求見直し |
| MICRO_SAAS | Brain誘導3件 | ツール利用10件以上 | 利用ゼロならUX見直し |
| PROGRAMMATIC_SEO | アフィリ初報酬 | 記事10本公開 | 流入ゼロならKW見直し |
| SNS_AFFILIATE | Brain初売上1件 | Brain閲覧10件 | 閲覧ゼロならプロフ見直し |

---

## 改善判断基準（/post-performance-pdca 観点）

| 状況 | アクション |
|---|---|
| Brain閲覧数が週10件未満 | プロフURL / 固定投稿を見直す |
| 投稿エンゲージメント率1%未満 | 投稿テーマ・時間帯を変える |
| リプ反応率5%未満 | コメント文・ターゲット選定を見直す |
| 問合せゼロが2週間継続 | オファー文言・導線を見直す |
| 売上ゼロが30日継続 | モデル優先順位の見直しを検討 |

---

## KPI記録コマンド

```
# 毎日の記録
data/revenue_portfolio/model_kpi_matrix.csv を開いて当日行を追記する

# 週次集計
data/revenue_portfolio/weekly_execution_plan.csv に結果を記入する
```

---

*← [[00_DASHBOARD]] | 週間 → [[01_WEEKLY_ACTION]]*
