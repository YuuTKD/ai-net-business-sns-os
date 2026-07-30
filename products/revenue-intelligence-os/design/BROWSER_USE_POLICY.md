# BROWSER_USE_POLICY — 画面操作の規約（§16・§3）

## 基本
- Browser Use は**作業員**。事業判断はしない。
- 実行方法の優先順位（§4）: 公式API > n8n公式ノード > Webhook > CSV/インポート > **Browser Use画面操作**。Browser Use単独依存は不可。

## 許可される操作（read/draft）
- n8n を開く / Project・Workflow作成 / **JSONインポート** / ノード設定確認 / Credential選択 / 単体・全体dry-runテスト / 実行履歴確認 / エラー画面読取 / JSONエクスポート
- note へ下書き入力 / SNS投稿画面の操作（**公開直前で停止**） / 公開後の表示確認

## 禁止（§3・§17で人間へ）
- 公開・送信・削除・課金・契約・Credential作成/変更/削除
- CAPTCHA/2段階認証の回避 / 自動クリック・自己クリック・水増し
- ログイン・OAuth・2FA は**停止して人間へ依頼**（[[RISK_APPROVAL_POLICY]] 様式）

## 再試行
- 同一画面操作の再試行は**最大2回**。2回失敗で停止し、失敗画面/ノード/操作/エラー/原因候補/人間操作要否/再開手順を報告。

## ダイアログ注意
- alert/confirm/prompt を誘発しない（拡張が固まるため）。必要時は console.log + ログ読取で代替。

## Phase1実績（本ポリシー下で実施済み）
- note/Threads/Substack/Brain/n8n を**閲覧のみ**で監査。売上ゲート（パスワード）は人間が入力、私は不介入。

関連: [[N8N_WORKFLOW_CATALOG]] [[RESPONSIBILITY_MATRIX]]
