# URL Collection After Publish

公開後にClaude Codeへ報告するURL一覧。受け取り次第、全ファイルの該当箇所を自動更新します。

---

## 回収済みURL

| 対象 | URL | 状態 |
|---|---|---|
| Gumroad（Client Docs Lab $19） | https://tokudatree.gumroad.com/l/qrrtvc | ✅ 回収済み |
| Tally（既存診断フォーム） | https://tally.so/r/MegGeM | ✅ 回収済み |
| Threads Day 1 | 未取得 | 🟡 投稿済み・URL未回収 |
| Threads Day 2 | 未投稿 | 🔴 投稿待ち |
| Gumroad（Freelance Client Pipeline Kit $29） | 未公開 | 🔴 公開待ち |
| Tally（Kit診断クイズ） | 未公開 | 🔴 公開待ち |
| LinkedIn（Kit launch post） | 未投稿 | 🔴 Tally URL確定後に投稿 |

---

## URLを受け取ったらClaude Codeがやること

### Threads Day 2 URL受取時

ユーザーから「Threads Day 2投稿しました: [URL]」を受け取ったら:
1. `operations/threads_post_log.md` の Day 2行を `✅ Live` に更新
2. URLを記録
3. `operations/market_validation_90_plan.md` のDay 2行を更新

### Gumroad新商品URL受取時

ユーザーから「新商品Gumroad公開しました: [URL]」を受け取ったら:
1. `operations/client_acquisition_kit_publish_ready.md` のURL欄を更新
2. `operations/revenue_probability_90_plan.md` のステップ状態を更新（🔴 → ✅）
3. `content/client_acquisition_kit_linkedin_launch_post.md` は変更不要（Tally URL待ち）
4. `operations/new_product_tally_build_guide.md` のCTAリンク欄にURLを記録

### Tally（Kit Quiz）URL受取時

ユーザーから「Tally Kit Quiz公開しました: [URL]」を受け取ったら:
1. `content/client_acquisition_kit_linkedin_launch_post.md` の `[TALLY_KIT_URL]` を実URLに置換
2. `operations/user_publish_tasks_step_by_step.md` のCTA URLを更新
3. Threads短縮版の `[TALLY_KIT_URL]` も置換
4. LinkedIn投稿が可能になったことをユーザーに通知

### KPI受取時

ユーザーから「KPI: Views=[N], Tally=[N], Gumroad=[N], 購入=[N]」を受け取ったら:
1. `operations/market_validation_90_plan.md` のKPI毎日記録シートに記入
2. `operations/kpi_tracker.md` のWeek 1テーブルに記入
3. スコア変化があればrevenue_probability_90_plan.mdを更新

---

## 更新が必要なファイル一覧

| ファイル | 更新トリガー | 更新内容 |
|---|---|---|
| `operations/threads_post_log.md` | Threads投稿URL受取 | ✅ Live + URL記録 |
| `operations/market_validation_90_plan.md` | KPI受取・投稿確認 | 日次記録テーブル |
| `operations/kpi_tracker.md` | KPI受取 | Week 1テーブル |
| `operations/revenue_probability_90_plan.md` | Gumroad/Tally公開確認 | ステップ状態更新 |
| `content/client_acquisition_kit_linkedin_launch_post.md` | Tally URL受取 | [TALLY_KIT_URL]置換 |
| `operations/current_master_status.md` | 各URL受取 | URL回収待ちセクション更新 |

---

## ユーザーへの確認事項（未回収）

以下はClaude Codeでは確認できないため、ユーザーが直接確認してください:

- [ ] Threads Day 1の投稿URL（アプリ → 投稿 → コピー）
- [ ] Brevo Automation が「Active」状態かどうか
- [ ] Tally → Brevo 連携が機能しているかどうか（Tallyに回答があるか確認）
