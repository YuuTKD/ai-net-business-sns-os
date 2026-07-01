# User Publish Tasks — Step by Step

ユーザーが実行する公開作業の超具体的な手順書。
迷いを0にする。

---

## TASK 1: Threads Day 2 投稿（3分）

**いつやるか:** 今日

**Step 1:** スマホまたはPCでThreadsを開く
**Step 2:** @client_docs_lab にログイン
**Step 3:** 新規投稿ボタンを押す
**Step 4:** 以下をコピペ（または`node scripts/daily_publish_orchestrator.js --day 2 --threads-live`を実行してコピー）

```
Your client intake form is worth money.

Not to your clients.
To other copywriters.

The questions you've figured out to ask before every project —
the ones that prevent scope creep and bad briefs —
are exactly what newer copywriters are spending hours trying to figure out.

You already have the answer.

You're just not selling it.

→ https://tally.so/r/MegGeM
```

**Step 5:** 投稿ボタンを押す
**Step 6:** 投稿URLをコピー
**Step 7:** Claude Codeに送る: 「Threads Day 2投稿しました: [URL]」

**迷ったとき:** Day 1と重複内容でないことを確認（Day 2は「Intake form」テーマ）

---

## TASK 2: Gumroad新商品登録（20分）

**いつやるか:** 今日または明日

**素材場所:** `operations/client_acquisition_kit_publish_ready.md`
**ZIPファイル:** `dist/Freelance_Client_Pipeline_Kit.zip`

**Step 1:** tokudatree.gumroad.com にログイン
**Step 2:** 右上「+」→「New product」
**Step 3:** 「Digital product」を選択
**Step 4:** Product name: `Freelance Client Pipeline Kit` と入力
**Step 5:** Price: `$29` を設定
**Step 6:** Summary（短い説明）を貼る:
```
Stop rebuilding your outreach from scratch. Get the templates, scripts, and framework to land your next freelance client — without cold DMs.
```
**Step 7:** Description（長い説明）を貼る: `client_acquisition_kit_publish_ready.md` の「Full Gumroad Description」セクションをコピペ
**Step 8:** 「Upload a file」→ `Freelance_Client_Pipeline_Kit.zip` をアップロード（PCから）
**Step 9:** Cover imageをCanvaで作成（任意）またはスキップしてテキストのみ
**Step 10:** Content → Thank you pageに購入後メッセージを貼る:
```
Thank you for getting the Freelance Client Pipeline Kit.
Start here: Open the README.md file first.
If you have questions, reply to this email.
```
**Step 11:** 「Publish」を押す
**Step 12:** URLをコピー（例: tokudatree.gumroad.com/l/XXXXXX）
**Step 13:** Claude Codeに送る: 「新商品Gumroad公開しました: [URL]」

---

## TASK 3: Tally新商品クイズ作成（30〜45分）

**いつやるか:** Gumroad登録後（URLが必要）

**素材場所:** `operations/new_product_tally_build_guide.md`

**Step 1:** tally.so にログイン
**Step 2:** 「New form」→「Start from scratch」
**Step 3:** Title: `What's Blocking Your Freelance Pipeline?` と入力
**Step 4:** Description: `Answer 6 quick questions to find out what's stopping clients from saying yes.`
**Step 5:** Q1〜Q5を「Multiple choice」で追加（選択肢は `new_product_tally_build_guide.md` からコピペ）
**Step 6:** Q6を「Email」フィールドで追加（Required: OFF）
**Step 7:** 「Logic」タブ → Conditional logic設定
  - Q2=A → Result 1（Visibility Problem）
  - Q2=B または Q4=B → Result 2（Conversion Problem）
  - Q2=C または Q5=A/D → Result 3（Call Conversion Problem）
  - Q2=D → Result 4（Follow-Through Problem）
**Step 8:** 各Resultページを作成（テキスト + CTAボタン）
  - CTAボタンのURL = Gumroadで取得したURL（Step 12）
**Step 9:** 「Publish」を押す
**Step 10:** URLをコピー
**Step 11:** Claude Codeに送る: 「Tally Kit Quiz公開しました: [URL]」

---

## TASK 4: Google Sheets KPI入力（5分/日）

**いつやるか:** 毎晩

**Step 1:** Google Sheets「CLIENT_DOCS_LAB_OS」を開く
**Step 2:** KPI_TRACKERシートに移動
**Step 3:** 以下の数字を入力:
  - Threads views（Threadsアプリ→投稿→インサイト）
  - Tally visits（tally.so→フォーム→Submissions）
  - Gumroad views（gumroad.com→Analytics）
  - Purchases（0 or 1）

---

## 完了したらClaude Codeに送る文

| タスク | 送る文 |
|---|---|
| Threads投稿 | 「Threads Day [N]投稿しました: [URL]」 |
| Gumroad公開 | 「新商品Gumroad公開しました: [URL]」 |
| Tally公開 | 「Tally Kit Quiz公開しました: [URL]」 |
| KPI入力 | 「KPI: Views=[N], Tally=[N], Gumroad=[N], 購入=[N]」 |

→ 受け取り次第、全ファイルのURL更新・ログ記録を実施します。
