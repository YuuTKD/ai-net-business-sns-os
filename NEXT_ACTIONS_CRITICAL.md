# NEXT ACTIONS CRITICAL

最終更新: 2026-07-01
ルール: 今すぐやる1つだけ。迷ったらここを見る。

---

## 今すぐやる：1つ

### Threads Day 2 live投稿

**なぜこれか:**
- すでに準備済み（dry-run完了、362文字確認済み）
- 市場検証点を今日上げられる唯一のアクション
- ユーザー作業: コピペ投稿のみ（3分）
- 新たな作成物なし

**実行コマンド（確認用）:**
```bash
node scripts/daily_publish_orchestrator.js --day 2 --threads-live
```

**投稿後にやること:**
1. 投稿URLを `operations/threads_post_log.md` の Day 2 行に記入
2. Claude Codeに「Threads Day 2投稿しました: [URL]」と報告

**成功条件:**
- @client_docs_lab にDay 2が実際に投稿されている
- URLが threads_post_log.md に記録されている

---

## 次にやる：1つ

### Gumroad新商品登録（Freelance Client Pipeline Kit $29）

**準備状態:**
- 商品コンテンツ: 本日作成済み
- Gumroad説明文: `operations/client_acquisition_kit_publish_ready.md` に完備
- 所要時間: 15〜20分

**手順参照:**
`operations/user_publish_tasks_step_by_step.md`

**成功条件:**
- Gumroad URLが発行される
- URLをClaude Codeに共有する

---

## 今日やらないこと

- X live投稿の再試行（402未解消）
- LinkedIn Day 2の再投稿（禁止）
- Pricing Calculator作成（優先度低）
- 新しい商品アイデア出し
- Brevoの設定変更（まず既存を確認）
- 大規模ドキュメント整備

---

## 判断根拠

市場検証点が今22点。最も低い。
今日Threads Day 2を投稿するだけで25点以上になる。
KPIを1つでも記録すれば30点に近づく。

新商品公開（Client Acquisition Kit）は、
商品制作・販売準備・売上化すべてに影響する。
今日Threads投稿 → 明日Gumroad公開、が最短で複数スコアを上げるルート。

---

## 7日間で達成したい状態

| 指標 | 目標 |
|---|---|
| Threads投稿 | 7本 |
| LinkedIn投稿 | 5本 |
| Tally visits | 30以上 |
| Tally completions | 10以上 |
| Gumroad visits | 20以上 |
| 購入 | 1件以上 |
| 公開商品数 | 2商品 |
