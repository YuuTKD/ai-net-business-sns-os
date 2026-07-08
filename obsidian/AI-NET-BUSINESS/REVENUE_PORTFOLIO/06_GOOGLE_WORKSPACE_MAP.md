# 06 GOOGLE WORKSPACE MAP — GWS連携マップ

← [[05_RISK_LOG]] | 次アクション → [[07_NEXT_ACTIONS]]

設計詳細: `docs/REVENUE_PORTFOLIO/google_workspace_management_plan.md`

**注意: Google Workspaceへの本番接続・書き込みはまだしていません。設計のみ。**

---

## Obsidian vs Google Workspace — 役割分担

| 種別 | Obsidian | Google Workspace |
|---|---|---|
| 設計・メモ | ✅ 主担当 | 参照のみ |
| KPI台帳 | CSV（ローカル） | Sheets（本番台帳） |
| 顧客情報 | ❌ 持たない | Sheets（セキュア管理） |
| 共有資料 | ❌ | Docs / Drive |
| カレンダー管理 | ❌ | Calendar |
| フォーム受付 | ❌ | Forms |

---

## Google Drive フォルダ構成案

```
AI-NET-BUSINESS/
  00_DASHBOARD/       → Revenue Portfolio Dashboard.xlsx
  01_B2B_AGENT/       → 診断記録.sheets / 商談メモ.docs
  02_MICRO_SAAS/      → ツール設計書.docs / テスト記録.sheets
  03_PROGRAMMATIC_SEO/ → キーワードマップ.sheets / 記事管理.sheets
  04_SNS_AFFILIATE/   → 投稿ログ.sheets / アフィリ管理.sheets
  05_KPI/             → Daily KPI Log.sheets / Weekly Report.sheets
  06_REPORTS/         → 週次レポート（月別フォルダ）
  07_ASSETS/          → 画像 / テンプレ / Brain素材
  08_COMPLIANCE/      → 利用規約チェック.docs / アフィリ表記確認.docs
```

---

## Google Sheets 台帳一覧（設計のみ）

| # | シート名 | 主用途 | 更新頻度 | 対応Obsidian |
|---|---|---|---|---|
| 1 | Revenue Portfolio Dashboard | 4モデル全体俯瞰 | 週次 | 00_DASHBOARD.md |
| 2 | Daily KPI Log | 毎日の数字記録 | 毎日 | model_kpi_matrix.csv |
| 3 | Content Production Log | 投稿・記事の制作記録 | 投稿時 | 各モデルCONTENT_PLAN.md |
| 4 | Offer Management Sheet | 商品・価格・状態管理 | 変更時 | 各モデルOFFER.md |
| 5 | Affiliate Product Sheet | アフィリ候補リスト | 検討時 | SNS_AFFILIATE/OFFER.md |
| 6 | SEO Keyword Map | キーワード戦略管理 | 週次 | PROGRAMMATIC_SEO/CONTENT_PLAN.md |
| 7 | Micro SaaS Idea Backlog | ツールアイデア管理 | 随時 | 03_IDEA_BANK.md |
| 8 | B2B Agent Sales Pipeline | 診断・商談・成約管理 | 商談時 | B2B_AGENT/SALES_FLOW.md |
| 9 | Weekly PDCA Report | 週次振り返り | 週次 | 01_WEEKLY_ACTION.md |

---

*← [[05_RISK_LOG]] | 次アクション → [[07_NEXT_ACTIONS]]*
