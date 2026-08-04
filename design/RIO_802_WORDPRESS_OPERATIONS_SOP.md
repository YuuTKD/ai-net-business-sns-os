# WordPress 運用 SOP（店主のAI時短メモ・DEV_RIO_802方針）

作成: 2026-08-04（TASK-031、`RIO_801_NOTE_OPERATIONS_SOP.md` と対の位置づけ）

---

## 0. 前提

- サイト: **店主のAI時短メモ**（`https://treecosme.home.blog/`、WordPress.com無料プラン）
- 元は「Tree&Cosme OKINAWA」という閉業済みの別事業のサイトを転用（2026-08-04、
  サイトタイトル・キャッチフレーズを更新、旧投稿1件をゴミ箱へ移動済み）
- 対象読者: 実店舗オーナー（美容室・飲食店・整体院）
- 位置づけ: A8.net・もしもアフィリエイト・楽天アフィリエイトのリンクを集約する
  **収益の主エンジン**。note・Threadsは認知・信頼構築に専念し、収益記事はここに集約する
  （ゆうさんとの合意事項、この方針転換の経緯は本タスクのセッション記録を参照）。
- WordPress公式APIプラグイン（REST API経由の自動投稿等）は導入していない。
  **note.comと同じく、ブラウザ操作（Claude in Chrome）による下書き作成＋人間の最終公開**
  という運用形態を取る。
- 独自ドメイン化は無料プランでは不可（有料プランへのアップグレードが必要、
  課金判断が必要なため保留中）。当面は `treecosme.home.blog` のまま運用する。

---

## 1. 公開は投稿ごとのゆうさん承認制（2026-08-05改定）

`CLAUDE.md`「本番投稿・公開の承認制ルール」に従う。Claude in Chromeでの下書き作成・
QA（`design/AFFILIATE_ARTICLE_STANDARDS.md` §7でPASS）までは従来通りAIが行う。

「公開」ボタンは、**その投稿について、ゆうさんから明示的な承認（「公開して」等）を
得た場合に限り**Claude Codeが押してよい。承認なしでの公開は引き続き絶対禁止。
承認は投稿1件ごとに毎回必要（過去の承認の流用不可）。公開後はURL・日時を
`wordpress_posts_queue.csv` に記録する。

---

## 2. エディタの技術的注意点（実装時に判明した制約）

WordPress.comのブロックエディター（Gutenberg）は、タイトル欄と本文欄がiframe内に
レンダリングされる構成のため、ブラウザ自動化ツールでのタイトル/本文の切り替えが
不安定になりやすい（実際にタイトルへ本文の一部が混入する不具合が発生した実績あり）。
そのため、**新規記事作成時は「旧エディター（Classic Editor）」への切り替え
（`?classic-editor` パラメータ、または「旧エディターを使い続ける」ボタン）を推奨**する。
旧エディターは単純な `<textarea>` ベースで、タイトル・本文の位置が安定している。

作業時の注意：
- Cmd+Up等のOSショートカットは、textarea内ではなくブラウザ全体のショートカットとして
  解釈され、ページ遷移してしまう場合がある。カーソル移動はHome/Endキーやクリック位置の
  指定で行う
- 下書き保存後は必ずページ内容を再取得し、タイトル・本文が意図通りに反映されているか
  確認する（保存に見えて実際は反映されていないケースがあるため）

---

## 3. 記事の目標文字数・品質基準

`design/AFFILIATE_ARTICLE_STANDARDS.md` に従う。WordPressは基本的に**収益記事
（アフィリエイトリンクを含む記事）専用**のため、同ドキュメント§1のうち
「悩み解決記事」「商品単体レビュー」「比較記事」「おすすめランキング」
「高額商品・SaaS・スクール」「商標キーワード記事」「用語解説記事」
「購入方法記事」のいずれかに分類してから執筆する。

QAスコアリング（同ドキュメント§7、100点満点・85点以上）を通過した記事のみ、
ゆうさんへ公開確認を依頼する。

---

## 4. アフィリエイトリンクの挿入

WordPressに掲載するアフィリエイトリンクは、以下のいずれかから取得する。

- A8.net（提携済みプログラムの成果報酬リンク）
- もしもアフィリエイト（提携済みプログラムの成果報酬リンク、「どこでもリンク」機能）
- 楽天アフィリエイト（商品個別リンク、リンク制作フォームから発行）

記事執筆時点でリンクが未発行の場合は、商品名のみのプレーンテキストで下書きを作成し、
`wordpress_posts_queue.csv` の `affiliate_link_status` を `pending` にする。
実際のリンク発行・挿入は別工程として行い、挿入後に `inserted` へ更新する。

---

## 5. 統合運用フロー

```
1. テーマ選定       : 対象アフィリエイトプログラム（A8/もしも/楽天）と読者ニーズから選定
2. 記事タイプ・検索意図判定 : AFFILIATE_ARTICLE_STANDARDS.md §1・§2
3. 本文執筆         : 旧エディター推奨（§2）、目標文字数レンジ内で執筆
4. wordpress_posts_queue.csv 登録 : draft_status=not_started で1行追加
5. ブラウザ下書き作成 : Claude in Chrome でWordPress編集画面に入力→「下書き保存」のみ
                        （公開ボタンは押さない）。draft_status を draft_saved に更新
6. 品質ゲート        : quality-reviewer / compliance-qa-reviewer によるQAスコアリング
                        （AFFILIATE_ARTICLE_STANDARDS.md §7）→ 85点以上のみ次へ
7. アフィリエイトリンク挿入 : 未発行の場合はA8/もしも/楽天でリンクを発行し本文へ挿入
8. 人間の最終確認     : ゆうさんがリンク・料金情報・キャンペーン期限の正確性を確認
9. 人間が公開         : ゆうさん本人が「公開」ボタンを押す（AIは操作しない）
                        draft_status を published に更新、published_url/published_at記入
10. 計測ループ        : WordPress標準の統計情報＋アフィリエイト側の成果画面を突き合わせ、
                        metrics.csv に手動記入（note・Threadsと同じ運用）
```

---

## 6. wordpress_posts_queue.csv

`products/revenue-intelligence-os/data/wordpress_posts_queue.csv` を新規作成した
（`note_posts_queue.csv` と対になるスキーマ、TASK-031で追加）。

主なカラム: `id / keyword / search_intent / article_type / target_word_count_min /
target_word_count_max / actual_word_count / affiliate_program / product_name /
qa_score / compliance_score / affiliate_link_status / wp_edit_url / draft_status /
published_url / published_at / added_date`

詳細はファイル冒頭のコメントを参照。

---

## 7. 非対応・保留事項（意図的に作らないもの）

- WordPress REST APIによる自動投稿（現状は手動ブラウザ操作のみ）
- 独自ドメインの自動取得（有料プラン契約が前提、課金判断が必要なため保留）
- ゆうさんの投稿ごとの承認を経ないAIによる「公開」ボタン操作（承認があれば
  `CLAUDE.md`「本番投稿・公開の承認制ルール」・本SOP §1に従い実行可、2026-08-05改定）
- 検索順位・競合文字数の自動取得（`AFFILIATE_ARTICLE_STANDARDS.md` §0参照、
  有料SEO API未契約）

## 8. 次のアクション（要ゆうさん確認）

- 第1弾記事「美容室・飲食店・整体院向け ホームページ制作会社9社比較【2026年最新】」
  （下書きID: post=27）に、実際のもしもアフィリエイトリンクを挿入する作業
- `wordpress_posts_queue.csv` の運用開始（次の記事から使うか）の確認
