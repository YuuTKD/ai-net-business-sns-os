/**
 * Instagram カルーセル画像 自動生成スクリプト
 * AI画像生成（ChatGPT/Canva）で日本語テキストが乱れる問題を回避するため、
 * HTML+CSSで正確にテキストを組んでPuppeteer(既存のGoogle Chromeを使用)で
 * PNGスクリーンショットを撮る方式。テキストは一切AI生成せず、
 * instagram_carousel_data.json の内容をそのまま描画する。
 *
 * 使い方:
 *   node scripts/render_instagram_carousels.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DATA_FILE = path.join(__dirname, 'instagram_carousel_data.json');
const OUT_DIR = path.join(
  __dirname,
  '..',
  'products',
  'revenue-intelligence-os',
  'data',
  'instagram_drafts',
  'images'
);

const WIDTH = 1080;
const HEIGHT = 1350;

const STYLE_BY_TYPE = {
  title: {
    bg: 'linear-gradient(160deg, #FFF3E4 0%, #FFDDB8 100%)',
    fontSize: '64px',
    fontWeight: '800',
    color: '#3B2A1E',
    accent: '#E8823C',
  },
  body: {
    bg: 'linear-gradient(160deg, #FFFBF6 0%, #FFEFDC 100%)',
    fontSize: '46px',
    fontWeight: '700',
    color: '#3B2A1E',
    accent: '#E8823C',
  },
  cta: {
    bg: 'linear-gradient(160deg, #E8823C 0%, #D8672A 100%)',
    fontSize: '46px',
    fontWeight: '700',
    color: '#FFFFFF',
    accent: '#FFFFFF',
  },
};

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function textToHtml(text) {
  return escapeHtml(text)
    .split('\n')
    .map((line) => (line.trim() === '' ? '<div class="gap"></div>' : `<div>${line}</div>`))
    .join('\n');
}

function buildHtml({ type, text, pageNum, totalPages, postTitle }) {
  const s = STYLE_BY_TYPE[type] || STYLE_BY_TYPE.body;
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  @font-face {
    font-family: 'SysJP';
    src: local('Hiragino Sans'), local('Hiragino Kaku Gothic ProN'), local('Noto Sans JP');
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    font-family: 'SysJP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;
  }
  .card {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: ${s.bg};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 90px 80px;
    position: relative;
  }
  .accent-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 14px;
    background: ${s.accent};
  }
  .badge {
    position: absolute;
    top: 44px; right: 56px;
    font-size: 30px;
    font-weight: 700;
    color: ${s.color};
    opacity: 0.55;
    letter-spacing: 1px;
  }
  .content {
    font-size: ${s.fontSize};
    font-weight: ${s.fontWeight};
    color: ${s.color};
    line-height: 1.55;
    text-align: center;
    white-space: pre-wrap;
    word-break: keep-all;
    overflow-wrap: break-word;
  }
  .content .gap { height: 0.5em; }
  .brand {
    position: absolute;
    bottom: 44px;
    left: 0; right: 0;
    text-align: center;
    font-size: 26px;
    font-weight: 700;
    color: ${s.color};
    opacity: 0.5;
    letter-spacing: 2px;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="accent-bar"></div>
    <div class="badge">${pageNum} / ${totalPages}</div>
    <div class="content">${textToHtml(text)}</div>
    <div class="brand">ainetbiz.com</div>
  </div>
</body>
</html>`;
}

async function main() {
  if (!fs.existsSync(CHROME_PATH)) {
    console.error('Chromeが見つかりません:', CHROME_PATH);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 2 });

  let total = 0;
  for (const [postId, post] of Object.entries(data)) {
    const postDir = path.join(OUT_DIR, postId);
    fs.mkdirSync(postDir, { recursive: true });
    const totalPages = post.slides.length;
    for (let i = 0; i < post.slides.length; i++) {
      const slide = post.slides[i];
      const html = buildHtml({
        type: slide.type,
        text: slide.text,
        pageNum: i + 1,
        totalPages,
        postTitle: post.title,
      });
      await page.setContent(html, { waitUntil: 'load', timeout: 15000 });
      const outPath = path.join(postDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
      await page.screenshot({ path: outPath });
      console.log(`✅ ${postId} slide ${i + 1}/${totalPages} → ${outPath}`);
      total++;
    }
  }

  await browser.close();
  console.log(`\n🎉 完了。${total}枚のカルーセル画像を生成しました。`);
  console.log(`保存先: ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
