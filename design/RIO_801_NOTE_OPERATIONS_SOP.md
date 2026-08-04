# note 運用 SOP 統合版（Threads品質ゲート統合・DEV_RIO_801方針）

作成: 2026-08-03（TASK-024・CEOキックオフ Week1）
位置づけ: 既存のnote下書き運用実績（REPORT-005〜009、
`products/revenue-intelligence-os/reports/note先行10本_公開SOP.md`）と、
Threadsで実績のある `sns-post-quality-check` Skill の品質ゲートを統合し、
今後のnote運用（DEV_RIO_801の再設計方針＝TASK-023参照）で使い続けられる
恒久SOPとして整理したもの。**実際の投稿文生成・note下書き作成の実行はしない
（設計のみ）。**

---

## 0. 前提の再確認（TASK-023 CEO決定の踏襲）

- note.com に公式投稿APIは存在しない（REPORT-032で確認済み）。
- そのため運用は **「Claude in Chrome によるブラウザ下書き作成の補助」＋
  「ゆうさん本人による最終確認・有料ライン設定・公開ボタン操作」** の二段構成。
  n8n ワークフローによる自動投稿・自動下書き生成は使わない
  （note公式APIが無い以上、n8nの HTTP Request ノードでnoteには繋げないため）。
- 本人確認・特定商取引法表記・振込口座登録など、note側のアカウント設定は
  引き続き**ゆうさん本人のみ**が行う（AI代行不可、`note先行10本_公開SOP.md` §0を踏襲）。
- 公開ボタンはAIが押さない（`fix/browser-policy-never-click-publish` ブランチ名からも
  分かる通り、既存の安全方針として確立済み）。

---

## 1. 既存運用の要点（REPORT-005〜009 / note先行10本_公開SOP.md の整理）

| 項目 | 実績・ルール |
|---|---|
| 下書き作成手段 | Claude in Chrome（Browser Use）でnote編集ページを開き、タイトル・本文を入力→「下書き保存」のみクリック |
| 公開操作 | 「公開に進む」ボタンは一度も押していない（REPORT-005〜008で毎回確認済み） |
| 画像添付 | ローカルファイルのドラッグ&ドロップはOSダイアログ制約でブラウザ拡張から不可。**note公式ギャラリー経由**なら画像添付可（REPORT-006の知見） |
| 有料ライン・価格設定 | 本文中に目印テキストを入れておき、実際の設定操作（有料エリア指定・¥980入力）は**ゆうさん本人**が行う |
| 本文の長さ・構成 | ¥980記事の実例（REPORT-009）で無料部分2,251字＋有料部分含め合計10,402字。無料部分は「読ませて有料へ誘導する」設計。**2026-08-04（TASK-031）以降は、記事タイプ別に目標文字数を変える方式に更新（下記2.5参照、`design/AFFILIATE_ARTICLE_STANDARDS.md`準拠）。この合計10,402字はあくまで「note有料記事」タイプの実例であり、他タイプの記事に一律適用しない** |
| 実体験の扱い（重要な安全教訓） | REPORT-009で、存在しない具体的エピソード（会話・実話）を**創作**して挿入していたことが自動セーフガードで検出・差し戻しになった事例あり。**実体験がない箇所は`【実際の経験に置き換える：...】`のような明示プレースホルダーのままにし、実体験が埋まるまで公開禁止**とする運用を継続する |
| 実測結果 | REPORT-003時点：公開2本・下書き9〜11本、ビュー9・売上¥0。トラフィック/販売はまだ未発生 |

---

## 2. sns-post-quality-check Skill の note への適用方法（新規設計）

### 2.1 適用方針
`~/.claude/skills/sns-post-quality-check/SKILL.md` は既存Skillであり、
CLAUDE.md の「既存 Skill の削除・上書き禁止」に従い**本SOPではSKILL.md自体を変更しない**。
代わりに、本SOP側で「note向けの入力マッピング・運用ルール」を定義し、
既存Skillの14項目採点ロジックをそのまま note に適用できるようにする。

### 2.2 Threads投稿とnote記事の役割分離（重複禁止の原則）
- **Threads投稿**: 短文（全角140字目安）。フック・気づき・CTA1つ。note記事への誘導は
  しない場合もある（Threads単体で完結する投稿が基本、既存 `threads_posts.csv` 運用を踏襲）。
- **note記事**: 長文（7,000〜10,000字台、REPORT-009実績を目安）。導入（無料部分）で
  読者の状況に共感→具体的な手順・チェックリスト（有料部分）→¥980。
- **重複禁止**: note記事の文章をそのままThreadsに貼らない。逆にThreadsの短文をnoteの
  本文にコピーしない。共通で使えるのは「テーマ・ペルソナ・安全設計（相談窓口・免責）」の
  みで、**表現・構成は媒体ごとに別に作成する**（`master-content-producer` /
  `multi-platform-repurposer` エージェント定義の役割分担に準拠）。

### 2.3 入力マッピング（note用 post_check）
既存Skillの入力スキーマ（`post_check`）を、note向けに次のようにマッピングして呼び出す。

```yaml
post_check:
  business: AIネットビジネス   # 既存の対象事業表に準拠
  channel: note                # 既存表に「note」列は無いため本SOPで追加運用ルールを定義（2.4）
  post_text: <無料部分の全文>   # 有料部分は採点対象外（未購入者が読む＝「掴み」の質が最重要のため）
  planned_image_theme: <カバー画像の絵柄テーマ>
  recent_posts: <直近5本のnoteタイトル+冒頭200字>   # note内の重複チェック用
  goal: 購入（¥980）
```

- **採点対象は「無料部分」のみ**とする。有料部分は購入者しか読まないため、
  Threads向けの14項目（AIっぽさ・反応されやすさ等）をそのまま当てはめる意味が薄い。
  ただし **BLOCK項目（薬機法・誇大表現・NGワード・求人/テスト文言混入）は
  本文全体（無料＋有料）に必ず適用**する（安全上の理由でここは省略しない）。
- 「実体験プレースホルダーが未確定のまま」は独自のBLOCK相当項目として本SOPで追加する
  （下記2.4）。既存SKILL.mdのBLOCK項目一覧には無いため、Skill呼び出しの**前工程**として
  本SOP側でチェックする。

### 2.4 note固有の追加ゲート（Skill本体を変更せず、SOP側の前後工程として運用）
1. **実体験プレースホルダーチェック（Skill実行前）**: 本文に
   `【実際の経験に置き換える：...】` 等のプレースホルダーが残っていないか確認。
   残っている場合は sns-post-quality-check を実行しても **`REVISE`扱いとし、
   公開キューに進めない**（REPORT-009の教訓の恒久化）。
2. **有料ライン目印チェック**: 本文中に有料エリアの目印テキストが1箇所以上あるか確認
   （`note先行10本_公開SOP.md` §1の運用を継続）。
3. **sns-post-quality-check Skill 実行**（2.3の入力で）: `PASS` のみ次工程へ。
   `REVISE` は修正版を再検品、`BLOCK` は破棄 or 人間再作成。
4. **画像テーマ整合チェック**: `recommended_image` とカバー画像案が一致するか確認
   （image-library-manager Skillとの連携は既存Skillの「再利用先」に準拠）。

### 2.5 記事タイプ別・目標文字数の決定（TASK-031で追加）

執筆前に `design/AFFILIATE_ARTICLE_STANDARDS.md` §1・§2 に従い、記事タイプ（10種類）と
検索意図（9種類）を判定し、目標文字数レンジを決める。§1の「note有料記事」タイプ
（7,000〜10,000字、無料2,000〜2,500字＋有料残り）は、口コミ返信テンプレのような
**商品販売に直結する有料記事**にのみ適用する。無料の悩み解決記事・用語解説記事は
それぞれのタイプのレンジ（2,500〜4,500字 / 1,500〜3,500字）を使う。文字数は同ドキュメント
§7のQAスコアリング（100点満点・85点以上で公開候補）と合わせて `qa_gate` 判定に含める。

---

## 3. 統合運用フロー（企画→下書き→人間公開→計測）

```
1. テーマ選定       : note_100本設計図.md / 需要リサーチから選定
2. 本文執筆         : note専用フォーマットで作成（Threadsと別文面、§2.2）
3. 実体験チェック    : プレースホルダー未確定なら差し戻し（§2.4-1）
4. 品質ゲート        : sns-post-quality-check Skill 実行 → PASSのみ次へ（§2.3, 2.4-3）
5. note_posts_queue.csv 登録 : qa_gate=PASS、draft_status=not_started で1行追加（§4）
6. ブラウザ下書き作成 : Claude in Chrome で note編集ページに入力→「下書き保存」のみ
                        （公開ボタンは押さない。画像はnote公式ギャラリー経由が安定）
                        draft_status を draft_saved に更新
7. 人間の最終確認     : ゆうさんが有料ライン設定・価格¥980・特商法確認・プレビュー確認
8. 人間が公開         : ゆうさん本人が「公開」ボタンを押す（AIは操作しない）
                        draft_status を published に更新、published_url/published_at記入
9. 計測ループ         : 48-72h後にビュー/スキ/購入数を metrics.csv に手動記入
                        （実測と推定は分離、欠損は unknown。data/README.md の原則を踏襲）
```

n8n ワークフローはこのフローに登場しない（note公式APIが無いため、意図的に不使用）。
700系のような「下書き準備をn8nで自動生成→人間が仕上げる」パターンとも異なり、
noteは **執筆自体も含めてブラウザ操作前提** である点が700系との違い。

---

## 4. note_posts_queue.csv（新規・設計のみ）

`products/revenue-intelligence-os/data/note_posts_queue.csv` を新規作成した
（本タスクではヘッダー・コメント・スキーマ説明のみ。実データ行は入れていない）。

主なカラム: `id / content_id / theme / free_char_count / paid_char_count / price_jpy /
real_experience_placeholder_status / qa_gate / qa_notes / cover_image_theme /
note_edit_url / draft_status / scheduled_review_date / published_url / published_at /
added_date`

詳細はファイル冒頭のコメントを参照。既存の `posts_queue.csv`（Threads中心）とは
分離し、note固有の項目（価格・無料/有料文字数・実体験プレースホルダー状態）を
持たせている。将来 `posts_queue_v2_proposed_schema.csv`（TASK-023提案）の
`note_publish_mode` 列と接続する場合は、`note_posts_queue.csv` の `id` を
`posts_queue.csv` 側の `content_id` として参照する想定。

---

## 5. 非対応・保留事項（意図的に作らないもの）

- note公式APIとの連携（存在しないため）
- n8nによるnote下書きの自動生成・自動投稿
- AIによる「公開」ボタン操作
- 実体験プレースホルダーの自動生成・自動置換（本人の実体験を捏造しない、REPORT-009準拠）

## 6. 次のアクション（要ゆうさん確認）

- 本SOPに沿って次の1本を試験運用し、`sns-post-quality-check` Skillのnote適用が
  実務上機能するか検証する（実行は別タスクで着手）。
- `note_posts_queue.csv` の運用開始タイミング（次のnote記事から使うか）をゆうさんと確認。
