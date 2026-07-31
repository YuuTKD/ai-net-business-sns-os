# SECURITY_POLICY — セキュリティ / コンプライアンス（§3）

## Secret管理
- `.env.local` は閲覧・変更・コミット禁止（CLAUDE.md 継承）。
- APIキー・Secretをコード/ログ/Gitに書かない。
- Credential は n8n の Credential ストアで管理し、**登録・変更は人間**（[[RISK_APPROVAL_POLICY]]）。
- パスワード・Cookie・認証コードを保存しない。表示もしない。

## 認証
- ログイン/OAuth/2FA/CAPTCHA は人間が実施。回避しない。

## 実績の正確性（重要）
- 架空の市場データ・売上を作らない。**推定値を実績値として保存しない**。
- 欠損は `unknown`。相関を因果と断定しない。
- Phase1 で判明した過大記載（note「10本公開」→実際2、Substack「7本未公開」→実際 公開5/下書き8、売上¥0）は、REPORT.md 等を**実測へ訂正**する（本Phaseの別コミットで対応、要承認）。

## コンプライアンス（QA ゲート）
- PR表記・Affiliate規約・著作権・金融/税務表現・投稿先適合を quality-reviewer / sns-post-quality-check でチェック。
- compliance_flag が NG のオファーは offer_score 無効＝BLOCK。

## 変更管理
- main直変更・force push・GitHub無断push 禁止。作業は feature ブランチ + PR + ゆう承認。
- 既存 Skill/Knowledge/Core/Agents/QA を削除・上書きしない（追加レイヤーのみ）。

関連: [[RISK_APPROVAL_POLICY]] [[ROLLBACK_PLAN]]
