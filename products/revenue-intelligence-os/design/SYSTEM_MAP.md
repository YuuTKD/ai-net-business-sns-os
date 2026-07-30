# SYSTEM_MAP — Revenue Intelligence OS

作成: Phase 2 / 前提: Phase 0・1 監査（実測ベースライン）

## 1. 全体像（半自動建設方式）

```
ゆう（経営者）  … Yes/No・ログイン・認証・実体験提供のみ
   │
Revenue Portfolio Controller（本OS）… 事業の整理・実行/統合/保留/停止判断
   │
Claude Code（技術責任者）… 設計・コード・n8n JSON・Agent・テスト・Git
   │
Browser Use（作業員）    … n8n/note/SNS 画面操作（公開直前で停止）
   │
n8n（現場監督）          … 順序実行・承認待ち・再試行・記録（Phase2で構築）
   │
各媒体・ASP・DB          … 実際の公開・売上・データの正本
```

## 2. 情報の正本（source of truth）

| 種類 | 正本の場所 | 備考 |
|---|---|---|
| コード・Prompt・Skill・Agent・n8n JSON | GitHub `ai-net-business-sns-os` | 本PRの追加レイヤー |
| Job・実験・計測データ | `data/*.csv`（Phase2でDB/Sheets Projection化検討） | 現状CSV 10種 |
| 記事・画像・Evidence Pack | `content/`（将来 Drive/Object Storage） | note/Substack本文一式 |
| 公開状況 | note / Threads / Substack / Brain | 各媒体が正本 |
| 実売上・承認報酬 | note / Brain / ASP管理画面 | 実測のみ。推定と分離 |

## 3. 実測ベースライン（2026-07-30）

| 媒体/商品 | 状態 | 実績 |
|---|---|---|
| Threads @ai_store_lab | 稼働・Bioに Brain導線 | フォロワー68 |
| note（YUU） | 公開2（有料¥980×1）/下書き9 | ビュー9・売上¥0・購入0 |
| Substack 店主のAI時短メモ | 公開5/下書き8 | 登録1・収益0 |
| Brain「AI店舗集客7日間立て直しキット」 | 販売中 ¥3,980（アフィリ50%） | レビュー0・販売ほぼ未発生 |
| n8n `yuu1988.app.n8n.cloud` | 無料試用（残14日） | Workflow 0・実行0/1000 |

→ **商品・媒体・下書きは整備済み、トラフィックと販売がゼロ**。Phase 2 は「計測付きで最初の1本を回し切る」ための基盤づくり。

## 4. コンポーネント責務の要約
- **本OS**: 事業ルール・スコア・Prompt・品質基準の一元管理（n8nに埋め込みすぎない）
- **Claude Code**: 設計〜テスト〜Git。公開/送信/課金/削除/push は人間承認ゲート
- **Browser Use**: 画面操作のみ・事業判断なし・公開直前停止
- **n8n**: Manual Trigger + dry-run から開始・無断Activate禁止

関連: [[RESPONSIBILITY_MATRIX]] [[REVENUE_LOOP_MVP]] [[N8N_WORKFLOW_CATALOG]]
