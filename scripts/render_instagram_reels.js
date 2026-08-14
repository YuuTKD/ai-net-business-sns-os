/**
 * Instagram リール動画 自動生成スクリプト（v2: モーション対応）
 * カルーセル画像と同じ「AIに頼らない決定論的パイプライン」でリール動画を作る。
 *
 *   1. 各シーンのナレーションを macOS標準TTS「Kyoko」で音声化（say コマンド）
 *   2. 各シーンを複数の「カット（beats）」に分割し、それぞれHTML+CSSで
 *      正確にレンダリング（Puppeteer）→ AI画像/動画生成は日本語テキストの
 *      描画精度が不安定なため不採用。カットを分けることで1枚のカードが
 *      長時間止まったままにならず、テンポよく画面が切り替わる
 *   3. 各カットにKen Burnsズーム（ffmpeg zoompan）＋ソフトなフェードを付与
 *   4. 音声の長さに合わせてカットの表示時間を配分し、ffmpegで結合してMP4化
 *
 * 使い方:
 *   node scripts/render_instagram_reels.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const puppeteer = require('puppeteer-core');

const execFileAsync = promisify(execFile);

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DATA_FILE = path.join(__dirname, 'instagram_reel_data.json');
const OUT_DIR = path.join(
  __dirname,
  '..',
  'products',
  'revenue-intelligence-os',
  'data',
  'instagram_drafts',
  'reels'
);
const TMP_DIR = path.join(OUT_DIR, '.tmp');

const WIDTH = 1080;
const HEIGHT = 1920;
const TTS_VOICE = 'Kyoko';
const SCENE_GAP_SEC = 0.4; // シーン間（音声の切れ目）の無音ギャップ
const LAST_SCENE_EXTRA_SEC = 1.2; // 最終シーン（CTA）は少し長めに静止
const FADE_SEC = 0.12; // 各カットの入り/抜きフェード
const FPS = 25;

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
    .map((line) => `<div>${line}</div>`)
    .join('\n');
}

function buildBeatHtml({ text, sceneNum, totalScenes }) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;
  }
  .card {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: linear-gradient(160deg, #FFF3E4 0%, #FFDDB8 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 120px 90px;
    position: relative;
  }
  .accent-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 20px;
    background: #E8823C;
  }
  .badge {
    position: absolute;
    top: 60px; right: 70px;
    font-size: 36px;
    font-weight: 700;
    color: #3B2A1E;
    opacity: 0.5;
  }
  .content {
    font-size: 82px;
    font-weight: 800;
    color: #3B2A1E;
    line-height: 1.5;
    text-align: center;
    white-space: pre-wrap;
  }
  .brand {
    position: absolute;
    bottom: 70px;
    left: 0; right: 0;
    text-align: center;
    font-size: 34px;
    font-weight: 700;
    color: #3B2A1E;
    opacity: 0.5;
    letter-spacing: 2px;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="accent-bar"></div>
    <div class="badge">${sceneNum} / ${totalScenes}</div>
    <div class="content">${textToHtml(text)}</div>
    <div class="brand">ainetbiz.com</div>
  </div>
</body>
</html>`;
}

async function generateSceneAudio(narration, outAiff) {
  await execFileAsync('say', ['-v', TTS_VOICE, '-o', outAiff, narration]);
  const outWav = outAiff.replace(/\.aiff$/, '.wav');
  await execFileAsync('ffmpeg', ['-y', '-i', outAiff, '-ar', '44100', '-ac', '2', outWav]);
  return outWav;
}

async function getAudioDuration(wavPath) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    wavPath,
  ]);
  return parseFloat(stdout.trim());
}

// 静止画1枚から、Ken Burnsズーム＋入り/抜きフェード付きの動画セグメントを作る
async function buildBeatVideoSegment({ imagePath, durationSec, outPath, zoomDirection }) {
  const frames = Math.max(2, Math.round(durationSec * FPS));
  // zoomDirectionでズームイン/ズームアウトを交互にし、単調な繰り返しを避ける
  const zoomExpr =
    zoomDirection === 'in'
      ? `min(zoom+0.0009,1.12)`
      : `if(eq(on,0),1.12,max(zoom-0.0009,1.0))`;
  const fadeOutStart = Math.max(0, durationSec - FADE_SEC);
  const vf =
    `zoompan=z='${zoomExpr}':d=${frames}:s=${WIDTH}x${HEIGHT}:fps=${FPS},` +
    `fade=t=in:st=0:d=${FADE_SEC}:alpha=0,` +
    `fade=t=out:st=${fadeOutStart}:d=${FADE_SEC}:alpha=0`;
  await execFileAsync('ffmpeg', [
    '-y',
    '-loop', '1',
    '-i', imagePath,
    '-vf', vf,
    '-t', String(durationSec),
    '-pix_fmt', 'yuv420p',
    '-r', String(FPS),
    outPath,
  ]);
}

async function concatVideoSegments(segmentPaths, outPath) {
  const listPath = outPath.replace(/\.mp4$/, '_list.txt');
  const listContent = segmentPaths.map((p) => `file '${p}'`).join('\n');
  fs.writeFileSync(listPath, listContent);
  await execFileAsync('ffmpeg', [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listPath,
    '-c', 'copy',
    outPath,
  ]);
}

async function concatAudioWithGaps(audioPaths, gapSec, outPath) {
  const silencePath = path.join(TMP_DIR, `silence_${gapSec}.wav`);
  if (!fs.existsSync(silencePath)) {
    await execFileAsync('ffmpeg', [
      '-y',
      '-f', 'lavfi',
      '-i', `anullsrc=r=44100:cl=stereo`,
      '-t', String(gapSec),
      silencePath,
    ]);
  }
  const listPath = outPath.replace(/\.wav$/, '_list.txt');
  const parts = [];
  audioPaths.forEach((p, i) => {
    parts.push(`file '${p}'`);
    if (i < audioPaths.length - 1) parts.push(`file '${silencePath}'`);
  });
  fs.writeFileSync(listPath, parts.join('\n'));
  await execFileAsync('ffmpeg', [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listPath,
    outPath,
  ]);
}

async function muxVideoAudio({ videoPath, audioPath, outPath }) {
  await execFileAsync('ffmpeg', [
    '-y',
    '-i', videoPath,
    '-i', audioPath,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-shortest',
    outPath,
  ]);
}

async function renderReel(page, reelId, reel) {
  console.log(`\n=== ${reelId}: ${reel.title} ===`);
  const reelTmpDir = path.join(TMP_DIR, reelId);
  fs.mkdirSync(reelTmpDir, { recursive: true });

  const audioPaths = [];
  const allSegmentPaths = [];
  let zoomToggle = 0;

  for (let i = 0; i < reel.scenes.length; i++) {
    const scene = reel.scenes[i];
    const sceneNum = i + 1;
    const isLastScene = sceneNum === reel.scenes.length;

    // 1. シーン全体のナレーション音声を1本生成
    const aiffPath = path.join(reelTmpDir, `scene-${sceneNum}.aiff`);
    console.log(`  シーン${sceneNum}: 音声生成中...`);
    const wavPath = await generateSceneAudio(scene.narration, aiffPath);
    const sceneDuration = await getAudioDuration(wavPath);
    audioPaths.push(wavPath);

    // 2. シーンの時間を、含まれるカット数で配分（文字数比で配分し自然なテンポに）
    const beats = scene.beats;
    const totalChars = beats.reduce((sum, b) => sum + b.length, 0);
    const sceneTotalDuration = sceneDuration + SCENE_GAP_SEC + (isLastScene ? LAST_SCENE_EXTRA_SEC : 0);

    console.log(`  シーン${sceneNum}: ${beats.length}カットに分割してレンダリング中...`);
    for (let b = 0; b < beats.length; b++) {
      const beatText = beats[b];
      const share = totalChars > 0 ? beatText.length / totalChars : 1 / beats.length;
      const beatDuration = Math.max(0.9, sceneTotalDuration * share);

      const html = buildBeatHtml({ text: beatText, sceneNum, totalScenes: reel.scenes.length });
      await page.setContent(html, { waitUntil: 'load', timeout: 15000 });
      const imgPath = path.join(reelTmpDir, `scene-${sceneNum}-beat-${b + 1}.png`);
      await page.screenshot({ path: imgPath });

      const segPath = path.join(reelTmpDir, `scene-${sceneNum}-beat-${b + 1}.mp4`);
      zoomToggle = 1 - zoomToggle;
      await buildBeatVideoSegment({
        imagePath: imgPath,
        durationSec: beatDuration,
        outPath: segPath,
        zoomDirection: zoomToggle === 0 ? 'in' : 'out',
      });
      allSegmentPaths.push(segPath);
    }
  }

  // 3. 全カットを結合
  console.log('  動画カットを結合中...');
  const silentVideoPath = path.join(reelTmpDir, 'silent.mp4');
  await concatVideoSegments(allSegmentPaths, silentVideoPath);

  // 4. 音声結合（シーン間ギャップ入り）
  console.log('  音声を結合中...');
  const fullAudioPath = path.join(reelTmpDir, 'audio.wav');
  await concatAudioWithGaps(audioPaths, SCENE_GAP_SEC, fullAudioPath);

  // 5. 音声・動画をmux
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${reelId}.mp4`);
  console.log('  音声と動画を合成中...');
  await muxVideoAudio({ videoPath: silentVideoPath, audioPath: fullAudioPath, outPath });

  console.log(`✅ ${reelId} → ${outPath}`);
  return outPath;
}

async function main() {
  if (!fs.existsSync(CHROME_PATH)) {
    console.error('Chromeが見つかりません:', CHROME_PATH);
    process.exit(1);
  }
  const onlyId = process.argv[2];
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  fs.mkdirSync(TMP_DIR, { recursive: true });

  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  const results = [];
  for (const [reelId, reel] of Object.entries(data)) {
    if (onlyId && reelId !== onlyId) continue;
    const outPath = await renderReel(page, reelId, reel);
    results.push(outPath);
  }

  await browser.close();
  console.log(`\n🎉 完了。${results.length}本のリール動画を生成しました。`);
  console.log(`保存先: ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
