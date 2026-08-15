# AGENTS.md — ai-net-business-sns-os

Codex（OpenAI）エージェントが読む指示ファイル。
Claude Code と連携して動作する際のルールを定義する。

> このファイルの変更はゆうさんの承認を得た PR を通じてのみ可。
> Codex・Claude Code による直接編集・自律変更は禁止（末尾「更新ルール」参照）。

---

## AI TEAM BRIDGE（Claude Code ⇄ Codex Slack連携）

2026-08-16、ゆうさん承認のもと「AI TEAM BRIDGE」を発効。Claude Code と Codex が
Slack を介して意見交換・作業受け渡し・相互レビューを行う。

### 役割分担

| AI | 主担当 |
|----|--------|
| **Claude Code** | 実装・運用・自動化・システム統合・orchestration |
| **Codex** | 企画・制作・レビュー・リスクチェック・セカンドオピニオン |

意見が割れて合意に至らない場合、**どちらのAIも単独で決定しない**。
`[APPROVAL_REQUIRED]` として `#ai-team-approvals` に整理し、ゆうさんの判断を仰ぐ。

### Slackチャンネル構成

| チャンネル | 用途 |
|-----------|------|
| `#ai-team-bridge` | 機械処理用（[INSTRUCTION]/[RESULT] の受け渡し） |
| `#ai-team-strategy` | 会社・事業・企画の議論用（[DISCUSSION]/[REVIEW]/[RISK]） |
| `#ai-team-approvals` | ゆうさんの承認が必要な判断用（[APPROVAL_REQUIRED]/[DECISION]） |

### メッセージ形式（先頭タグ必須）

| タグ | 意味 |
|------|------|
| `[DISCUSSION]` | 意見交換・論点提起 |
| `[INSTRUCTION]` | 作業指示（TASK_ID 必須） |
| `[RESULT]` | 完了報告（TASK_ID 必須、成果物ファイル/URL 添付） |
| `[REVIEW]` | 相互レビュー結果 |
| `[RISK]` | リスク・コンプラ上の指摘 |
| `[APPROVAL_REQUIRED]` | ゆうさんの判断待ち |
| `[DECISION]` | 決定事項（`DECISIONS.md` にも記録） |

---

## エージェントの役割（スコープ）

Codex エージェントが担当**できる**タスク:

- コンテンツ案の生成（SNS投稿文・メール文・商品説明文）
- 企画・台本・サムネ案などの制作物ドラフト
- タスクの分解・TASK.md へのエントリ追加提案
- ドキュメントのドラフト作成
- コードのレビュー・提案・リスクチェック（実装は Claude Code が行う）
- **`LOCKS/` でロック取得済みの、自分の branch 内ファイルへの書き込み・commit**
  （`~/.ai-team/` の常時共有AIチーム方式・PR #81 で発効。手順は下記）
- **限定的な Slack 読み取り・投稿**（下記スコープの範囲内のみ）

Codex エージェントが担当**できない**タスク（引き続き禁止）:

- `.env.local` / Secret / 環境変数の参照・生成
- デプロイ・Scheduler 操作・権限変更
- 本番SNS投稿・自動DM送信・課金・データ削除
- ロックを取得していないファイル、他AIのロック中ファイルへの書き込み
- `main` への直接 push / merge、force push、他AIの branch 操作

### Slack スコープ（Codex に許可する範囲）

- **読み取り**: `#ai-team-bridge` / `#ai-team-strategy` / `#ai-team-approvals` の履歴
- **投稿**: 上記3チャンネルへの、上記メッセージ形式に沿った投稿
- **成果物**: サムネ等の制作物ファイル or URL を Slack 経由で受け渡し
- **禁止**: Secret・API Key・トークン・個人情報を Slack に投稿すること。
  外部（Slack Connect）チャンネルへの投稿。上記3チャンネル以外への投稿。

### ファイル書き込み手順（Codex）

1. `TASK_BOARD.md` で対象 TASK を CLAIM（同一 TASK_ID の二重 CLAIM 禁止）
2. `LOCKS/` に `<スラッグ化パス>.lock` を作成してファイルをロック
3. 自分の branch 内でのみ編集・小さな commit
4. 完了時に `*_STATUS.md` / `ACTIVITY_LOG.md` を更新、ロック解放
5. main 統合はゆうさんの承認必須（PR ワークフロー経由）

---

## 安全装置（AI TEAM BRIDGE）

- **AI同士の往復は 1 タスクあたり最大 4 回**（無限ループ防止）
- **同じ TASK_ID の重複処理は禁止**（`processed_ts` を状態ファイルで管理）
- 本番投稿・課金・削除・権限変更は**ゆうさん承認必須**
- Secret・個人情報を Slack へ投稿しない
- **意見が一致しなくても、AI が勝手に決定しない**（ゆうさんへエスカレーション）
- 最終決定は `DECISIONS.md` に記録する

---

## 出力形式のルール

| 項目 | ルール |
|------|--------|
| 言語 | 日本語優先（英語コンテンツは英語で出力） |
| フォーマット | Markdown |
| ファイル提案 | 既存ファイルの差分形式で示す（全文貼り付け不可） |
| タスク提案 | TASK.md フォーマットに合わせて出力 |
| 報告提案 | REPORT.md フォーマットに合わせて出力 |

---

## Claude Code との連携フロー

```
Codex: 企画・制作物・コード案・レビュー・リスク指摘を生成
    ↓
Claude Code: 内容を確認し、実装・ファイル操作・実行を行う
    ↓
（意見が割れたら）ゆうさん: #ai-team-approvals で判断
    ↓
ゆうさん: PR でレビュー・承認
    ↓
Claude Code: merge
```

Codex は企画・制作・レビューを担い、実装・運用の実行判断は Claude Code とゆうさんが行う。

---

## 禁止行為

- `.env.local` 参照の提案・実行
- Secret を含むコード生成、Secret の Slack/ログへの出力
- 自動投稿・自動DM を即時実行するコードの生成
- 既存 Skill / Knowledge の削除提案
- `git add .` を含む操作の提案

---

## このファイルの更新ルール

ゆうさんの承認を得た PR を通じてのみ変更可。
Codex・Claude Code による自律変更は禁止。
