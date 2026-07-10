# B2B_AGENT — AUTOMATION SCOPE 自動化範囲

---

## 自動化してよいもの

| 項目 | ツール | 状態 |
|---|---|---|
| 診断申込みフォーム受付 | Google Forms | 設計中 |
| 申込み後の確認メール送信 | Google Forms 自動返信 | 設計中 |
| 診断レポートテンプレ生成 | Google Docs テンプレ流用 | 手動 |
| KPI集計 | Google Sheets（手動入力後に集計式） | 設計中 |

---

## 自動化してはいけないもの（禁止）

| 項目 | 理由 |
|---|---|
| 自動投稿（Threads/X/Instagram） | プラットフォーム規約・スパム判定リスク |
| 自動DM | 規約違反 / 信頼損失リスク |
| 自動リプ / コメント | 規約違反 |
| 自動セールスメール送信 | 迷惑メール法 / 信頼損失 |
| 自動決済処理 | 未設定・セキュリティリスク |
| APIキーを使った本番自動化 | APPROVED_FOR_LIVE=false のまま |
| Scheduler ON | scheduler_on=false を維持 |

---

## Phase2以降で検討する自動化

- Google Forms → Sheets 自動集計
- 診断後のメール自動フォローアップ（承認後）
- LINE Messaging API でのリマインド（Phase2）
