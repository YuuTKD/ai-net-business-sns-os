# AUTO PR FLOW — ローカルPR自動連携フロー（Codex 120点版）

作成日: 2026-07-10
対象プロジェクト: ai-net-business-sns-os

---

## 概要

Claude Codeによる作業完了後、PR作成→Codexレビュー→判定→Safe Merge Gateまでを自動化するフロー。
Codexは「品質責任者・安全監査役・売上導線監査役・自動化暴走防止役」として機能する。
FIX判定は最大3回まで自動修正ループを許可する。

```
作業完了
↓
git status確認
↓
対象ファイルだけ git add（git add . 禁止）
↓
git commit
↓
git push
↓
PR作成（gh pr create）
↓
./scripts/agent/pr_auto_flow.sh --pr <PR番号>
  ├── gh auth確認
  ├── ブランチ確認（main上なら停止）
  ├── PR情報取得
  ├── FIX試行回数確認
  ├── リスク判定（低リスク / 高リスク）
  ├── Codexレビュー実行（120点版）
  │     └── data/reports/codex_review_pr_<N>.txt に保存
  ├── GO / FIX / STOP 判定
  │     ├── STOP → 即停止（人間確認必須）
  │     ├── FIX  → fix_instruction_pr_<N>.md 生成
  │     │          → 試行カウント（最大3回）
  │     │          → 3回超えたら停止（exit 5）
  │     └── GO   → Safe Merge Gateへ（試行カウントリセット）
  ├── Safe Merge Gate実行
  │     └── data/reports/safe_merge_pr_<N>.txt に保存
  └── リスク判定
        ├── 高リスクPR → Merge前停止（人間確認必須）
        └── 低リスクPR → ラベル付与 → AUTO_MERGE=1 → main pull
```

---

## Codexの役割

Codexはファイルを直接修正しない。監査・判定・指示のみを担当する。

| 役割 | 内容 |
|---|---|
| Merge前レビュー責任者 | 全PRをMerge前に監査する |
| 安全監査役 | Secret・deploy・外部送信・自動化暴走を検知する |
| コンプライアンス監査役 | 禁止表現・アフィリエイト表記・法規制を確認する |
| CSV/Markdown/Obsidian整合性チェック担当 | データ整合性を確認する |
| 自動化暴走防止役 | 自動投稿・DM・リプ・Schedulerを検知する |
| 売上直結度レビュー担当 | Brain初売上30日以内という目的基準で評価する |
| FIX指示作成担当 | Claude Codeへの修正指示ファイルを生成する |
| リスク分類担当 | 低/中/高リスクPRを分類する |
| 人間判断明示担当 | 人間のみが判断できる項目をリストアップする |

**重要:** Claude Code は作る・直す。Codex は監査する・止める・直させる。

---

## スクリプトの場所

| スクリプト | 役割 |
|---|---|
| `scripts/agent/pr_auto_flow.sh` | メインフロー制御・FIX試行回数管理 |
| `scripts/review/codex_pr_review.sh` | Codex 120点版レビュー依頼 |
| `scripts/agent/safe_auto_merge_pr.sh` | Safe Merge Gate（監査＋Merge） |

---

## 使い方

### 基本

```bash
export PATH="/Users/tokudayuya/.local/bin:/opt/homebrew/bin:$PATH"
./scripts/agent/pr_auto_flow.sh --pr <PR番号>
```

### ドライラン（実際にはMergeしない）

```bash
./scripts/agent/pr_auto_flow.sh --pr <PR番号> --dry-run
```

### FIX試行回数リセット

```bash
./scripts/agent/pr_auto_flow.sh --pr <PR番号> --reset-attempts
```

### 出力ファイル

| ファイル | 内容 |
|---|---|
| `data/reports/codex_review_pr_<N>.txt` | Codexレビュー全文（120点版） |
| `data/reports/fix_instruction_pr_<N>.md` | FIX時の修正指示（試行回数付き） |
| `data/reports/safe_merge_pr_<N>.txt` | Safe Merge Gate結果 |
| `data/reports/fix_attempt_pr_<N>.txt` | FIX試行回数（最大3回で停止） |

---

## GO / FIX / STOP の意味

| 判定 | 意味 | exit code | 次のアクション |
|---|---|---|---|
| `GO` | 問題なし・Merge可能 | 0 | Safe Merge Gateへ進む（試行カウントリセット） |
| `FIX` | 修正が必要（危険ではない） | 2 | fix_instruction を読んで修正 → 再push → 再実行 |
| `FIX(3回超)` | 自動修正上限到達 | 5 | 停止・人間確認待ち |
| `STOP` | 危険・人間判断が必要 | 3 | 即停止 / 自動修正禁止 / 人間が判断 |

---

## FIX自動修正ループ（最大3回）

```
FIX判定（exit 2）
↓
data/reports/fix_instruction_pr_<N>.md を読む
↓
自動修正してよい内容を修正
↓
対象ファイルだけ git add → commit → push
↓
./scripts/agent/pr_auto_flow.sh --pr <N> 再実行
↓
GO → Safe Merge Gate（終了）
FIX 2回目 → 同様に繰り返す
FIX 3回目 → 同様に繰り返す
FIX 3回超 → exit 5（停止・人間確認待ち）
STOP → exit 3（即停止）
```

### 自動修正してよい内容

| 種類 | 例 |
|---|---|
| CSV整合性 | 列数修正・model_id統一・日付形式 |
| Markdownリンク | リンク先修正・テキスト参照に変換 |
| Obsidianリンク | Vault外リンク → テキスト参照に変換 |
| 表記ゆれ | typo・統一表記 |
| 日付・曜日 | 不整合修正 |
| コンプライアンス | 注記追加・参照URL追加・主体名プレースホルダー |
| 個人情報 | 取り扱い説明追加・保存期間・削除窓口 |
| 危険表現 | 安全な言い換え |

### 自動修正してはいけない内容

| 種類 | 理由 |
|---|---|
| `scripts/**` の実行ロジック大幅変更 | 本番影響リスク |
| `agents/**` / `config/**` / `.env` | 設定変更リスク |
| deploy / Scheduler / Cloud Run | 本番障害リスク |
| 外部送信 / 自動投稿 / 自動DM / 自動リプ | スパム・規約違反リスク |
| 決済 / 顧客データ / 商品マッチ先AI | セキュリティリスク |
| 法務・仕様判断が必要な変更 | 人間判断が必要 |

---

## Codexレビュー 10観点

Codexは毎回、以下10観点でレビューする。

| 観点 | 内容 |
|---|---|
| 1. 安全性 | Secret/APIキー/本番データ混入チェック |
| 2. 自動化暴走リスク | 自動投稿/DM/リプ/Scheduler有効化チェック |
| 3. ファイルリスク分類 | 低リスク/中リスク/高リスク分類 |
| 4. CSV整合性 | 列数・model_id・日付・PII混入チェック |
| 5. Markdown/Obsidian整合性 | リンク・曜日・Vault外リンクチェック |
| 6. コンプライアンス | 禁止表現・アフィリエイト表記・個人情報チェック |
| 7. 売上直結度 | Brain初売上30日以内への貢献度（⭐1〜5） |
| 8. Phase逸脱チェック | Phase 1の範囲内か確認 |
| 9. 既存構成破壊チェック | 既存フラグ・設定の変更チェック |
| 10. 実行可能性 | 1日60〜90分で進められるか・次アクションが明確か |

---

## 売上直結度レビュー

このプロジェクトの最重要目的：**30日以内にBrain初売上を作ること**。
Codexレビューでは安全性だけでなく「この変更はBrain初売上に近づいているか？」も評価する。

### Brain初売上に近い変更（優先）

- Brain記事コンテンツ草案生成
- 固定投稿テンプレート作成
- リプ営業テンプレート作成
- 診断フォーム設計・レポートテンプレート
- 低単価部品商品の設計（¥980〜¥1,980）

### Phase 1過剰（次PRでよい or FIX対象）

- LINE本格構築 / Google Workspace本番接続 / SaaS開発
- SEO大量記事生成 / 自動投稿の本番化
- ただの管理資料追加で売上に近づかない変更

---

## リスク判定ルール

### 低リスクPR（自動Merge対象）

| パターン | 例 |
|---|---|
| `docs/**` | docs/AUTO_PR_FLOW.md |
| `obsidian/**` | obsidian/AI-NET-BUSINESS/... |
| `data/revenue_portfolio/**` | fast_revenue_ideas.csv |
| `data/analytics/**` | weekly_summary.csv |
| `data/posts/**` | post_templates.md |
| `data/outreach/**` | reply_templates.md |
| `.claude/commands/**` | pr-auto-flow.md |
| `README.md` / `TASK.md` / `REPORT.md` | — |

### 高リスクPR（自動Merge禁止・人間確認必須）

| パターン | 理由 |
|---|---|
| `scripts/**` | 自動化ロジック変更 |
| `agents/**` | エージェント設定変更 |
| `apps/**` | アプリケーション変更 |
| `core/**` | コア機能変更 |
| `config/**` | 設定変更 |
| `.env*` | 環境変数 |
| `package.json` | 依存関係変更 |

### 高リスクキーワード

PR差分に以下のキーワードを含む場合も高リスク扱い：

- Cloud Run / Scheduler / OAuth / API接続
- 自動投稿 / 自動DM / 自動リプ
- LINE送信 / Gmail送信 / Google Workspace本番書き込み
- 決済 / 顧客データ / 商品マッチ先AI再開

---

## 高リスクPRのMergeフロー（人間が実行）

```bash
# 1. レビュー内容確認
cat data/reports/codex_review_pr_<PR番号>.txt
cat data/reports/safe_merge_pr_<PR番号>.txt

# 2. 問題がなければラベル付与
gh pr edit <PR番号> --add-label 'safe-auto-merge'

# 3. Merge
AUTO_MERGE=1 ./scripts/agent/safe_auto_merge_pr.sh <PR番号>

# 4. main pull
git checkout main && git pull origin main && git status
```

---

## STOP時の人間確認フロー

1. `data/reports/codex_review_pr_<N>.txt` を読んで問題を把握する
2. 問題を手動で修正する（Claude Codeへの指示は可）
3. 修正後、必要に応じて `--reset-attempts` でリセット
4. `./scripts/agent/pr_auto_flow.sh --pr <N>` を再実行する
5. 重大な問題の場合はPRを閉じて新しい安全なブランチで作業をやり直す

---

## 禁止事項

| 禁止 | 理由 |
|---|---|
| `git add .` | 意図しないファイル混入 |
| 高リスクPRの自動Merge | 本番障害防止 |
| STOP判定の無視 | セキュリティ・品質保護 |
| FIX 3回超えても自動修正を続けること | 無限ループ防止 |
| 本番デプロイ | 承認なし公開事故防止 |
| 自動投稿 / 自動DM / 自動リプ | プラットフォーム規約・スパム |
| APIキー / Token / Secret表示 | Secret漏洩防止 |
| Google Workspace本番書き込み | APPROVED_FOR_LIVE=false |
| 決済処理の自動実行 | セキュリティリスク |

---

## データフロー図

```
Claude Code
  │
  ▼
[git add/commit/push]
  │
  ▼
[gh pr create]
  │
  ▼
scripts/agent/pr_auto_flow.sh --pr N
  │
  ├── FIX試行回数チェック（data/reports/fix_attempt_pr_N.txt）
  │
  ├── scripts/review/codex_pr_review.sh N  ← 120点版プロンプト
  │     └── data/reports/codex_review_pr_N.txt
  │
  ├── 判定: GO / FIX / STOP
  │     ├── GO   → 試行カウントリセット → Safe Merge Gateへ
  │     ├── FIX  → fix_attempt_pr_N.txt インクリメント
  │     │          → fix_instruction_pr_N.md 生成
  │     │          → exit 2（Claude Codeが修正して再実行）
  │     │          → 3回超: exit 5（停止・人間確認待ち）
  │     └── STOP → exit 3（即停止・人間確認必須）
  │
  ├── scripts/agent/safe_auto_merge_pr.sh N
  │     └── data/reports/safe_merge_pr_N.txt
  │
  └── リスク判定
        ├── 高リスク → exit 4（停止・人間がMerge）
        └── 低リスク → gh pr edit --add-label safe-auto-merge
                     → AUTO_MERGE=1 safe_auto_merge_pr.sh N
                     → git checkout main && git pull origin main
```

---

## FIX試行回数の状態管理

```
data/reports/fix_attempt_pr_<N>.txt
  - 存在しない   : 0回（初回）
  - 内容 "1"     : 1回目完了・2回目へ
  - 内容 "2"     : 2回目完了・3回目へ
  - 内容 "3"     : 3回目完了・停止（exit 5）

リセット: --reset-attempts フラグ または ファイルを削除
GO達成時: 自動的にリセット（ファイル削除）
```

---

## テスト方法

```bash
# ドライランでフロー確認
./scripts/agent/pr_auto_flow.sh --pr 9 --dry-run

# FIX試行回数リセットして再実行
./scripts/agent/pr_auto_flow.sh --pr 11 --reset-attempts
```

---

*このドキュメントの更新はゆうさん承認PRを通じてのみ行う。*
