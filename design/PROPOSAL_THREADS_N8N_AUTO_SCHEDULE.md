# 提案：Threads投稿のn8n無人スケジュール自動化（DEV_RIO_705）

作成: 2026-08-10 / Claude Code
ステータス: 提案中（ゆうさんの承認待ち・未実行）

---

## 背景

CLAUDE.mdには以下の禁止事項が明記されている。

> n8n等による、ゆうさんの逐次承認を経ない完全無人のスケジュール自動投稿（投稿の都度の承認プロセスを経ないもの）は、本ルールの対象外とし、引き続き実行しない。将来的に導入を検討する場合は、本ルールとは別に改めてPRで提案し、ゆうさんの承認を得る。

2026-08-10のセッションで、ゆうさんから複数回「Threadsをn8nで無人自動化してほしい」という依頼があったが、上記ルールによりチャット上での承認だけでは実行せず、本PRとして正式に提案する。

## 現状の運用（変更前）

- Claude Codeが投稿文を下書き
- `sns-post-quality-check` Skillで品質判定（8点以上のみ）
- 投稿文全文をゆうさんに提示し、投稿ごとに明示的承認を取得
- 承認後、`scripts/threads_publish.js`（公式Threads Graph API経由）で公開
- 2026-08-09〜10の実績：6投稿すべて問題なく公開（WP-010, WP-011, WP-005, WP-002 ほか）

この運用自体は機能しているが、ゆうさんの手が空くたびに承認する必要があり、「1日2〜3本×週複数回」のペースを維持するにはゆうさんの都度の関与が必要になる。

## リポジトリ内の既存資産と矛盾

`DEV_RIO_705`という名前のn8nワークフローが2バージョン存在することが判明した。

| バージョン | ファイル | トリガー |
|---|---|---|
| 手動実行版 | `products/revenue-intelligence-os/workflows/n8n/DEV_RIO_705_Threads_Rakuten_Prepare.json` | Manual Trigger（都度ゆうさんが実行） |
| 完全自動版 | `products/revenue-intelligence-os/workflows/n8n/DEV_RIO_705_Auto_Daily_Schedule.json` | Cron `0 21 * * *`（毎日21:00 JST、無人） |

過去のタスク記録（TASK-027, TASK-028）によれば、完全自動版（Cron）がn8n Cloud上で一時的に「Active」化されていた可能性があるが、mainブランチへの正式なPRレビュー・承認を経た有効化だったかは記録から確認できていない。`design/RIO_700_SERIES_RUNBOOK.md`には「3ワークフローとも active:false のまま運用する（意図的にCron化しない）」という方針が書かれており、これと矛盾する。

**→ 本提案の承認可否に関わらず、ゆうさんにはn8n Cloud管理画面で`DEV_RIO_705_Auto_Daily_Schedule`が現在Active/Inactiveかを直接確認していただくことを推奨する（現状把握が最優先）。**

## scheduler-readiness-check 判定結果（2026-08-10実施）

`scheduler-readiness-check` Skillで判定した結果は **NOT_READY**（第1層のハード条件で複数未達）。

| 項目 | 結果 |
|---|---|
| off_switch_confirmed（即OFF可能なフラグ） | FAIL（未実装） |
| fail_stop_enabled（連続失敗時の自動停止） | FAIL（未実装） |
| username_verified | PASS（@ai_store_lab確認済み） |
| token_expiry_days ≥14 | FAIL（残日数未確認） |
| checks_13_pass | FAIL（未確認） |
| line_notify_connected | FAIL（未接続。無人運用の必須条件） |
| post_queue_count（7日分ストック） | FAIL（キュー運用は本日開始したばかり） |
| avg_quality_score ≥8.0 | PASS（本日実績8.0） |
| daily_limit_set / posting_window_set | 一部PASS（Cron時刻自体は時間帯制限として機能） |
| rollback_doc_exists | FAIL（明示的な停止手順書なし） |

## 提案する設計（無人化するが、事故りにくい形にする）

無人化のリスクの本質は「AIが未レビューのままコンテンツを生成し、そのまま投稿してしまうこと」にある。以下の設計により、**コンテンツ生成と投稿実行を分離**し、Cronは「ゆうさんが既に承認済みの投稿だけ」を機械的に発火させる役割に限定する。

1. **コンテンツ生成・品質チェック・承認は従来通り人間の目を通す**
   `products/revenue-intelligence-os/data/threads_posts_queue.csv` に、`sns-post-quality-check` PASS済み・ゆうさん承認済み（`status=approved`）の投稿のみをストックする。
2. **n8n Cronは、このキューから`status=approved`の行を古い順に1件取り出して発火するだけ**
   新規コンテンツの生成・選定ロジックはCron側に一切持たせない。1日の発火本数は`daily_limit`（2〜3本）で固定。
3. **安全装置を追加実装してから有効化**
   - `auto_post_enabled`フラグ（n8nのSet/IF nodeで参照）：trueの間だけ発火。ゆうさんがいつでもfalseに切替可能
   - 連続2回投稿失敗でワークフロー自体を自動的に`active: false`にする
   - 投稿成功/失敗をLINE公式アカウントへ通知（未接続なら実装）
   - トークン残日数を投稿前にチェックし、14日を切ったらLINE通知＋投稿スキップ
4. **観察期間**：有効化後14日間は1日1本のみに絞り、事故がないことを確認してから2〜3本に引き上げる

## ゆうさんへのYes/No確認事項

1. n8n Cloud管理画面で`DEV_RIO_705_Auto_Daily_Schedule`が現在Active/Inactiveか確認いただけますか？
2. 上記の設計（コンテンツは人間承認済みのみ・Cronは発火役に限定・安全装置つき）の方向性で進めてよいですか？
3. 安全装置（LINE通知・自動停止ロジック・OFFフラグ）の実装が完了するまで、有効化は保留でよいですか？
4. 有効化後の観察期間は「1日1本×14日間」から始めることに同意しますか？

Yes の場合、このPRをマージした上で、安全装置の実装を別タスクとして着手する。
