# Google Workspace 管理設計書

対象プロジェクト: ai-net-business-sns-os
作成日: 2026-07-09
状態: 設計のみ（本番接続・書き込み未実施）

---

## 1. Google Drive フォルダ構成案

```
AI-NET-BUSINESS/
  ├── 00_DASHBOARD/
  │     └── Revenue Portfolio Dashboard.xlsx
  ├── 01_B2B_AGENT/
  │     ├── 診断申込みフォーム（Google Forms）
  │     ├── 診断レポートテンプレ.docs
  │     └── B2B Agent Sales Pipeline.sheets
  ├── 02_MICRO_SAAS/
  │     ├── 投稿文ジェネレーターv1.sheets
  │     └── Micro SaaS Idea Backlog.sheets
  ├── 03_PROGRAMMATIC_SEO/
  │     ├── SEO Keyword Map.sheets
  │     └── 記事制作ログ.sheets
  ├── 04_SNS_AFFILIATE/
  │     ├── SNS投稿ログ.sheets
  │     └── アフィリエイト商品管理.sheets
  ├── 05_KPI/
  │     ├── Daily KPI Log.sheets
  │     └── Weekly PDCA Report.sheets
  ├── 06_REPORTS/
  │     ├── 2026-07/（月別フォルダ）
  │     └── 2026-08/
  ├── 07_ASSETS/
  │     ├── SNS画像素材/
  │     ├── Brainコンテンツ素材/
  │     └── テンプレート/
  └── 08_COMPLIANCE/
        ├── 利用規約チェックリスト.docs
        └── アフィリエイト表記確認.docs
```

---

## 2. Google Sheets 台帳構成案

### (1) Revenue Portfolio Dashboard

| 列 | 内容 | 更新頻度 |
|---|---|---|
| model_id | モデル識別子 | 固定 |
| model_name | モデル名 | 固定 |
| status | ステータス | 週次 |
| main_kpi | 主要KPI今週値 | 週次 |
| revenue_mtd | 月間累計売上 | 週次 |
| next_action | 今週の最重要アクション | 週次 |
| go_nogo | GO/条件付きGO/STOP | 週次 |

### (2) Daily KPI Log

| 列 | 内容 |
|---|---|
| date | 日付 |
| model_id | モデル |
| traffic | アクセス数 |
| leads | 問い合わせ数 |
| clicks | Brain/CTAクリック |
| sales | 購入数 |
| revenue | 売上金額 |
| memo | メモ |

### (3) Content Production Log

| 列 | 内容 |
|---|---|
| date | 制作日 |
| model_id | モデル |
| content_type | 投稿/記事/ツール |
| title_or_theme | タイトル・テーマ |
| platform | X/Threads/Blog等 |
| url | 公開URL |
| status | draft/published |
| performance | いいね/PV等 |

### (4) Offer Management Sheet

| 列 | 内容 |
|---|---|
| model_id | モデル |
| offer_name | 商品名 |
| price | 価格 |
| status | 公開中/設計中/停止 |
| url | 購入URL |
| revenue_type | 自社/アフィリ |
| compliance_ok | コンプライアンス確認 |

### (5) Affiliate Product Candidate Sheet

| 列 | 内容 |
|---|---|
| product_name | 商品名 |
| category | ジャンル |
| asp | ASP名 |
| commission | 報酬率/単価 |
| status | 申請前/申請中/掲載中 |
| compliance_ok | 表記確認済み |
| memo | メモ |

### (6) SEO Keyword Map

| 列 | 内容 |
|---|---|
| keyword | キーワード |
| search_intent | 検索意図 |
| difficulty | 難易度（低/中/高） |
| priority | 優先度 |
| article_status | 未着手/執筆中/公開済 |
| url | 記事URL |
| monthly_traffic | 月間流入（実測） |

### (7) Micro SaaS Idea Backlog

| 列 | 内容 |
|---|---|
| idea | アイデア |
| target | ターゲット |
| tool | 使うツール |
| complexity | 複雑さ（低/中/高） |
| priority | 優先度 |
| status | 保留/検討/着手中/完了 |

### (8) B2B Agent Sales Pipeline

| 列 | 内容 |
|---|---|
| lead_date | 申込み日 |
| business_type | 業種 |
| diagnosis_date | 診断実施日 |
| main_issue | ボトルネック |
| next_step | Brain/導入支援/保留 |
| amount | 売上金額 |
| status | 申込み/診断済/成約/失注 |

### (9) Weekly PDCA Report

| 列 | 内容 |
|---|---|
| week | 週（2026-W28等） |
| model_id | モデル |
| goal | 週間ゴール |
| result | 実績 |
| achievement_rate | 達成率 |
| learning | 学び |
| next_week_action | 来週のアクション |

---

## 3. Google Docs 管理ドキュメント構成案

| ドキュメント | 用途 | 更新頻度 |
|---|---|---|
| 診断レポートテンプレ | B2B診断後に送付 | 診断時 |
| コンプライアンスチェックリスト | 月次確認 | 月次 |
| アフィリエイト表記ガイド | 投稿時参照 | 変更時 |
| 利用規約変更ログ | 規約変更の記録 | 月次 |
| 商品説明書（Brain） | Brain商品のサポート文書 | 変更時 |

---

## 4. Google Calendar で管理する定例タスク

| タスク | 頻度 | 担当 |
|---|---|---|
| SNS数値記録（KPI入力） | 毎日 夜 | CEO |
| 週次振り返り（PDCA） | 毎週日曜 | CEO |
| 利用規約確認 | 月1回 | CEO |
| Brain商品確認（価格・内容） | 月1回 | CEO |
| アフィリエイト報酬確認 | 月1回 | CEO |
| Revenue Portfolio 月次レビュー | 月1回 | CEO |

---

## 5. Google Forms で使える入力フォーム案

| フォーム | 用途 | 状態 |
|---|---|---|
| B2B診断申込みフォーム | 診断受付 | 未作成 |
| ユーザーフィードバックフォーム | ツール利用者の感想収集 | 未作成 |
| 週次セルフチェックフォーム | 自分の週次入力を簡略化 | 未作成 |

---

## 6. Obsidian と Google Workspace の役割分担

| 種別 | Obsidian | Google Workspace |
|---|---|---|
| 設計・戦略メモ | ✅ 主 | 参照のみ |
| KPI台帳（本番） | ローカルCSV（代替） | ✅ 主（移行後） |
| 顧客情報管理 | ❌ 持たない | ✅ Sheets（セキュア） |
| 共有資料・テンプレ | ❌ | ✅ Docs / Drive |
| カレンダー管理 | ❌ | ✅ Calendar |
| フォーム受付 | ❌ | ✅ Forms |
| 意思決定記録 | ✅ DECISION_LOG | 参照のみ |
| リスク管理 | ✅ RISK_LOG | 参照のみ |

---

## 7. Claude Code で扱う範囲

- Obsidianファイルの作成・更新
- ローカルCSV台帳の作成・更新
- スクリプト設計（DRY_RUN前提）
- コンプライアンスチェック（テキスト確認）
- データ設計・フォーマット定義

---

## 8. 人間が確認する範囲

- SNS投稿の最終確認・手動投稿
- Google Forms の回答確認・日程調整
- 診断の実施（Google Meet）
- Brain商品購入者へのフォロー（手動）
- アフィリエイト審査申請・承認確認
- Google Workspace ファイルの本番作成
- KPIの目視確認・判断

---

## 9. 自動化してよい範囲

- Google Forms 受付 → 自動確認メール（Forms設定内）
- Brain購入決済（Brain側）
- アフィリエイト報酬計上（ASP側）
- Google Sheets 集計式・グラフ更新
- Google Search Console データ収集（閲覧のみ）

---

## 10. 自動化してはいけない範囲

| 禁止 | 理由 |
|---|---|
| SNS自動投稿 | プラットフォーム規約・スパム判定 |
| 自動DM / 自動リプ | 規約違反・信頼損失 |
| 自動メール送信（一括） | 迷惑メール法 |
| Google Workspace への自動書き込み（API） | APPROVED_FOR_LIVE=false |
| 決済処理の自動実行 | セキュリティリスク |
| 顧客データの自動収集・分析 | 個人情報保護 |
| APIキー / Token の自動ログ記録 | セキュリティ |
| Scheduler ON | scheduler_on=false 維持 |
