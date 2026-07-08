# TEAM_RULES.md — ai-net-business-sns-os

人間・AI問わず、このリポジトリで作業するすべての担当者が守るルール。

---

## ブランチ命名規則

| プレフィックス | 用途 | 例 |
|--------------|------|-----|
| `feature/` | 新機能・新コンテンツ追加 | `feature/brevo-sequence-v2` |
| `fix/` | バグ修正・誤記修正 | `fix/gumroad-price-typo` |
| `setup/` | 初期設定・ツール導入 | `setup/codex-claude-pr-workflow` |
| `docs/` | ドキュメントのみの変更 | `docs/update-readme` |
| `ops/` | 運用ファイル・Scheduler 設定 | `ops/daily-post-schedule` |

`main` ブランチへの直接コミットは禁止。必ずブランチを切る。

---

## PRルール

1. **PR テンプレートを必ず使う**（`.github/pull_request_template.md`）
2. **セルフマージ禁止**（自分が作ったPRを自分でmergeしない。AIも含む）
3. **ゆうさんの承認コメントがあるまで merge しない**
4. **1 PR = 1 目的**（複数の独立した変更を1つのPRに混ぜない）
5. PRタイトルは日本語で簡潔に（例: `SNS投稿テンプレートv2追加`）

---

## 絶対禁止事項

| 禁止 | 代替手段 |
|------|---------|
| `git add .` | ファイルを個別に `git add <file>` |
| `git push --force` | 履歴を守る。必要な場合はゆうさんに相談 |
| `main` への直接 push | ブランチ → PR → 承認 → merge |
| `.env.local` の変更・コミット | 環境変数はゆうさんが管理 |
| Secret・APIキーのファイル記載 | 環境変数として管理 |
| 本番自動投稿・自動DMの手動トリガー | SNS品質チェック → 承認 → 実行 |
| 承認なしデプロイ | `pre-deploy-qa` → 承認 → デプロイ |
| 既存 Skill / Knowledge の削除 | 追加・改修のみ可 |

---

## 作業単位の原則

- **小さく作る**: 1PRの変更は可能な限り小さく（レビューしやすい単位）
- **目的を明確に**: PR説明に「何のために変更したか」を必ず書く
- **TASK.md を更新する**: 作業開始・完了時にステータスを変える
- **REPORT.md を更新する**: PR merge 後に完了報告を記録する

---

## 承認フロー

```
担当者（Claude Code / Codex / 人）: ブランチ作成 → 実装 → PR作成
    ↓
ゆうさん: PRレビュー → 承認コメント（"LGTM" / "OK" / "承認"）
    ↓
担当者: merge → REPORT.md に完了記録
```

緊急でも承認なし merge は禁止。ゆうさんに連絡して承認を得る。

---

## コミットメッセージ規則

```
<種類>: <変更内容の要約>（日本語可）

例:
feat: Brevo 7日間ステップ配信メールv2追加
fix: Gumroad価格表記の誤字修正
docs: TEAM_RULES.md にブランチ命名規則を追加
setup: Codex × Claude Code PR連携の初期ファイル作成
```

---

## このファイルの更新ルール

ルール変更はゆうさんの承認を得た PR を通じてのみ行う。
