# 80〜90%自動化設計書

## 目的

Gumroad / Tally / Brevo / LinkedIn / Threads の公開作業を、
Claude Codeが担当できる範囲を最大化して、ユーザーの手作業を最小化する。

---

## 分担一覧

### Claude Codeがやること（80〜90%）

| # | 作業 | 成果物の場所 |
|---|---|---|
| 1 | 各サービスのページを開くコマンド作成 | `operations/open_all_publish_pages.sh` |
| 2 | Gumroad入力内容の完全整理（コピペ完結） | `operations/claude_publish_operator.md` Phase 2 |
| 3 | Tally入力内容の完全整理（10問+6結果ページ） | 同上 Phase 3 |
| 4 | Brevo入力内容の完全整理（Day 0〜7全文） | 同上 Phase 4 |
| 5 | LinkedIn / Threads bio + Post 08 最終版 | 同上 Phase 5 |
| 6 | URL回収フォーム（コピペ欄） | 同上 Phase 6 |
| 7 | URL受領後のプレースホルダー一括置換 | Bashコマンドで実行（Claude Codeが実行） |
| 8 | KPI記録ファイルの作成 | `operations/kpi_tracker.md` |
| 9 | 24時間後・48時間後チェックリスト | `operations/first_48h_after_launch_action_plan.md` |
| 10 | Playwright補助スクリプト（ページナビ） | `operations/playwright_publish_helper.js` |

### ユーザーがやること（10〜20%）

| # | 作業 | 理由 |
|---|---|---|
| 1 | 各サービスにログイン | パスワードは扱わない |
| 2 | 2FA認証 | OTPは扱わない |
| 3 | 決済・税務・銀行情報の入力 | 財務情報は扱わない |
| 4 | ファイルのアップロード（Gumroad） | ZIPの場所を指示、クリックはユーザー |
| 5 | 最終確認・公開ボタンを押す | 不可逆操作の最終判断はユーザー |
| 6 | 公開後のURLをClaude Codeに共有する | URLを受け取ったらClaude Codeが置換 |

---

## 自動化できる範囲・できない範囲

### 自動化できる範囲

| 作業 | 手法 |
|---|---|
| ページを開く | `open` コマンド（Mac）またはPlaywright |
| 入力テキストの準備 | Markdownで完全整理済み（コピペ完結） |
| URLプレースホルダー置換 | `sed` コマンドをClaude Codeが実行 |
| KPI記録ファイルの更新 | ユーザーがURLを貼ったらClaude Codeが更新 |
| 公開後チェックリスト実行 | Claude Codeがファイルを確認・指示 |
| 次回以降の改善指示 | Claude Codeが分析・作成 |

### 自動化しない範囲（安全ルール）

| 作業 | 理由 |
|---|---|
| ログイン・パスワード入力 | 秘密情報は扱わない |
| 2FA / OTP 入力 | セキュリティコードは扱わない |
| 決済情報・銀行情報入力 | 財務情報は扱わない |
| 公開ボタン・送信ボタン | 不可逆操作の最終判断はユーザー |
| APIキー・Webhook URLのファイル保存 | 秘密情報はコミットしない |

---

## 公開までの流れ

```
Step 1: Claude Code → open_all_publish_pages.sh 実行 → 5ページ同時オープン
Step 2: ユーザー → Gumroadにログイン（2FA含む）
Step 3: Claude Code → Phase 2の指示に従ってGumroad入力ナビ
Step 4: ユーザー → コピペ・ファイルアップロード・公開ボタン
Step 5: ユーザー → GumroadのURLをClaude Codeに共有
Step 6: Claude Code → {{GUMROAD_LINK}} を一括置換
Step 7: ユーザー → Tallyにログイン
Step 8: Claude Code → Phase 3の指示に従ってTally入力ナビ
Step 9: ユーザー → コピペ・公開ボタン
Step 10: ユーザー → TallyのURLをClaude Codeに共有
Step 11: Claude Code → {{TALLY_QUIZ_LINK}} を一括置換
Step 12: ユーザー → Brevoにログイン
Step 13: Claude Code → Phase 4の指示に従ってBrevo入力ナビ
Step 14: ユーザー → コピペ・有効化
Step 15: Claude Code → Phase 5のLinkedIn/Threads入力ナビ
Step 16: ユーザー → bio更新・Post 08投稿
Step 17: Claude Code → 完了チェックリスト確認・KPI記録ファイル更新
```

---

## 公開後の流れ

```
公開直後（Hour 0）:
- Claude Code → 全プレースホルダー置換確認コマンド実行
- Claude Code → KPI記録ファイルのベースライン欄を更新

Hour 12:
- ユーザー → 指標をClaude Codeに報告（views / completions / subscribers / sales）
- Claude Code → kpi_tracker.md を更新・改善指示

Hour 24:
- ユーザー → 指標をClaude Codeに報告
- Claude Code → 次のアクション（投稿文、改善提案）を作成

Day 3〜5:
- Claude Code → 次の7投稿を準備（Post 02〜07）
- ユーザー → 1日1投稿
```

---

## 次回以降さらに自動化できる部分

| 作業 | 手法 | 条件 |
|---|---|---|
| Brevo API → リスト追加 | Brevo API（無料） | APIキーをユーザーが環境変数で設定 |
| Tally → Brevo 自動連携 | Zapier無料枠（100タスク/月） | Zapierアカウント登録後 |
| KPI自動集計 | Gumroad API | APIキーをユーザーが環境変数で設定 |
| 投稿スケジューリング | Buffer / Later 無料枠 | 登録後 |
| A/Bテスト（件名） | Brevo内蔵機能 | 登録者50人以上 |

---

## 安全ルール（変更禁止）

- パスワード・2FA・APIキー・銀行情報・カード情報は扱わない
- 秘密情報をファイル保存しない・コミットしない
- 公開ボタンはユーザーが押す前提
- 商品案・ターゲット・価格・戦略は変更しない
- push禁止（ユーザー確認前）
