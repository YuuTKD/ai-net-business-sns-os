// n8n ワークフロー JSON の「インポート前」構造検証（n8n不要・オフライン）。
// 目的: n8n UI で Import したときに落ちる/壊れる種類の不具合を、実機を開く前に検出する。
// 実行: node products/revenue-intelligence-os/tests/validate_workflows_structure.mjs
// 検査対象: products/revenue-intelligence-os/workflows/n8n/*.json すべて
//
// 検査項目:
//  [E] JSON構文が壊れている
//  [E] node の id / name が重複、または必須フィールド欠落
//  [E] connections が存在しないノードを参照している（インポート後に線が切れる主因）
//  [E] Code ノードの jsCode に JavaScript 構文エラーがある
//  [E] トリガーノードが1つも無い
//  [W] トリガーから到達不能な孤立ノード（配線忘れの疑い）
//  [W] Anthropic を叩く HTTP ノードにクレデンシャル参照が無い
//  [W] IF ノードの出力分岐が1本しか配線されていない（分岐の配線忘れの疑い）

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WF_DIR = join(__dirname, '..', 'workflows', 'n8n');

const TRIGGER_TYPES = new Set([
  'n8n-nodes-base.manualTrigger',
  'n8n-nodes-base.scheduleTrigger',
  'n8n-nodes-base.cron',
  'n8n-nodes-base.webhook',
  'n8n-nodes-base.executeWorkflowTrigger',
]);

let errors = 0, warnings = 0;
const errsFor = (f) => `\x1b[31m[E]\x1b[0m ${f}:`;
const warnFor = (f) => `\x1b[33m[W]\x1b[0m ${f}:`;

function validate(file, raw) {
  let wf;
  try {
    wf = JSON.parse(raw);
  } catch (e) {
    console.log(`${errsFor(file)} JSON構文エラー: ${e.message}`); errors++; return;
  }
  const nodes = Array.isArray(wf.nodes) ? wf.nodes : [];
  if (!nodes.length) { console.log(`${errsFor(file)} nodes が空`); errors++; return; }

  // --- ノードの id/name 重複・必須欠落 ---
  const nameSet = new Set(), idSet = new Set();
  for (const n of nodes) {
    if (!n.name) { console.log(`${errsFor(file)} name 欠落のノード (id=${n.id})`); errors++; }
    if (!n.type) { console.log(`${errsFor(file)} type 欠落のノード (name=${n.name})`); errors++; }
    if (n.name && nameSet.has(n.name)) { console.log(`${errsFor(file)} name 重複: "${n.name}"`); errors++; }
    if (n.id && idSet.has(n.id)) { console.log(`${errsFor(file)} id 重複: "${n.id}"`); errors++; }
    nameSet.add(n.name); idSet.add(n.id);
  }

  // --- connections が実在ノードを指すか ---
  const conns = wf.connections || {};
  for (const [src, outs] of Object.entries(conns)) {
    if (!nameSet.has(src)) { console.log(`${errsFor(file)} connections の起点が不明: "${src}"`); errors++; }
    const branches = (outs.main || []);
    for (const branch of branches) {
      for (const link of (branch || [])) {
        if (!nameSet.has(link.node)) { console.log(`${errsFor(file)} "${src}" → 不明なノード "${link.node}"`); errors++; }
      }
    }
  }

  // --- トリガー存在 ---
  const triggers = nodes.filter(n => TRIGGER_TYPES.has(n.type));
  if (!triggers.length) { console.log(`${errsFor(file)} トリガーノードが無い`); errors++; }

  // --- 到達可能性（孤立ノード検出）---
  const adj = new Map();
  for (const [src, outs] of Object.entries(conns)) {
    const targets = [];
    for (const branch of (outs.main || [])) for (const link of (branch || [])) targets.push(link.node);
    adj.set(src, targets);
  }
  const seen = new Set(triggers.map(t => t.name));
  const stack = [...seen];
  while (stack.length) {
    const cur = stack.pop();
    for (const nxt of (adj.get(cur) || [])) if (!seen.has(nxt)) { seen.add(nxt); stack.push(nxt); }
  }
  for (const n of nodes) {
    if (!TRIGGER_TYPES.has(n.type) && !seen.has(n.name)) {
      console.log(`${warnFor(file)} 孤立ノード（トリガーから到達不能）: "${n.name}"`); warnings++;
    }
  }

  // --- Code ノードの構文チェック / IF 分岐 / Anthropic クレデンシャル ---
  for (const n of nodes) {
    if (n.type === 'n8n-nodes-base.code') {
      const code = n.parameters?.jsCode ?? '';
      try {
        // n8n Code ノードは top-level return を許容。new Function でラップして構文のみ検査。
        new Function('$input', '$', '$json', '$execution', '$env', '$now', code);
      } catch (e) {
        console.log(`${errsFor(file)} Code "${n.name}" 構文エラー: ${e.message}`); errors++;
      }
    }
    if (n.type === 'n8n-nodes-base.if') {
      const branches = conns[n.name]?.main || [];
      const wired = branches.filter(b => (b || []).length).length;
      if (wired < 2) { console.log(`${warnFor(file)} IF "${n.name}" の出力分岐が ${wired} 本のみ（true/false 両方の配線を確認）`); warnings++; }
    }
    if (n.type === 'n8n-nodes-base.httpRequest') {
      const url = n.parameters?.url ?? '';
      if (/anthropic\.com/.test(url)) {
        const hasCred = !!n.credentials?.anthropicApi || (n.parameters?.headerParameters?.parameters || []).some(p => /x-api-key/i.test(p.name));
        if (!hasCred) { console.log(`${warnFor(file)} HTTP "${n.name}" が Anthropic を叩くがクレデンシャル参照が無い`); warnings++; }
      }
    }
  }
}

const files = readdirSync(WF_DIR).filter(f => f.endsWith('.json')).sort();
console.log(`n8n ワークフロー構造検証: ${files.length} ファイル\n`);
for (const f of files) validate(f, readFileSync(join(WF_DIR, f), 'utf8'));

console.log(`\n結果: エラー ${errors} 件 / 警告 ${warnings} 件（${files.length} ファイル）`);
if (errors > 0) { console.log('→ エラーはインポート失敗・配線切れの原因。修正が必要。'); process.exit(1); }
console.log('→ 構造上のエラーなし（インポート可能な見込み）。警告は要確認。');
