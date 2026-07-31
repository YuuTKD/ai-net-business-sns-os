// DEV_RIO_001 分類ロジックのローカル検証（n8n不要）
// 対象: workflows/n8n/DEV_RIO_001_Opportunity_Intake.json の "Classify" Code ノードと同一ロジック。
// 実行: node products/revenue-intelligence-os/tests/classify_opportunity.test.mjs
// 目的: n8nインポート前に分類ロジックの正しさを確認（design/TEST_PLAN.md）。
// 注意: n8n側Codeノードを変更したら、本ファイルのロジックも同期すること（drift防止）。

export function classify(o) {
  let classification, rationale;
  if (o.compliance_flag && o.compliance_flag !== 'OK') {
    classification = 'STOP';
    rationale = 'compliance_flag が NG（規約/法令リスク）。offer_score 無効。';
  } else if (o.duplicate_of) {
    classification = 'MERGE';
    rationale = `既存案件 ${o.duplicate_of} と重複。統合する。`;
  } else if (o.wip_revenue_experiments >= o.wip_cap_revenue) {
    classification = 'HOLD';
    rationale = `収益実験WIPが上限(${o.wip_cap_revenue})に到達。先に既存を完了/停止する。`;
  } else if (o.est_revenue_30d === null || o.risk_level === 'unknown') {
    classification = 'VALIDATE';
    rationale = '需要/収益性が未確定。小規模検証が必要（EXECUTE_NOW より優先）。';
  } else if (o.est_revenue_30d >= 3000 && o.effort_hours <= 8 && o.risk_level !== 'high') {
    classification = 'EXECUTE_NOW';
    rationale = '30日期待収益が閾値以上・低工数・高リスクでない。計測付きで実行候補。';
  } else {
    classification = 'HOLD';
    rationale = 'いずれの実行条件も満たさず、停止するほど負でもない。データ待ち。';
  }
  return { classification, rationale };
}

const base = {
  compliance_flag: 'OK', duplicate_of: null,
  wip_revenue_experiments: 1, wip_cap_revenue: 2,
  est_revenue_30d: 3980, effort_hours: 4, risk_level: 'medium',
};

const cases = [
  { name: 'Brain導線(標準)→EXECUTE_NOW', input: { ...base }, expect: 'EXECUTE_NOW' },
  { name: 'compliance NG→STOP', input: { ...base, compliance_flag: 'NG' }, expect: 'STOP' },
  { name: '重複→MERGE', input: { ...base, duplicate_of: 'camp-store-ai' }, expect: 'MERGE' },
  { name: 'WIP満杯→HOLD', input: { ...base, wip_revenue_experiments: 2 }, expect: 'HOLD' },
  { name: '収益不明→VALIDATE', input: { ...base, est_revenue_30d: null }, expect: 'VALIDATE' },
  { name: 'リスク不明→VALIDATE', input: { ...base, risk_level: 'unknown' }, expect: 'VALIDATE' },
  { name: '低期待収益→HOLD', input: { ...base, est_revenue_30d: 500 }, expect: 'HOLD' },
  { name: '高工数→HOLD', input: { ...base, effort_hours: 20 }, expect: 'HOLD' },
  { name: '高リスク→HOLD', input: { ...base, risk_level: 'high' }, expect: 'HOLD' },
];

let pass = 0, fail = 0;
for (const c of cases) {
  const got = classify(c.input).classification;
  const ok = got === c.expect;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.name}  (expect=${c.expect}, got=${got})`);
  ok ? pass++ : fail++;
}
console.log(`\n${pass}/${cases.length} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
