# HOOKS_DESIGN — Claude Code Hooks（§14）

安全な範囲で Hooks を設計する。**本書は設計のみ**。`settings.json` への実適用は競合確認済みでも**別途ゆう承認**（ハーネス挙動に影響するため）。

## 既存の状態（監査済み）
- `.claude/settings.local.json` は `permissions.allow` のみ。**hooks 未設定＝競合なし**。
- 適用先候補: `.claude/settings.json`（プロジェクト共有）。個人用途なら `settings.local.json`。

## PreToolUse（実行前に停止/確認する候補・§14）
危険操作を検知したら停止（deny）または確認する。

| 検知対象 | 例 | 動作 |
|---|---|---|
| git push | `git push` | 確認（feature可・main厳禁） |
| main への直接変更 | `git commit`/`push` on main | 停止 |
| rm による重要ファイル削除 | `rm -rf`, `operations/` `knowledge/` `core/` `.claude/` 配下 | 停止 |
| 本番デプロイ | `gcloud run deploy` 等 | 停止（pre-deploy-qa前提） |
| 本番Workflow Activate | n8n activate 相当 | 停止 |
| 公開/送信 | 投稿・DM・メール送信 | 停止（人間承認） |
| 課金/契約 | 決済・アップグレード | 停止 |
| Credential変更/Secret表示 | `.env.local` 参照, キー出力 | 停止 |
| 権限変更 | chmod/chown 重要パス | 確認 |

## PostToolUse（実行後に確認する候補・§14）
| 対象 | チェック |
|---|---|
| コード編集後 | 構文 / lint / typecheck / test |
| Secret混入 | 追加差分に APIキー/トークン様の文字列がないか |
| JSON/n8n | JSON構文 / n8n Workflow Schema / 重複ID |
| 変更範囲 | 変更ファイル一覧を提示・禁止パスに触れていないか |

## 実装方針（適用は承認後）
- まず **PreToolUse の git push / main / rm(重要パス) / .env.local 参照** の4つから最小導入（誤爆が少なく効果大）。
- Hook スクリプトは `scripts/hooks/` に配置し、終了コードで allow/deny を返す（Claude Code Hooks 仕様）。
- 既存 permissions.allow と矛盾しないこと（例: `Bash(bash *)` は広いので、push検知は別レイヤで）。

## 適用手順（承認後）
1. `scripts/hooks/pretooluse_guard.sh` 等を追加
2. `.claude/settings.json` に hooks 定義を追記（下記スニペット）
3. 空実行で誤爆がないか検証 → ゆう承認 → 有効化

### 適用スニペット（案・未適用）
```jsonc
// .claude/settings.json（例。実適用は承認後）
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/scripts/hooks/pretooluse_guard.sh" }] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/scripts/hooks/posttooluse_check.sh" }] }
    ]
  }
}
```

関連: [[SECURITY_POLICY]] [[RISK_APPROVAL_POLICY]] [[IMPLEMENTATION_PLAN]]
