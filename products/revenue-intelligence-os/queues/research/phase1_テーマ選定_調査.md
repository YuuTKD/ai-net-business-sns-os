# Phase 1 テーマ選定 調査（需要 × オファー）

- 作成日 / 取得日: 2026-07-29
- 担当ロール: demand-researcher + audience-jtbd-analyst + offer-economics-analyst（統合）
- ブランド軸: 現役の複数店舗経営者が実践する「①店舗の利益改善 ②AI業務自動化 ③経営者の仕事道具」
- 原則: 推定と事実を分離。欠損は unknown。数値は捏造しない。金額に幅があるものは範囲で記載。
- 禁止事項遵守: 投稿・送信・購入・アフィリ登録確定・ログインは一切行っていない（閲覧と検索のみ）。

---

## 0. サマリー（結論）

- 需要側は「飲食店オーナーの利益防衛」が最も緊急度が高い（倒産過去最多・人手不足・原価高騰という複合圧力＝事実）。
- オファー側は、低単価アフィリ単独では収益が薄いため、**自社の利益改善スポットコンサル/固定費見直しパッケージ（高単価・高粗利・自社IP）**が最有力。
- **推奨1本目テーマ: aud_01（独立系飲食店オーナー・利益率悪化）× off_18(固定費/決済手数料 削減 見直しパッケージ, 3-8万円/一括) を主軸に、off_15(利益改善診断→スポットコンサル)へ接続。** アフィリ（法人カード/決済/会計）は診断結果の「打ち手」として自然に同梱でき、追加収益になる。

---

## 1. 需要（Demand）— 顧客層と JTBD

### 事実（出典あり）
- 飲食業の倒産は2025年に1,002件と過去最多（出典: dinii, 取得2026-07-29）。
- 飲食店の76.3%が正社員不足、アルバイト・パート不足80.4%、有効求人倍率は全産業平均の約2倍（出典: dealca, promotize, 取得2026-07-29）。
- ノーショー率は平均6〜8%、予約管理システム導入で2%以下に抑えた事例あり（出典: cashier-pos / ubiregi, 取得2026-07-29）。
- タブレットオーダーで注文対応時間50%以上削減・客単価10〜15%向上のケース（出典: postas, 取得2026-07-29）。
- AIシフト管理でシフト作成時間90-95%削減・人件費15%削減の事例、4店舗居酒屋で月8-10万円の人件費削減例（出典: renue / note ai_compass / dealca, 取得2026-07-29）。
- 2026年の補助金で最大80%オフ導入可能、飲食業の約45%が何らかのAIを導入（出典: dealca, 取得2026-07-29）。

### 推定（当方の解釈）
- 上記の圧力から、オーナーの第一JTBDは「集客」より「**利益を残す＝固定費/人件費/手数料の削減**」に移行していると推定（緊急度5）。
- 支払意思: 月1-5万のSaaS/端末は効果次第で即決、削減効果が数値で見えれば月10-25万のコンサルも射程（コンサル相場 月15-25万は事実、支払意思は推定）。

### 顧客層（詳細は phase1_audiences_rows.csv 参照）
| id | 顧客層 | urgency | demand_score | confidence |
|----|--------|---------|--------------|-----------|
| aud_01 | 独立系飲食店オーナー（利益率悪化） | 5 | 83 | 0.68 |
| aud_02 | 人手不足で疲弊する小規模店（AI未導入） | 5 | 80 | 0.62 |
| aud_03 | 法人成り直後の経営者（経費最適化） | 4 | 72 | 0.55 |
| aud_04 | 現金中心店（キャッシュレス化） | 4 | 70 | 0.58 |
| aud_05 | ノーショーに悩む予約中心店 | 4 | 68 | 0.50 |

### Demand Score 算出方法
demand_score = urgency×0.30 + purchase_intent×0.25 + market_signal×0.15 + evidence_strength×0.15 + brand_fit×0.15（各0-100正規化）。
- 市場シグナル(market_signal)と証拠強度(evidence_strength)は出典の量・具体数値の有無で判定。
- purchase_intent と wtp は一部推定のため confidence を 0.5-0.7 に抑制。unknown 項目は分母から除外し confidence を下げた。
- 例: aud_01 = urgency100×0.30 + intent85×0.25 + market90×0.15 + evidence85×0.15 + brandfit95×0.15 ≒ 83。

---

## 2. オファー（Offer）— 実在商品・案件（18件）

### 事実（出典あり／報酬額の判明分）
- freee 会計 報酬（もしもアフィリエイト経由）: 無料登録 法人2,000円/個人300円、有料 個人1,000円、給与計算1,000円、マイナンバー500円。freeeサインは個人事業主のスタータープラン問合せ/申込で6,000-8,000円（出典: freee公式アフィリ / zero-affiliate / best-item, 取得2026-07-29）。
- 三井住友カード ビジネスオーナーズ: セルフバック/ポイントサイト経由で13,000-21,000円相当（時期変動）。主要ASP一部では非掲載（出典: affiriate-manual / cpcode, 取得2026-07-29）。
- JCB Biz ONE: 法人カードとして A8 で取扱いあり（報酬額は要確認、参考8,000円）（出典: exidea, 取得2026-07-29）。
- 決済手数料: Square 3.25%〜、Airペイ 3.24%。Airレジのレジ機能0円、レストランボード初期/月額0円（出典: stores.fun / airregi / ubiregi, 取得2026-07-29）。
- AIツール月額相場: LINE予約Bot 1-3万、発注・在庫AI 2-5万、シフトAI 1-3万（出典: dealca / aetheris, 取得2026-07-29）。
- 飲食コンサル相場: 月額顧問 15-25万〜が一般的、育成型は月25万〜（出典: rockhill / arcward / squareup, 取得2026-07-29）。

### 推定（明示）
- 決済端末・予約台帳・AIツール系ASPの**具体的な報酬額/承認率は未確認（unknown）**。プログラム有無も一部「要確認」。捏造せず unknown 記載。
- est_gross_margin / est_cvr / continuity は当方の推定値。自社商品(own_product)は制作コスト・オーナー稼働を要すが粗利率が高い前提で推定。

### Offer Score 算出方法
offer_score = payout_margin×0.30 + est_cvr×0.15 + approval_rate×0.15 + continuity_LTV×0.15 + low_competition×0.10 + low_production_cost×0.07 + low_owner_time×0.08。
- compliance_flag が NG のものは BLOCK（今回は全件 OK、違法性・誇大表現に該当なし。ただし「必ず儲かる/必ず削減」等の断定表現は制作時に禁止すべき＝コンプラ注意）。
- approval_rate 等が unknown の項目は当該係数を中立(0.5相当)で保守的に評価し、スコア上振れを避けた。

### 上位オファー（詳細は phase1_offers_rows.csv）
| id | 商品 | type | 報酬/価格 | offer_score |
|----|------|------|-----------|-------------|
| off_15 | 利益改善診断→スポットコンサル | own_product | 3-10万/一括 | 74 |
| off_16 | 月額顧問コンサル | own_product | 10-25万/月 | 72 |
| off_18 | 固定費/決済手数料 削減パッケージ | own_product | 3-8万/一括 | 71 |
| off_17 | AI業務自動化 導入代行パック | own_product | 5-20万/一括 | 68 |
| off_01 | 三井住友ビジネスオーナーズ(法人カード) | affiliate | 1.3-2.1万 | 58 |
| off_06 | Square(決済端末) | affiliate | unknown | 55 |
| off_02 | JCB Biz ONE(法人カード) | affiliate | 0.8万 | 55 |

---

## 3. Demand × Offer マトリクス → 1本目推奨

| 顧客層 | 相性の良いオファー | 理由 |
|--------|-------------------|------|
| aud_01 利益率悪化オーナー | **off_18 固定費削減パッケージ → off_15 診断コンサル**（+ off_01 法人カード / off_05,06 決済 をアフィリで同梱） | 緊急度5・支払意思あり・自社高粗利・アフィリを打ち手として自然に併載できる |
| aud_02 人手不足店 | off_17 AI導入代行 + off_12/14 AIツールアフィリ | 時短の数値証拠が強い |
| aud_03 法人成り経営者 | off_01/02 法人カード + off_03/04 会計 | 障壁低いが単価低め・レッドオーシャン寄り |

### 推奨1本目テーマ
**顧客層 aud_01（独立系飲食店オーナー・利益率悪化） × オファー off_18（固定費/決済手数料 削減 見直しパッケージ, 3-8万円）＋ off_15（利益改善診断→スポットコンサル）への接続**

- Demand Score: 83（confidence 0.68）
- Offer Score: off_18=71 / off_15=74（自社・高粗利・低競合）
- 推奨理由（3行）:
  1. 需要が最も緊急かつ事実で裏付け（倒産過去最多・人手不足・原価高＝オーナーは今すぐ利益を残したい）。
  2. 自社商品で粗利が高く、低単価アフィリに依存しない。決済/法人カード/会計アフィリは「削減の打ち手」として診断結果に自然同梱でき追加収益化。
  3. ブランド軸（現役複数店舗オーナーの実践知）と完全一致し、「AI副業」等のレッドオーシャンを回避できる。

### 想定の切り口 / CTA（案・推定）
- 切り口: 「値上げより先に、"抜けているお金"を止める。現役◯店舗オーナーが実際にやった固定費・決済手数料・人件費の見直し順序」
- 証拠の見せ方: 導入前後の営業利益改善額（円）を数値で（例: 決済手数料/シフト自動化/仕入れ見直しの合算）。誇大表現・断定は禁止。
- CTA: 「無料の"利益もれ"セルフ診断リスト（PDF/LINE）」→ スポット診断(off_15) → 削減パッケージ(off_18) → 必要な打ち手として法人カード/決済/会計/AIツールを提案。

---

## 4. データ品質・注意
- 事実は各行に source_url と fetched_at(2026-07-29)を付与。
- unknown 多数（特にアフィリ報酬額・承認率・成約率）: アフィリ登録は禁止のため確定値は未取得。ASP管理画面で要確認。
- 数値は一切捏造していない。範囲・推定は明示。
- コンプラ: 全オファー compliance=OK だが、制作時は「必ず/確実に削減できる」等の断定表現を避けること（景表法・優良誤認回避）。

## 5. 出典一覧（取得日 2026-07-29）
- https://dinii.jp/document/article/insyokuten_jinkenhi_sakugen/
- https://dealca.co.jp/blog/restaurant-ai-automation-2026.html
- https://promotize.jp/blog/case-study/inshoku-ai-gyomu-kouritsu/
- https://renue.co.jp/posts/ai-shift-management-auto-scheduling-optimization-guide-2026
- https://note.com/ai_compass_media/n/nb12b017e1c3f
- https://www.postas.co.jp/knowledge/2870/
- https://cashier-pos.com/column/tabletorder-system/
- https://stores.fun/magazine/articles/cashless-payment-terminals-guide
- https://airregi.jp/partner/square/
- https://squareup.com/jp/ja/app-marketplace/app/airregi
- https://ubiregi.jp/pos-regi-guide/reservation_management_system
- https://www.inshokuten.com/foodist/article/7028/
- https://www.freee.co.jp/affiliate/
- http://www.zero-affiliate.net/entry/freee-affiliate-asp
- https://best-item.work/affiliate/freee-asp/
- https://www.a8.net/campus/as/create/creditcard.html
- https://affiriate-manual.com/33204.html
- https://cpcode.hatenablog.com/entry/mitsuibo.sb
- https://exidea.co.jp/blog/accounting/corporate-card/smbc-jcb-biz-one/
- https://www.rockhill.jp/blog/management/887/
- https://arcward-c.co.jp/note/food-consultant-fee/
- https://squareup.com/jp/ja/townsquare/food-consultant
- https://bundle.jp/application_catalogs/accounting/moneyforward_accounting
- https://aetheris-jp.com/blog/026
