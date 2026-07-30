# Agents — Revenue Intelligence OS

## 既存10体（Phase1）
revenue-researcher / audience-jtbd-analyst / offer-economics-analyst / experiment-designer /
master-content-producer / multi-platform-repurposer / compliance-qa-reviewer /
browser-publishing-operator / attribution-analyst / growth-decision-director

## Phase2 追加5体（§13）
| Agent | 区分 | 既存との関係 |
|---|---|---|
| portfolio-manager | 🆕新規 | 事業ポートフォリオ層（growth-decision-director は実験層で別階層） |
| workflow-architect | 🆕新規 | n8n設計。該当既存なし |
| browser-operator | 拡張 | n8n UI操作が新規。note/SNSは browser-publishing-operator を流用 |
| quality-reviewer | 流用 | compliance-qa-reviewer ＋ sns-post-quality-check の役割マップ |
| revenue-analyst | 合成 | attribution-analyst ＋ growth-decision-director ＋ 費用集計(新規) |

## 配置方針
既存10体と同じ `agents/` に配置（プロジェクト内で一元管理）。
`.claude/agents/`（リポジトリ直下）へ登録する場合は、既存Hooks・命名との競合確認後に別PRで対応（`design/IMPLEMENTATION_PLAN.md`）。

## 共通原則
公開/送信/購入/削除/権限変更/push は人間承認必須。各Agentは入力→出力→禁止→停止条件を持つ。
