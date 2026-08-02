# RIO 700系 運用手順（下書き準備レイヤー）

DEV_RIO_701 / 702 / 704 / 705 の本番運用手順。**これらは「配布用の下書きを準備するだけ」で、自動投稿・自動リプライ・自動展開・実アフィリリンク生成はしない**（CLAUDE.md『本番SNS自動投稿の実行』禁止に準拠）。

## 各ワークフローの役割

| WF | 入力 | 出力（下書き） | 公開 |
|----|------|--------------|------|
| DEV_RIO_701 | 103の記事(note_body/theme) | アフィリ挿入案 × 最大3（ジャンル/位置/アンカー＋リンク差し込み欄） | ❌ 人間が手動 |
| DEV_RIO_702 | 103の記事(note_body/theme) | X投稿の下書き × 3（各140字・ハッシュタグ） | ❌ 人間が手動 |
| DEV_RIO_704 | 103の記事(note_body/threads_post/theme) | 他媒体リパーパス下書き × 3（Instagramキャプション/ショート動画台本/Substack導入） | ❌ 人間が手動 |
| DEV_RIO_705 | 103のthreads_post | 楽天リプライ下書き × 2（＋リンク差し込み欄） | ❌ 人間が手動 |

いずれも `active: false`・外部投稿APIを呼ばない・`Stop Before…` ノードで公開直前停止。

## 前提（1回だけ）

- n8n に Anthropic クレデンシャルが登録済みであること（名称: `Anthropic account`、既存の DEV_RIO_101/103 と同じもの）。HTTPノードは `predefinedCredentialType: anthropicApi` でこれを参照する。
- 3つの JSON を n8n UI で Import from file（`products/revenue-intelligence-os/workflows/n8n/DEV_RIO_70x_*.json`）。

## QAゲート

各WFは先頭で `qa_status` を判定し、**`PASS` のときだけ**下書きを生成する。
`FIX_REQUIRED` / `BLOCK`（品質未達）は `SKIPPED_NOT_PASS` で停止 → 品質未達コンテンツを配布準備しない。
手動テストで `qa_status` を渡さない場合は `PASS` 扱い。

## 運用フロー（手動・1コンテンツあたり数分）

1. DEV_RIO_103 を実行し、出力（`content_id / theme / note_body / threads_post / qa_status`）を得る。
2. その JSON を 701/702/705 の Manual Trigger にコピーして各実行（103と手動で繋ぐ。自動チェインにはしない）。
3. 各WFの Result に出た下書きを**人間が確認・修正**する。
   - 701/705 は `..._link_placeholder` を、**自分の**楽天/AmazonアフィリID付きリンクに差し替える。
   - `draft_error` が入っている場合は AI生成失敗 → 手動で下書きを書く。
4. 問題なければ、**人間が各SNSに手動で投稿**する。

## 本番運用ステータス

- 3WFとも `active: false` のまま運用する（Cronで自動化＝自動投稿になるため意図的にしない）。
- 「本番運用可能」＝ インポートすれば手動トリガーで安定動作し、下書きを生成できる状態。検証済み: JSON構文・パースのエッジケース（fenced/preamble/整形JSON・API error・不正出力の graceful fallback）。

## 非対応（意図的に作らないもの）

- 自動投稿 / 自動リプライ / スケジュール投稿（CLAUDE.md 禁止）
- 実アフィリエイトURLの自動生成（アフィリID未保有・偽URL防止のためプレースホルダのみ）
- クリック/売上の自動トラッキング（実測基盤ができてから別途検討）
