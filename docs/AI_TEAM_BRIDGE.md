# AI TEAM BRIDGE — Claude Code ⇄ Codex Slack連携 仕様

2026-08-16 発効（ゆうさん承認済み）。Claude Code と Codex が Slack を介して
意見交換・作業受け渡し・相互レビューを行うための運用仕様。

関連: [`AGENTS.md`](../AGENTS.md) / [`~/.ai-team/ai-net-business-sns-os/DECISIONS.md`]

---

## 目的

- プロジェクト・作業・会社情報について 2つのAI が意見交換する
- **Claude Code** = 実装・運用 / **Codex** = 企画・制作・レビュー・リスクチェック
- 意見が割れたらゆうさんへ判断を依頼（AIは単独決定しない）
- サムネ等の成果物も Slack 経由で受け渡す

---

## チャンネル構成

| チャンネル | ID | 用途 |
|-----------|-----|------|
| `#ai-team-bridge` | `C0BQHSGHVLH` | 機械処理用（[INSTRUCTION]/[RESULT]） |
| `#ai-team-strategy` | `C0BRAD14TQQ` | 会社・事業・企画の議論（[DISCUSSION]/[REVIEW]/[RISK]） |
| `#ai-team-approvals` | `C0BQ9R74NF5` | ゆうさん承認待ち（[APPROVAL_REQUIRED]/[DECISION]） |

チャンネルIDは [`scripts/ai_team_bridge_config.json`](../scripts/ai_team_bridge_config.json) が単一情報源。

---

## メッセージ形式（先頭タグ必須）

各メッセージは必ず次のいずれかのタグで始める。TASK_ID を伴うものは `*TASK-ID*` 形式で明示。

| タグ | 意味 | TASK_ID | 主なチャンネル |
|------|------|:-------:|------|
| `[DISCUSSION]` | 意見交換・論点提起 | 任意 | strategy |
| `[INSTRUCTION]` | 作業指示 | **必須** | bridge |
| `[RESULT]` | 完了報告（成果物添付） | **必須** | bridge |
| `[REVIEW]` | 相互レビュー結果 | 任意 | strategy |
| `[RISK]` | リスク・コンプラ指摘 | 任意 | strategy |
| `[APPROVAL_REQUIRED]` | ゆうさん判断待ち | 任意 | approvals |
| `[DECISION]` | 決定事項（DECISIONS.mdにも記録） | 任意 | approvals |

例:
```
[INSTRUCTION] *REEL-002* — task
​```
サムネ案を3パターン。訴求軸は「簿記の勉強は後でいい」。
​```
✅ 完了したら [RESULT] REEL-002: から報告してください
```
```
[RESULT] REEL-002: ✅ 完了 サムネ案3種を添付します
```

---

## Bridge Runner（`scripts/ai_team_bridge_runner.js`）

| コマンド | 動作 |
|---------|------|
| `--list` | 未処理の [INSTRUCTION] を一覧（副作用なし） |
| `--poll` | [INSTRUCTION] を1件処理。往復+1、`processed_ts` 記録、上限到達なら承認へエスカレーション |
| `--collect [--task ID]` | Codexの [RESULT] を回収 |
| `--send-instruction --task ID --text "..." [--channel ..] [--file ..]` | 指示を送る |
| `--discuss --text "..." [--channel ..]` | 議論を投げる |
| `--review / --risk --text "..." [--task ID]` | レビュー/リスクを投稿 |
| `--approval --text "..." [--task ID] [--file ..]` | 承認待ちを上げる |
| `--result --task ID --text "..." [--file ..]` | 完了報告を送る |

実行例:
```bash
node --env-file=.env.local scripts/ai_team_bridge_runner.js --list
node --env-file=.env.local scripts/ai_team_bridge_runner.js --poll
```

---

## 安全装置

1. **AI往復は 1タスク最大 4回**（`maxRoundTripsPerTask`）。到達で `#ai-team-approvals` へ自動エスカレーション
2. **同じ TASK_ID の重複処理禁止**：処理済み message ts を `ai_team_bridge_state.json` に記録
3. **本番投稿・課金・削除・権限変更はゆうさん承認必須**（Bridgeでは実行しない）
4. **Secret・個人情報を Slack へ投稿しない**：Runner が投稿前に正規表現でガード（トークン/APIキー/秘密鍵/メール）
5. **意見が一致しなくても AI は勝手に決定しない**：`[APPROVAL_REQUIRED]` へ
6. **最終決定は `DECISIONS.md` に記録**

---

## Slack Bot 権限（手動設定が必要）

Bot Token（`.env.local` の `SLACK_BOT_TOKEN`）に以下 scope が必要:

- `channels:read`
- `channels:history`
- `chat:write`
- `files:write`

Bot を3チャンネルに招待すること（`/invite @bot` または チャンネル設定 → Integrations）。
**Secret は `.env.local` のみで管理し、Slack・ログ・会話・commit へは出さない。**

---

## 状態ファイル

`scripts/ai_team_bridge_state.json`（gitignore対象）:
```json
{
  "processedTs": { "<message_ts>": { "taskId": "REEL-002", "at": "...", "action": "handed_to_codex" } },
  "roundTrips": { "REEL-002": 2 },
  "lastPolledAt": "2026-08-16T..."
}
```
Secret は含めない。
