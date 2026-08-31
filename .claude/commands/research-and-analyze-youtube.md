# /research-and-analyze-youtube

前回リサーチしたジャンルをYouTube Data APIで自動検索し、上位動画をChrome MCPで順番に分析してレポートを保存するSkill。

## 使い方

```
/research-and-analyze-youtube            # 全ジャンル（6ジャンル×5本）を自動分析
/research-and-analyze-youtube --limit 3  # ジャンルあたり3本に絞る
/research-and-analyze-youtube --genre "AI副業 自動化"  # カスタムジャンルで検索
```

---

## 実行フロー

### Step 1: YouTube Data APIで動画を検索

```bash
node --env-file=.env.local scripts/youtube_search.js
```

成功すると以下のファイルが生成される：
- `reports/youtube_research/search_YYYY-MM-DD.md` — 検索結果一覧
- `reports/youtube_research/urls_YYYY-MM-DD.json` — URLリスト（JSON）

**APIキーエラーが出た場合：**
`YOUTUBE_DATA_API_KEY` が未設定。ゆうさんに以下を依頼：
> Google Cloud Console → APIとサービス → 認証情報 → YouTubeが有効なAPIキーを `.env.local` に `YOUTUBE_DATA_API_KEY=AIza...` で追加してください。

---

### Step 2: URLリストを読み込む

`reports/youtube_research/urls_YYYY-MM-DD.json` を Read で読み込み、分析対象URLの一覧を取得。

---

### Step 3: Chrome MCPで各動画を順番に分析

まずブラウザツールをロード：
```
ToolSearch: select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__javascript_tool
```

各URLに対して：

1. `tabs_create_mcp` で新タブ → `navigate` でYouTube動画ページへ遷移
2. ページが完全に読み込まれるまで3秒待機
3. `read_page` でページテキスト取得（タイトル・チャンネル名・再生数・概要欄・ハッシュタグ）
4. `javascript_tool` で動画を5秒地点に移動して一時停止：
   ```javascript
   const v = document.querySelector('video');
   if (v) { v.currentTime = 5; v.pause(); }
   ```
5. `computer` でスクリーンショット（フック画面）
6. `javascript_tool` で動画を中間地点に移動：
   ```javascript
   const v = document.querySelector('video');
   if (v) { v.currentTime = v.duration / 2; v.pause(); }
   ```
7. `computer` でスクリーンショット（本編画面）
8. 分析レポートを生成（/analyze-youtube のフォーマット準拠）
9. 動画間は2秒待機（YouTube負荷配慮）

---

### Step 4: 全動画の比較表を生成

全分析が完了したら以下の比較表を出力：

```markdown
## ジャンル比較サマリー

| ジャンル | 代表動画 | 再生数 | 尺 | フック手法 | 収益化 | @yuu_okinawa1への応用度 |
|---------|---------|--------|-----|-----------|--------|----------------------|
| ai_tools_trial | ... | | | | | ★★★★★ |
| satisfying_ai | ... | | | | | ★★★☆☆ |
```

---

### Step 5: レポートを保存

保存先: `reports/youtube_research/analysis_YYYY-MM-DD.md`

フォーマット:
```markdown
# YouTube動画分析レポート
生成日: YYYY-MM-DD

## エグゼクティブサマリー
[全体の傾向、最も参考になるジャンルとその理由を3行で]

## ジャンル比較表
[Step 4の比較表]

## 動画別詳細分析
[各動画の /analyze-youtube フォーマットレポートを連結]

## @yuu_okinawa1チャンネルへの提言
[分析結果をもとに、テーマ・フック手法・収益化設計の推奨を箇条書きで]
```

---

## 対象ジャンル（前回リサーチ結果）

| key | 検索クエリ | 理由 |
|-----|-----------|------|
| ai_tools_trial | AIツール 試してみた 2024 2025 | アフィリ×AI生成×知識不要の交差点 |
| ai_automation_en | AI automation passive income 2025 | 海外需要・英語展開想定 |
| satisfying_ai | satisfying AI generated video 2025 | 純AI生成映像のバズ動画 |
| ai_anime_shorts | AI anime shorts viral 2025 | TOP5ジャンル・AI生成可 |
| kids_animation_en | kids learning animation english | Cocomelon系・AdSense安定 |
| ai_compare | ChatGPT vs Claude comparison 2025 | 比較系・購買意図高 |

---

## エラー対処

| エラー | 対処 |
|--------|------|
| YOUTUBE_DATA_API_KEY未設定 | ゆうさんにGCP Console → YouTube Data API v3有効化を依頼 |
| 動画が再生されない（地域制限） | 次の動画にスキップ |
| Chrome MCPタイムアウト | 該当URLをスキップしてレポートに「分析スキップ」と記録 |
| YouTubeの広告ポップアップ | javascript_toolで `document.querySelector('.ytp-ad-skip-button')?.click()` |
