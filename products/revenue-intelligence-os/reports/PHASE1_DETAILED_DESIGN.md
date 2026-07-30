# Revenue Intelligence OS — Phase 1 詳細設計
作成日: 2026-07-29
実装先: ~/revenue-browser-ops（正式作業フォルダ）
ステータス: **設計（未実装）** — 本書の承認後に実装へ移行

---

## 0. Phase 1 の狙い（1文）
本日実証した「調査→制作→QA→Substack下書き」パイプラインに **計測の背骨（データ層＋アトリビューション）** を足し、
**1テーマを「実験→2媒体→クリック計測→承認報酬追跡→SCALE/HOLD判定」まで1本通す**。
自動化（n8n）はまだ入れず、まず手動でループを確立して再現性を掴む。

### Phase 1 完了条件（Definition of Done）
- 顧客層 3〜5件 / 商品・案件 10〜20件 を Demand/Offer スコア付きで登録
- 小規模実験 5〜8件を実施（各 変数1つ）
- クリック→申込→発生報酬→承認報酬 を1導線で追跡できる状態
- 初収益 1件以上、承認成果 3件を目標
- 「売れた理由」を decisions シートで説明可能にする
- 最上位KPI（承認粗利益÷実稼働時間）を暫定でも算出できる

---

## 1. アーキテクチャ（Phase 1）

```
[スマホ] ログイン/2FA/撮影/公開Yes-No/売上確認
    │
[Claude Code] 全体指揮・設計・エージェント管理・分析・Git正本
    │
    ├─ AIエージェント(6+既存4) … 調査/分析/実験/制作/変換/QA/計測/意思決定
    ├─ Claude in Chrome … 検索/閲覧/下書き入力/投稿後確認（※データ収集はAPI/CSV優先）
    ├─ Google Sheets … データ層の正本（商品/顧客/仮説/実験/実績/意思決定）
    └─ YU HOLDINGS AI MCP(read-only) … 自社実売上/リード/利益の実測入力
    │
[n8n] Phase 1では未導入（Phase 2で定期実行/承認/レポート）
```

- 需要データ収集の優先順位（§9）: **公式API > CSV/エクスポート > Webhook > RSS/公開データ > Firecrawl等 > Browser Use画面操作**。Browser Use単独依存は不可。
- **推定値と実績値は必ず分離**。データ無しは捏造せず `unknown`。

---

## 2. データ層設計（Google Sheets）
ブック名: `Revenue Intelligence OS — Phase1`（source of truth）。ローカル `data/` にCSVミラーをバックアップ。

| シート | 主なカラム |
|---|---|
| `audiences` 顧客層 | id, name, situation, jtbd(片づけたい仕事), current_alternative, pain, urgency(1-5), wtp(支払意思), barrier(購入障壁), evidence_needed, best_channel, **demand_score**, confidence, status, source_url, fetched_at |
| `offers` 商品・案件 | id, name, type(ASP/Amazon/楽天/SaaS/自社), program, payout, payout_type, est_gross_margin, est_cvr, approval_rate, denial_rate, continuity, competition, **compliance_flag**, production_cost, owner_time, **offer_score**, url, tracking_param, status, updated_at |
| `hypotheses` 仮説 | id, audience_id, offer_id, hypothesis, channel, angle, expected_metric, created_at, status |
| `experiments` 実験 | id, hypothesis_id, variable_changed(1つ), control, variant, success_condition, stop_condition, min_data, judge_by(日付), status, result, decision |
| `content` コンテンツ | id, experiment_id, master_path, media, variant_path, cta, ad_disclosure, qa_status, draft_url, published(y/n), published_at |
| `posts_queue` 投稿キュー | id, content_id, media, scheduled, status(draft/awaiting_approval/published/held), approver_action, url |
| `metrics` 実績 | date, content_id, media, impressions, views, saves, comments, clicks, link_clicks, signups, page_visits, est_revenue, **confirmed_revenue(or unknown)**, source(actual/estimate) |
| `attribution` | utm_campaign, content_id, offer_id, click_ts, event(click/signup/発生/承認/否認/返品), amount, confirmed(bool), source |
| `errors` | ts, component, message, retry, resolved |
| `decisions` 意思決定 | ts, experiment_id, decision, rationale, owner_yes_no, next_action |

---

## 3. スコアリングモデル

### 3.1 Demand Score（0–100, 高いほど需要強）
`= urgency×0.30 + purchase_intent×0.25 + market_signal×0.15 + evidence_strength×0.15 + brand_fit×0.15`
（各項 0–100 に正規化。brand_fit = 「複数店舗経営者ブランド」との適合）
- 入力: demand-researcher（検索/SNS/口コミ/競合/質問）＋ audience-jtbd-analyst
- **unknownの項は0扱いせず「除外＋confidence低下」**として記録。捏造しない。

### 3.2 Offer Score（0–100）
`= payout_margin×0.30 + est_cvr×0.15 + approval_rate×0.15 + continuity_LTV×0.15 + low_competition×0.10 + low_production_cost×0.07 + low_owner_time×0.08`
- **compliance_flag は加点でなくゲート**: NG なら即 `BLOCK`（スコア無効）。
- 入力: offer-economics-analyst（既存 quote-generation / lead-scoring の考え方を流用可）。

### 3.3 優先順位
Demand×Offer のマトリクスで上位セルを実験対象に。低単価アフィリ単独依存は不可（高単価ASP/SaaS/自社商品を必ず1つ以上含める）。

---

## 4. アトリビューション設計（Phase 1 = 手動優先）
- **UTM規約**: `utm_source={media}` / `utm_medium={organic|social}` / `utm_campaign={theme}-{experiment_id}` / `utm_content={variant}`
- **リンク管理**: ASPネイティブ計測リンク＋ Sheet で `utm_campaign ↔ offer_id` を対応付け。将来はリダイレクト層を追加。
- **取り込み**: クリック/申込/承認/否認 は ASP管理画面から週次でCSV/画面取得。自社売上・リードは **YU HOLDINGS AI MCP** から実測。
- **原則**: 全レコードに `source(actual/estimate)`。欠損は `unknown`。相関を因果と断定しない。

---

## 5. 実験フレーム
- **1実験＝主要変数1つのみ変更**（タイトル or 冒頭 or CTA or 商品 or 媒体…のいずれか）。
- テンプレ: 仮説 / テスト対象 / 変更変数 / 成功条件 / 停止条件 / 必要データ量 / 判定期限。
- **判定に必要な最小データ**（初期値・調整可）: 判定前に ≥1,000 表示 もしくは ≥50 リンククリック。未達は **HOLD（STOPではない）**。

### 判定ルール（時間軸別）
| 期間 | 見る指標 | 改善対象 |
|---|---|---|
| 24–72h | 表示/視聴維持/保存/コメント/クリック | タイトル・冒頭・サムネ・切り口 |
| 7–14日 | リンククリック/申込/商品ページ遷移/見込み客登録 | CTA・商品・導線・媒体 |
| 30日 | 発生報酬/承認報酬/承認率/否認率/制作時間/粗利益 | SCALE/ITERATE/HOLD/STOP/自社商品化/別媒体 |

**SCALE**=承認利益/稼働 が目標超＋再現シグナル / **STOP**=十分データで明確な負 / **ITERATE**=混在＋単一レバー明確 / **HOLD**=データ不足。

---

## 6. AIエージェント設計（新規6・既存4流用）
各エージェントは「入力(シート/ファイル)→出力(ファイル＋シート書込)→禁止事項→次への受け渡し」を持つ。**公開/送信/購入/削除/権限変更/push は人間承認必須**。

| # | エージェント | 入力 | 出力 | 流用/備考 |
|---|---|---|---|---|
| 1 | demand-researcher | テーマ | audiences草案, 根拠URL | 既存 revenue-researcher を役割拡張 |
| 2 | audience-jtbd-analyst | audiences | JTBD/障壁/媒体/demand_score | 新規 |
| 3 | offer-economics-analyst | offers候補 | offer_score, compliance_flag | lead-scoring/quote-generation流用 |
| 4 | experiment-designer | hypotheses | experiments定義 | 新規 |
| 5 | master-content-producer | experiment | master記事/台本/CTA/PR表記 | **既存** |
| 6 | multi-platform-repurposer | master | 媒体別variant(P1=Substack+Threads) | 新規・P1は最小 |
| 7 | compliance-qa-reviewer | content | PASS/FIX/BLOCK | **既存**＋sns-post-quality-check流用 |
| 8 | browser-publishing-operator | PASS済 | 下書き/画像/表示確認 | **既存**（公開直前で停止） |
| 9 | attribution-analyst | metrics/MCP | クリック〜承認の関連付け | 新規 |
| 10 | growth-decision-director | 実績集計 | SCALE/ITERATE/HOLD/STOP（Yes/No形） | 新規 |

過剰追加回避のため **Phase 1稼働は 1,2,3,4,5,7,8,9,10 を優先**、6は反応確認後に本格化。

---

## 7. オーケストレーション（メインClaudeの処理順）
```
demand-researcher → audience-jtbd-analyst → offer-economics-analyst
→ experiment-designer → master-content-producer → multi-platform-repurposer(最小)
→ compliance-qa-reviewer(PASS判定) → browser-publishing-operator(下書きまで)
→【人間: 公開Yes/No】→（公開後データ蓄積）→ attribution-analyst
→ growth-decision-director → decisions シート →【人間: 次アクションYes/No】
```
- 一度に大量並列起動しない（1体ずつ）。
- 人間承認ゲート: 公開/送信/購入/契約/削除/権限変更/ログイン/2FA。

---

## 8. 追加フォルダ（既存を壊さず追加レイヤー）
```
~/revenue-browser-ops/
├── config/scoring/        # demand_score.md, offer_score.md（重み定義）
├── config/attribution/    # utm_scheme.md
├── data/                  # Sheetsのローカルバックアップ(CSV)
├── experiments/           # 実験ごとのフォルダ
└── reports/phase1/        # 本設計・週次レポート
```
既存（.claude/agents, content/, queues/, logs/ 等）は削除・移動しない。

---

## 9. Git / バックアップ / rollback
- `git init`（main=設計・変更履歴の正本、作業は feature ブランチ）。`.gitignore` は既存で `.env` 除外済み。
- 初回コミットで現状をベースライン化。以降の変更は差分提示→承認→コミット。
- 削除は行わず archive 候補として報告。n8n導入時は JSON でバックアップ。
- rollback: git revert / ブランチ切戻し手順を README に明記。

---

## 10. 最初のMVP実行計画（1本目）
1. テーマ候補を2〜3件提示（例: 「店舗の決済手数料/固定費の見直し」「予約・POS SaaS導入」「法人カードで経費最適化」＝高単価SaaS/カード案件と相性良）。※スコア検証前の仮説であり事実ではない。
2. demand/offer スコアで1テーマ×1オファー確定
3. experiment-designer が実験1件（変数1つ）設計
4. master → Substack＋Threads variant
5. QA PASS → 下書き保存（公開は人間Yes後）
6. UTM付きリンク発行 → metrics/attribution 記録開始
7. 7〜14日後 growth-decision → decisions 記録 → 次アクション

---

## 11. リスクと対策
- アトリビューション最難関 → 手動＋MCPで実測、estimate/actual分離、因果断定禁止。
- Browser Use脆弱性 → API/CSV優先、再試行2回上限。
- Git未整備 → 実装初手で git init。
- ディスク89%使用（空1.6GB）→ 重い依存は導入前に確認、n8nはPhase 2。
- コンプライアンス（ASP規約/金融税務/画像著作権）→ compliance-qa-reviewer をゲート化。

## 12. 費用が発生する箇所
Anthropic/OpenAI API（従量, P1主）／Firecrawl等（任意）／n8n（Phase 2）／Google Workspace（既存見込み）。**導入・課金は都度事前確認**。

## 13. 実装着手前に必要な人間入力
1. 実際に登録済みの ASP/プログラム（A8/もしも/バリューコマース/Amazon/楽天/afb/アクセストレード/SaaSパートナー 等）
2. データ層に使う Google アカウント/既存Sheet（新規作成可否）
3. 発信ブランド名・Substackパブリケーション（「店主のAI時短メモ」で継続可否）
4. 上記スコア重み・判定閾値の初期値でよいか（後から調整可）
```
