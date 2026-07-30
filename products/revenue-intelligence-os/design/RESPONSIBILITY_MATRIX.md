# RESPONSIBILITY_MATRIX — 役割分担（RACI）

R=実行 / A=最終責任 / C=相談 / I=報告

| 作業 | ゆう | Claude Code | Browser Use | n8n | AI API |
|---|---|---|---|---|---|
| 事業方針・Yes/No判断 | A/R | C | - | - | - |
| ログイン/OAuth/2FA/CAPTCHA | A/R | I | I | - | - |
| Secret/APIキー登録 | A/R | C | - | - | - |
| 全体設計・設計資料作成 | A | R | - | - | C |
| コード・n8n JSON 作成 | A | R | - | - | C |
| Agent/Skill 設計 | A | R | - | - | - |
| n8n 画面構築（Import/設定/テスト） | A | C | R | I | - |
| Workflow 定期実行・再試行・記録 | A | C | I | R | - |
| 需要調査・記事/投稿文生成・QA・分析 | A | C | I | I | R |
| note/SNS 下書き入力 | A | C | R | I | - |
| **公開・送信・課金・契約・削除・Activate・push・main変更** | **A/R** | 停止して依頼 | 停止 | 停止 | - |

## ゲート原則
- 上表の太字行は**必ず人間承認**。Claude Code / Browser Use / n8n は該当箇所で停止し、[[RISK_APPROVAL_POLICY]] の様式で依頼する。
- 事業ルール・スコア・Prompt・品質基準は本OS側で管理し、n8nに判断を埋め込みすぎない（[[SYSTEM_MAP]]）。

関連: [[RISK_APPROVAL_POLICY]] [[BROWSER_USE_POLICY]]
