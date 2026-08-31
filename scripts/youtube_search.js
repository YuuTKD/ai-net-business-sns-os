#!/usr/bin/env node
/**
 * YouTube Data API v3 — ジャンル別動画検索スクリプト
 *
 * 使い方:
 *   node --env-file=.env.local scripts/youtube_search.js
 *   node --env-file=.env.local scripts/youtube_search.js --genre "AI automation" --limit 5
 *
 * 環境変数:
 *   YOUTUBE_DATA_API_KEY or GOOGLE_PLACES_API_KEY (YouTube Data API v3が有効なキー)
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

// 前回リサーチしたジャンル一覧（優先度順）
const RESEARCH_GENRES = [
  { key: "ai_tools_trial",    query: "AIツール 試してみた 2024 2025",      lang: "ja", region: "JP" },
  { key: "ai_automation_en",  query: "AI automation passive income 2025",  lang: "en", region: "US" },
  { key: "satisfying_ai",     query: "satisfying AI generated video 2025", lang: "en", region: "US" },
  { key: "ai_anime_shorts",   query: "AI anime shorts viral 2025",         lang: "en", region: "US" },
  { key: "kids_animation_en", query: "kids learning animation english",    lang: "en", region: "US" },
  { key: "ai_compare",        query: "ChatGPT vs Claude comparison 2025",  lang: "en", region: "US" },
];

const API_KEY = process.env.YOUTUBE_DATA_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
const LIMIT   = parseInt(process.argv[process.argv.indexOf("--limit") + 1] || "5", 10);
const GENRE_ARG = process.argv[process.argv.indexOf("--genre") + 1];

function fetchYouTubeSearch(query, lang, region, maxResults) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: String(maxResults),
      relevanceLanguage: lang,
      regionCode: region,
      order: "viewCount",
      key: API_KEY,
    });
    const url = `https://www.googleapis.com/youtube/v3/search?${params}`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

function fetchVideoStats(videoIds) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      part: "statistics,contentDetails,snippet",
      id: videoIds.join(","),
      key: API_KEY,
    });
    const url = `https://www.googleapis.com/youtube/v3/videos?${params}`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

function formatDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "不明";
  const h = parseInt(m[1] || 0), min = parseInt(m[2] || 0), s = parseInt(m[3] || 0);
  return h ? `${h}:${String(min).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${min}:${String(s).padStart(2,"0")}`;
}

async function main() {
  if (!API_KEY) {
    console.error("❌ YOUTUBE_DATA_API_KEY または GOOGLE_PLACES_API_KEY が未設定です。");
    console.error("   Google Cloud Console で YouTube Data API v3 を有効化し、APIキーを .env.local に追加してください。");
    console.error("   変数名: YOUTUBE_DATA_API_KEY=AIza...");
    process.exit(1);
  }

  const genres = GENRE_ARG
    ? [{ key: "custom", query: GENRE_ARG, lang: "ja", region: "JP" }]
    : RESEARCH_GENRES;

  const outDir = path.join(__dirname, "../reports/youtube_research");
  fs.mkdirSync(outDir, { recursive: true });

  const today = new Date().toISOString().slice(0, 10);
  const reportPath = path.join(outDir, `search_${today}.md`);
  const urlListPath = path.join(outDir, `urls_${today}.json`);

  let report = `# YouTube リサーチ検索結果\n\n生成日: ${today}\n\n`;
  const allUrls = [];

  for (const genre of genres) {
    console.log(`\n🔍 検索中: [${genre.key}] "${genre.query}"`);
    try {
      const searchResult = await fetchYouTubeSearch(genre.query, genre.lang, genre.region, LIMIT);

      if (searchResult.error) {
        console.error(`  ❌ APIエラー: ${searchResult.error.message}`);
        report += `## ${genre.key}\n\n❌ APIエラー: ${searchResult.error.message}\n\n`;
        continue;
      }

      const items = searchResult.items || [];
      const videoIds = items.map(i => i.id.videoId).filter(Boolean);

      if (!videoIds.length) {
        console.log(`  ⚠️  結果なし`);
        continue;
      }

      const statsResult = await fetchVideoStats(videoIds);
      const statsMap = {};
      for (const v of (statsResult.items || [])) {
        statsMap[v.id] = { stats: v.statistics, details: v.contentDetails, snippet: v.snippet };
      }

      report += `## ${genre.key}\n\n**クエリ:** \`${genre.query}\`\n\n`;
      report += `| # | タイトル | チャンネル | 再生数 | 尺 | URL |\n`;
      report += `|---|---------|-----------|--------|-----|-----|\n`;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const vid = item.id.videoId;
        const title = item.snippet.title.replace(/\|/g, "｜");
        const channel = item.snippet.channelTitle;
        const url = `https://www.youtube.com/watch?v=${vid}`;
        const s = statsMap[vid];
        const views = s?.stats?.viewCount ? Number(s.stats.viewCount).toLocaleString() : "N/A";
        const dur = s?.details?.duration ? formatDuration(s.details.duration) : "N/A";

        report += `| ${i+1} | ${title} | ${channel} | ${views} | ${dur} | [リンク](${url}) |\n`;
        allUrls.push({ genre: genre.key, rank: i+1, title, channel, views, duration: dur, url });
        console.log(`  [${i+1}] ${views}回 | ${dur} | ${title.slice(0, 40)}`);
      }
      report += `\n`;

      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`  ❌ エラー: ${err.message}`);
      report += `## ${genre.key}\n\n❌ エラー: ${err.message}\n\n`;
    }
  }

  fs.writeFileSync(reportPath, report, "utf-8");
  fs.writeFileSync(urlListPath, JSON.stringify(allUrls, null, 2), "utf-8");

  console.log(`\n✅ 検索完了`);
  console.log(`   レポート: ${reportPath}`);
  console.log(`   URLリスト: ${urlListPath}`);
  console.log(`\n次のステップ: /analyze-youtube を使って各動画を分析`);
  console.log(`  例: /analyze-youtube ${allUrls[0]?.url || "<URL>"}`);
}

main().catch(e => { console.error(e); process.exit(1); });
