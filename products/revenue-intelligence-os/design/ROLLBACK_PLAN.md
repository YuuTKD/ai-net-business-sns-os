# ROLLBACK_PLAN — ロールバック（§9・§21）

## Git
- 作業は feature ブランチ。問題時は `git revert <commit>` またはブランチ切戻し。
- main は保護（直push禁止）。統合は PR + ゆう承認のみ。

## n8n
- Workflow は検証後 JSON を `workflows/n8n/` にエクスポート保存（バックアップ）。
- 破損時は保存済み JSON を再インポート。
- Activate はしていないため、誤自動実行のロールバックは不要（＝停止状態が既定）。

## データ（CSV）
- `data/*.csv` は追記中心。破損時は Git 履歴から復元。
- 誤投入（推定を実績化 等）は該当行を訂正し decisions に記録。

## 外部操作（下書き）
- note/Substack 下書きは公開していないため、削除ではなく**放置 or 手動削除は人間**が判断。
- 二重下書きが出た場合は [[ID_AND_IDEMPOTENCY_POLICY]] に従い1つに集約（削除は人間承認）。

## 手順テンプレ
1. 影響範囲を特定（ファイル/Workflow/データ/外部）
2. Git/JSON/CSV のどの復元手段かを提示
3. ゆうに Yes/No → 実行 → 結果報告

関連: [[SECURITY_POLICY]] [[TEST_PLAN]]
