# WIP_POLICY — 仕掛かり制限（§8）

## 同時進行の上限
| 区分 | 上限 | 現在の割当 |
|---|---|---|
| 収益実験 | 2 | ①Threads→note→Brain¥3,980（計測1本目） |
| 基盤構築 | 1 | n8n DEV Workflow 6本の順次構築 |
| 既存商品の改善 | 1 | Brain商品ページ/note導線の改善（VALIDATE後） |

## 新規案件を始める前の条件
新案件の開始前に、次のいずれかを必ず行う:
1. 既存案件へ統合（MERGE）
2. 既存案件を完了（DONE）
3. 既存案件を停止（STOP）

## 判定サイクル
- 各実験は [[REVENUE_LOOP_MVP]] の判定ルール（24-72h / 7-14日 / 30日）で SCALE/ITERATE/HOLD/STOP。
- WIP超過を検知したら portfolio-manager Agent が警告し、ゆうに優先順位の Yes/No を求める。

## 現時点のWIP判定
- 収益実験 1/2（余裕1）・基盤 1/1（満杯）・改善 0/1
- → **基盤（n8n）が満杯**。2本目の収益実験や新媒体（Instagram等）はHOLD。

関連: [[PORTFOLIO_INVENTORY]] [[REVENUE_LOOP_MVP]]
