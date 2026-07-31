# TEST_PLAN — テスト計画（§20）

## 3回連続テスト（最初の収益ループ）
すべて **note下書き保存まで・公開しない**。

| Test | 内容 |
|---|---|
| Test 1 | テキスト記事生成 → note下書き保存（公開しない） |
| Test 2 | 画像・リンク候補付き記事 → note下書き保存（公開しない） |
| Test 3 | PR表記＋Affiliate候補＋QA＋人間承認待ち → note下書き保存（公開しない） |

## 合格条件（§20）
- [ ] 二重下書きなし（[[ID_AND_IDEMPOTENCY_POLICY]]）
- [ ] 二重Jobなし
- [ ] 無断公開なし
- [ ] Secret表示なし
- [ ] エラー記録あり（errors）
- [ ] 途中再開可能（[[JOB_STATE_MACHINE]]）
- [ ] 再実行前に外部確認
- [ ] JSONバックアップあり（workflows/n8n/）
- [ ] ロールバックあり（[[ROLLBACK_PLAN]]）
- [ ] ユーザー操作が認証と承認だけ
- [ ] 概算費用が記録される（[[COST_LIMITS]]）

## n8n Workflow 単位テスト（§16）
- Manual Trigger で単体 → 各ノード入出力確認 → 全体 dry-run → 実行履歴確認 → エラー修正 → 保存 → **Activateせず停止**。

関連: [[N8N_WORKFLOW_CATALOG]] [[ROLLBACK_PLAN]]
