# ID_AND_IDEMPOTENCY_POLICY — ID体系と重複防止（§12）

## 階層ID
```
portfolio_id
└─ campaign_id
   └─ experiment_id
      └─ evidence_pack_id
         └─ content_asset_id
            └─ distribution_id
               └─ link_id
                  └─ revenue_event_id
```
- すべての作業に `job_id` を付与（[[JOB_STATE_MACHINE]]）。
- 命名例: `port-rio` / `camp-store-ai` / `exp-001` / `ev-001` / `ca-note-001` / `dist-threads-001` / `link-brain-001` / `rev-0001`。
- **既存データとの関係（注記）**: 上記のダッシュ区切りは Phase2 で新設する `jobs` / `evidence_packs` 用の規約。Phase1由来の既存CSV（`EXP001`, `off_01`, `hyp_01`, `aud_01` 等）は別の命名（大文字+連番／アンダースコア）が既に定着しており、**過去データは変更しない**（後方互換）。新規追加分（例: `off_21`, `hyp_09`）は既存CSVの慣習に合わせて追記し、`jobs`/`evidence_packs` 等の全く新しいテーブルのみダッシュ区切りを採用する。

## 冪等性キー（最低限）
```
idempotency_key = account_id + platform + content_asset_id + action_type
```
- 同一キーの外部操作（下書き作成・投稿）は**1回のみ**成功させる。
- n8n の各外部アクション前に `jobs` を参照し、同キーの完了/進行中があればスキップ。

## 再実行前チェック（§12・§20合格条件）
外部操作の再試行前に必ず:
1. 外部サービス側に既に下書き/投稿が作られていないか確認（Browser Use / API）
2. `jobs` の state と retry_count を確認
3. 重複が疑わしい場合は停止して報告

## 二重防止の適用先
- note下書き作成 / Substack下書き / Threads投稿候補 / Brain導線リンク発行 / 計測イベント記録

関連: [[JOB_STATE_MACHINE]] [[DATA_MODEL]] [[N8N_WORKFLOW_CATALOG]]
