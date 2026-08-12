# /pr-auto-flow

Claude Code作業完了後、PR作成→Codexレビュー→Safe Merge Gateまでを自動で進めるフロー。
`scripts/**` 等の高リスクPRはMerge前で必ず停止し、人間確認を求める。
Codexは「品質責任者・安全監査役・売上導線監査役・自動化暴走防止役」として機能する。

## 使い方

```
/pr-auto-flow <PR番号>
/pr-auto-flow <PR番号> --dry-run
/pr-auto-flow <PR番号> --reset-attempts
```

## このスキルが実行すること

以下のフローを `scripts/agent/pr_auto_flow.sh` を通じて実行する。

```
gh auth確認
↓
mainブランチ上なら停止
↓
PR情報取得（タイトル・状態・ファイル一覧）
↓
FIX試行回数確認（data/reports/fix_attempt_pr_<N>.txt）
↓
リスク判定（低リスク / 高リスク）
↓
Codexレビュー実行（120点版）
  → data/reports/codex_review_pr_<PR番号>.txt に保存
↓
GO / FIX / STOP 判定
  GO   → Safe Merge Gateへ（FIX試行カウンターをリセット）
  FIX  → data/reports/fix_instruction_pr_<PR番号>.md 生成
         → 試行回数インクリメント
         → 最大3回まで自動修正ループ
         → 3回超えたら停止（exit 5）・人間確認待ち
  STOP → 即停止（exit 3）・自動修正禁止
↓
Safe Merge Gate実行
  → data/reports/safe_merge_pr_<PR番号>.txt に保存
↓
低リスクPRのみ: ラベル付与 → AUTO_MERGE=1 → main pull
高リスクPRは: 停止して人間にMergeを委ねる
```

## 実行方法

ユーザーが `/pr-auto-flow 11` と入力した場合、以下を実行する：

```bash
export PATH="/Users/tokudayuya/.local/bin:/opt/homebrew/bin:$PATH"
./scripts/agent/pr_auto_flow.sh --pr $ARGUMENTS
```

`--dry-run` が指定された場合：

```bash
export PATH="/Users/tokudayuya/.local/bin:/opt/homebrew/bin:$PATH"
./scripts/agent/pr_auto_flow.sh $ARGUMENTS
```

## Codexの役割（固定）

Codexはファイルを直接修正しない。監査・判定・指示のみを担当する。

| 役割 | 内容 |
|---|---|
| Merge前レビュー責任者 | 全PRをMerge前に監査する |
| 安全監査役 | Secret・deploy・外部送信を検知する |
| コンプライアンス監査役 | 禁止表現・アフィリエイト表記を確認する |
| 整合性チェック担当 | CSV・Markdown・Obsidianの整合性を確認する |
| 自動化暴走防止役 | 自動投稿・DM・リプ・Schedulerを検知する |
| 売上直結度レビュー担当 | Brain初売上30日以内という目的基準で評価する |
| FIX指示作成担当 | Claude Codeへの修正指示ファイルを生成する |
| リスク分類担当 | 低/中/高リスクPRを分類する |
| 人間判断明示担当 | 人間のみが判断できる項目をリストアップする |

## GO / FIX / STOP の意味

| 判定 | 意味 | 次のアクション |
|---|---|---|
| `GO` | 問題なし・Merge可能 | Safe Merge Gateへ進む |
| `FIX` | 修正が必要（危険ではない） | fix_instruction を読んで修正 → 再push → 再実行（最大3回） |
| `STOP` | 危険・人間判断が必要 | 即停止 / 自動修正禁止 / 人間が判断 |

## FIX自動修正ループ（最大3回）

```
FIX判定
↓
fix_instruction_pr_<N>.md を読む
↓
自動修正してよい内容だけ修正:
  ✅ CSV列数修正・model_id統一
  ✅ Markdownリンク修正
  ✅ Obsidianリンク修正（Vault外→テキスト参照）
  ✅ typo / 表記ゆれ修正
  ✅ 日付・曜日修正
  ✅ コンプライアンス注記追加
  ✅ 個人情報取り扱い説明追加
  ✅ 危険表現の安全な言い換え
↓
対象ファイルだけ git add（git add . 禁止）
↓
git commit → git push
↓
./scripts/agent/pr_auto_flow.sh --pr <N> を再実行
↓
まだFIX → 2回目修正（同様に繰り返す）
まだFIX → 3回目修正（同様に繰り返す）
3回目でもFIX → 停止・人間確認待ち
GOになった → Safe Merge Gateへ
```

### 自動修正してはいけない内容

- `scripts/**` の実行ロジック大幅変更
- `agents/**` / `config/**` / `.env`
- deploy / Scheduler / Cloud Run
- 外部送信 / 自動投稿 / 自動DM / 自動リプ
- 決済 / 顧客データ / 商品マッチ先AI再開
- 法務・仕様判断が必要な変更

## 低リスクPR（自動Merge対象）

- `docs/**` / `obsidian/**`
- `data/revenue_portfolio/**` / `data/analytics/**`
- `data/posts/**` / `data/outreach/**`
- `.claude/commands/**`
- `README.md` / `TASK.md` / `REPORT.md`

## 高リスクPR（自動Merge禁止・人間確認必須）

- `scripts/**` / `agents/**` / `apps/**` / `core/**` / `config/**`
- `.env*` / `package.json`
- Cloud Run / Scheduler / OAuth / 自動投稿 / 自動DM / 自動リプ
- LINE送信 / Gmail送信 / Google Workspace本番 / 決済 / 顧客データ

## Phase 1の目的（Brain初売上30日以内）

このプロジェクトの最重要目的はBrain初売上を30日以内に作ること。
Codexレビューでは「この変更はBrain初売上に近づいているか？」も評価する。

### Phase 1でやるべきこと

- Brain記事 / 固定投稿 / Threads投稿 / リプ営業テンプレ
- CSV台帳 / 7日PDCA / 診断レポート設計 / 低単価部品商品

### 管理資料追加だけのPRはFIX対象

ただの管理資料追加で売上に近づかない変更は、次PRでよい or FIX判定になる場合がある。

## FIX試行回数リセット

```bash
./scripts/agent/pr_auto_flow.sh --pr <PR番号> --reset-attempts
```

## 出力ファイル

| ファイル | 内容 |
|---|---|
| `data/reports/codex_review_pr_<N>.txt` | Codexレビュー全文 |
| `data/reports/fix_instruction_pr_<N>.md` | FIX時の修正指示 |
| `data/reports/safe_merge_pr_<N>.txt` | Safe Merge Gate結果 |
| `data/reports/fix_attempt_pr_<N>.txt` | FIX試行回数 |

## 禁止事項

- `git add .` — 使用禁止
- 高リスクPRの自動Merge
- STOP判定の無視
- FIX 3回超えても自動修正を続けること
- Secret / APIキー / Token の表示

## 仕様詳細

`docs/AUTO_PR_FLOW.md` を参照。
