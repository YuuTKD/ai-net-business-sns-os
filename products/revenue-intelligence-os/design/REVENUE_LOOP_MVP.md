# REVENUE_LOOP_MVP — 最初の収益ループ（§9）

## 対象
- **顧客**: 小規模店舗経営者（飲食・美容・コンサル）
- **テーマ**: 店舗利益改善 / AI業務自動化
- **集客**: Threads（@ai_store_lab・68フォロワー）
- **中間コンテンツ**: note
- **収益**: Brain「AI店舗集客7日間立て直しキット」¥1,980【2026-08-02 値下げ改定・旧¥3,980】（＋規約OKなアフィリ1件）

## 導線（既存資産の再利用・新規構築不要）
```
Threads投稿（AI×店舗効率化の具体Tips）
  → プロフィール/投稿から note（無料の詳しい解説）
    → note末尾CTA → Brain ¥1,980（本編・テンプレ集）
      → （関連）規約適合アフィリ1件
```

## 計測（[[DATA_MODEL]] / [[ID_AND_IDEMPOTENCY_POLICY]]）
- UTM: `utm_source={media}&utm_medium={organic|social}&utm_campaign={theme}-{experiment_id}&utm_content={variant}`
- 記録: 表示→クリック→note遷移→Brain遷移→購入→（アフィリ）発生→承認
- 実測と推定を分離。欠損は `unknown`（捏造しない）。

## 判定ルール
| 期間 | 見る指標 | 改善対象 |
|---|---|---|
| 24-72h | 表示/保存/コメント/クリック | タイトル・冒頭・切り口 |
| 7-14日 | note遷移/Brain遷移/申込 | CTA・導線・商品 |
| 30日 | 購入/承認報酬/粗利÷稼働 | SCALE/ITERATE/HOLD/STOP |

- **SCALE**: 承認利益/稼働が目標超＋再現シグナル
- **STOP**: 十分データ（≥1,000表示 or ≥50クリック）で明確な負
- **ITERATE**: 混在＋単一レバー明確 / **HOLD**: データ不足

## 30日 成功条件 / 停止条件
- 成功: **初販売1件以上**・note→Brain遷移が計測可能・承認成果3件（PHASE1 DoD）
- 停止: 十分表示で負・規約リスク・稼働対効果<閾値

## 横展開の順番（§22・成功確認後）
1. Threads＋note → 2. ブログ/Substack → 3. Instagram → 4. YouTube Shorts → 5. 楽天ROOM → 6. YouTube長尺
（需要調査・Evidence Pack・QA・計測は再利用、媒体専用Adapterのみ追加）

関連: [[N8N_WORKFLOW_CATALOG]] [[DATA_MODEL]] [[WIP_POLICY]]
