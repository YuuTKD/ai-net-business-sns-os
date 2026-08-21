# REEL-YO-001 | @yuu_okinawa1 YouTube Shorts 台本

## メタ情報
- チャンネル: @yuu_okinawa1
- タイトル案（JP）: 「AIで副業収入の仕組みを全自動化した話」
- タイトル案（EN）: "I built a passive income system with AI in 3 days"
- 尺: 55〜60秒
- 形式: YouTube Shorts（縦型 1080×1920）
- 言語: 日本語ナレーション ＋ 日本語字幕 ＋ 英語字幕（テロップ）
- アフィリ想定: Brain.fm / note有料記事 / Claude Pro（概要欄）

---

## カット構成

### Cut 1 — フック（0〜5秒）
**映像:** テキストアニメーション「3日間でこれを作った」+ スマホ画面チラ見せ
**ナレーション（JP）:** 「3日間で、AIだけで収益化の仕組みを全部作った。」
**テロップ（EN）:** "Built a passive income system in 3 days using only AI"
**BGM:** 軽快なローファイビート（フェードイン）

---

### Cut 2 — 問題提起（5〜12秒）
**映像:** 疲れたビジネスマンのB-roll（Pexels素材）
**ナレーション（JP）:** 「副業したいけど時間がない。そんな状態から始めた。」
**テロップ（EN）:** "Wanted side income but had zero time"

---

### Cut 3 — ソリューション提示（12〜22秒）
**映像:** PC画面録画（n8nワークフロー画面）＋ Kling生成映像（AIロボットが作業する映像）
**ナレーション（JP）:** 「Claude Codeでブログ記事を自動生成。n8nでWordPressに自動投稿。アフィリリンクは全部AIが挿入する。」
**テロップ（EN）:** "Claude Code → auto article → WordPress → affiliate links inserted by AI"

---

### Cut 4 — 結果（22〜35秒）
**映像:** スクリーンショット風グラフィック（「投稿数 0 → 30本 / 3日間」）
**ナレーション（JP）:** 「3日間で記事30本。自分は1文字も書いていない。」
**テロップ（EN）:** "30 articles in 3 days. I wrote 0 words."

---

### Cut 5 — 証拠（35〜45秒）
**映像:** WordPressダッシュボード画面録画（投稿一覧）
**ナレーション（JP）:** 「全部AIが書いて、全部自動で公開している。収益が出るまでの仕組みはもう動いてる。」
**テロップ（EN）:** "Fully automated. Revenue system is already running."

---

### Cut 6 — 免責 ＋ CTA（45〜55秒）
**映像:** テキストカード（白背景・黒テキスト）
**ナレーション（JP）:** 「収益は結果によって異なります。やり方を全部まとめたnoteを概要欄に貼っておきます。」
**テロップ（EN）:** "Results vary. Full guide linked below."
**免責テロップ（常時表示）:** 「※収益を保証するものではありません」

---

### Cut 7 — エンド（55〜60秒）
**映像:** チャンネルロゴアニメーション
**ナレーション（JP）:** 「チャンネル登録して、次の実験も見ててください。」
**テロップ（EN）:** "Subscribe for the next experiment →"

---

## 映像生成指示（Codex向け）

### 必要な生成物
1. **AI生成映像（Kling 3.0 推奨）**
   - Cut 3用: 「AIロボットがPCで黙々と作業している映像、サイバーパンク風、縦型」
   - プロンプト（EN）: "Futuristic AI robot working on multiple computer screens, cyberpunk aesthetic, vertical format 9:16, cinematic, blue and purple neon lighting, no text"
   - 尺: 10秒

2. **Pexels素材（無料）**
   - Cut 2用: "tired businessman, office, dark lighting" キーワードで検索
   - PEXELS_API_KEY は .env.local 参照

3. **テキストアニメーション**
   - Cut 1, 4, 7: FFmpegで生成可能

### ElevenLabs設定
- ELEVENLABS_VOICE_ID: `.env.local` の `ELEVENLABS_VOICE_ID` を使用（女性JP）
- モデル: `eleven_multilingual_v2`
- ナレーション原稿: 上記各カットのナレーション（JP）を連結

### 出力先
- 映像: `products/revenue-intelligence-os/data/instagram_drafts/reels/REEL-YO-001.mp4`
- カバー画像: `products/revenue-intelligence-os/data/instagram_drafts/images/REEL-YO-001/thumbnail.png`
- 音声ファイル: `products/revenue-intelligence-os/data/audio/REEL-YO-001_narration.mp3`

---

## 概要欄テンプレート（投稿時）

```
AIで副業収入の仕組みを3日で構築した実験ログです。

📌 全工程まとめたnote → [リンク]
📌 使ったツール一覧 → [リンク]

※この動画の内容は収益を保証するものではありません。
個人の結果は環境・取り組みにより異なります。

#AI副業 #自動化 #ClaudeCode #ネットビジネス #AItools
#AIpassiveincome #sidehustle #automation #makemoneyonline
```
