# 実験 EXP001 設計
作成日: 2026-07-29
起票: experiment-designer（メインClaude統括）
関連: aud_01 × off_18（→ off_15 接続）／ hypothesis: hyp_01

## 仮説（hyp_01）
独立系飲食店オーナー（利益率悪化）は、「一般的な節約アドバイス」よりも
**「固定費（決済手数料・法人カード・会計）の“具体的な削減額”を提示し、無料の利益改善診断へ誘導する切り口」** の方が、
リンククリック（診断/問い合わせ導線）が増える。

## テスト対象
Substack記事＋Threads2本（同一マスターから媒体別変換）。導線は自社「無料 固定費見直し診断」への1リンク。

## 変更変数（1つだけ）
**切り口（angle）**
- control（基準・今回は非公開の理論基準）: 「コスト削減の一般論アドバイス」
- variant（今回公開）: **「具体的な固定費削減額の提示＋損失回避フレーム＋無料診断CTA」**

※他の要素（テーマ・媒体・投稿時間帯・CTAボタン文言）は固定し、切り口のみを検証対象とする。

## 計測（UTM）
- リンク: 自社「無料 固定費見直し診断」LP または LINE/問い合わせ導線
- `utm_source={substack|threads}` `utm_medium={organic|social}` `utm_campaign=costcut-EXP001` `utm_content=numloss`
- 記録先: data/metrics.csv（表示/クリック/link_clicks/申込）、data/attribution.csv（click→申込→発生→承認）

## 成功条件（success_condition）
14日以内に link_click率 ≥ 1.0%（対 表示）**かつ** 無料診断の申込 ≥ 1件。

## 停止条件（stop_condition）
表示 ≥ 1,000 到達時点で link_click率 < 0.3% が続く場合は STOP候補（切り口を棄却しITERATE）。

## 必要データ量（min_data）
判定前に ≥1,000 表示 もしくは ≥50 link_clicks。未達は **HOLD（STOPにしない）**。

## 判定期限（judge_by）
2026-08-12（14日後）。growth-decision-director が SCALE/ITERATE/HOLD/STOP を提案。

## 未確定・要提供（ログイン不要）
- 「無料 固定費見直し診断」の遷移先URL（LP or LINE公式 or 問い合わせフォーム）。無ければ暫定でLINE/メール導線を使用。

## コンプラ注意
「必ず削減」「絶対に儲かる」等の断定は景表法回避のため禁止。削減額は「事例・条件付きの目安」と明記し、出典/前提を添える。
