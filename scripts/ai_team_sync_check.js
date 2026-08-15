/**
 * 常時共有AIチーム 定期同期チェック
 * ~/.ai-team/ai-net-business-sns-os/ の CODEX_STATUS.md・MESSAGES.md が
 * 前回チェック時から変化していないかを確認し、変化があればSlackに通知する。
 *
 * 目的: Claude Codeがセッションを開いていない間にCodexが更新しても、
 * ゆうさんが気づけるようにするための軽量ポーリング（3時間おきにcron実行）。
 * 変化がなければ何もしない（無駄な通知を出さない）。
 *
 * 使い方:
 *   node --env-file=.env.local scripts/ai_team_sync_check.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TEAM_DIR = path.join(process.env.HOME, '.ai-team', 'ai-net-business-sns-os');
const CODEX_STATUS_FILE = path.join(TEAM_DIR, 'CODEX_STATUS.md');
const MESSAGES_FILE = path.join(TEAM_DIR, 'MESSAGES.md');
const STATE_FILE = path.join(__dirname, 'ai_team_sync_state.json');

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { codexStatusHash: null, messagesHash: null, lastCheckedAt: null };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

function hashOf(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

function tail(filePath, lines) {
  if (!fs.existsSync(filePath)) return '';
  const content = fs.readFileSync(filePath, 'utf8');
  return content.trim().split('\n').slice(-lines).join('\n');
}

async function sendSlackNotify(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('⚠️  SLACK_WEBHOOK_URL未設定のため通知をスキップしました');
    return false;
  }
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
    return res.ok;
  } catch (e) {
    console.warn(`⚠️  Slack通知送信でエラー: ${e.message}`);
    return false;
  }
}

async function main() {
  const state = loadState();
  const codexStatusHash = hashOf(CODEX_STATUS_FILE);
  const messagesHash = hashOf(MESSAGES_FILE);

  const codexStatusChanged = state.codexStatusHash !== null && codexStatusHash !== state.codexStatusHash;
  const messagesChanged = state.messagesHash !== null && messagesHash !== state.messagesHash;

  if (codexStatusChanged || messagesChanged) {
    const parts = ['🔔 常時共有AIチーム: Codex側に更新がありました'];
    if (codexStatusChanged) {
      parts.push(`\n【CODEX_STATUS.md 最新】\n${tail(CODEX_STATUS_FILE, 10)}`);
    }
    if (messagesChanged) {
      parts.push(`\n【MESSAGES.md 直近】\n${tail(MESSAGES_FILE, 5)}`);
    }
    await sendSlackNotify(parts.join('\n'));
    console.log('✅ 変更を検知し、Slackに通知しました。');
  } else {
    console.log('ℹ️  変更なし。通知は送信しません。');
  }

  saveState({
    codexStatusHash,
    messagesHash,
    lastCheckedAt: new Date().toISOString(),
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
