// DEV_RIO_101/102/103 の Anthropic応答パース/フォールバック/QA統合ロジックのローカル検証（n8n不要）
// 対象: workflows/n8n/DEV_RIO_101_Evidence_Build.json の "Parse Research Response"
//       workflows/n8n/DEV_RIO_102_Experiment_Design.json の "Parse Experiment Design"
//       workflows/n8n/DEV_RIO_103_Content_QA_Approval.json の "Combine QA Result"
// 実行: node products/revenue-intelligence-os/tests/parse_ai_responses.test.mjs
// 目的: AI応答の取得失敗・解析失敗時に「捏造しない」フォールバックへ正しく倒れること、
//       QA判定でAIがPASSでもルール違反があればより厳しい判定を優先することを、n8nインポート前に確認する。
// 注意: n8n側Codeノードを変更したら、本ファイルのロジックも同期すること（drift防止）。

export function parseResearchResponse(input) {
  let facts = null;
  let parse_error = null;

  if (input.error) {
    parse_error = 'anthropic_api_error: ' + JSON.stringify(input.error).slice(0, 300);
  } else {
    try {
      const text = input.content && input.content[0] && input.content[0].text;
      if (!text) throw new Error('no text in response');
      const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed.facts) || parsed.facts.length === 0) throw new Error('facts missing/empty');
      facts = parsed.facts.map(f => ({
        claim: f.claim ?? '（応答からclaimを取得できず）',
        value: f.value ?? null,
        source_type: f.source_type === 'estimation' ? 'estimation' : 'unknown',
        source_url: f.source_url ?? null
      }));
    } catch (e) {
      parse_error = 'parse_failed: ' + e.message;
    }
  }

  if (!facts) {
    facts = [{ claim: '需要・競合・報酬条件は未取得（AI応答の取得/解析に失敗）', value: null, source_type: 'unknown', source_url: null }];
  }
  return { facts, parse_error };
}

export function parseExperimentDesign(input) {
  let design = null;
  let design_error = null;

  if (input.error) {
    design_error = 'anthropic_api_error: ' + JSON.stringify(input.error).slice(0, 300);
  } else {
    try {
      const text = input.content && input.content[0] && input.content[0].text;
      if (!text) throw new Error('no text in response');
      const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      design = JSON.parse(cleaned);
    } catch (e) {
      design_error = 'parse_failed: ' + e.message;
    }
  }

  const fallback = {
    audience_id: 'aud-store-owner', offer_id: 'P-BRAIN-01', angle: 'AIで雑務を週3時間削減',
    channel: 'threads', variable_changed: 'hook',
    success_condition: 'note遷移≥50 かつ Brain遷移≥5（14日）',
    stop_condition: '≥1000表示 or ≥50クリックで明確な負', min_data: '≥1000表示 or ≥50クリック'
  };
  const d = design || {};
  return {
    audience_id: d.audience_id ?? fallback.audience_id,
    offer_id: d.offer_id ?? fallback.offer_id,
    angle: d.angle ?? fallback.angle,
    channel: d.channel ?? fallback.channel,
    variable_changed: d.variable_changed ?? fallback.variable_changed,
    success_condition: d.success_condition ?? fallback.success_condition,
    stop_condition: d.stop_condition ?? fallback.stop_condition,
    min_data: d.min_data ?? fallback.min_data,
    design_source: design ? 'anthropic_ai' : 'fallback_default',
    design_error
  };
}

export function combineQaResult(aiInput, o) {
  let aiQa = null;
  let ai_qa_error = null;
  if (aiInput.error) {
    ai_qa_error = 'anthropic_api_error: ' + JSON.stringify(aiInput.error).slice(0, 300);
  } else {
    try {
      const text = aiInput.content && aiInput.content[0] && aiInput.content[0].text;
      if (!text) throw new Error('no text in response');
      const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      aiQa = JSON.parse(cleaned);
    } catch (e) {
      ai_qa_error = 'parse_failed: ' + e.message;
    }
  }

  const ruleIssues = [];
  if (o.affiliate && !o.ad_disclosure) ruleIssues.push('アフィリ掲載だがPR表記なし');
  if (!o.note_body || o.note_body.length < 20) ruleIssues.push('本文が短すぎ/空');
  if (!o.cta) ruleIssues.push('CTAなし');
  if (/【実際の経験に置き換える/.test(o.note_body || '') || /【AI下書き生成に失敗/.test(o.note_body || '')) ruleIssues.push('未確定プレースホルダーが残存（公開前に人間の差し替えが必須）');

  let ruleStatus;
  if (o.affiliate && !o.ad_disclosure) ruleStatus = 'BLOCK';
  else if (ruleIssues.length) ruleStatus = 'FIX_REQUIRED';
  else ruleStatus = 'PASS';

  const rank = { PASS: 0, FIX_REQUIRED: 1, BLOCK: 2 };
  const aiStatus = (aiQa && aiQa.qa_status && rank[aiQa.qa_status] !== undefined) ? aiQa.qa_status : 'FIX_REQUIRED';
  const aiIssues = (aiQa && Array.isArray(aiQa.issues)) ? aiQa.issues : (ai_qa_error ? [`AI QA取得失敗: ${ai_qa_error}`] : []);

  const qa_status = rank[aiStatus] >= rank[ruleStatus] ? aiStatus : ruleStatus;
  const issues = [...new Set([...ruleIssues, ...aiIssues])];
  const state = qa_status === 'PASS' ? 'WAITING_APPROVAL' : (qa_status === 'BLOCK' ? 'DEAD_LETTER_QUEUE' : 'FAILED_RETRYABLE');
  return { qa_status, issues, state };
}

let pass = 0, fail = 0;
function check(name, got, expect) {
  const ok = JSON.stringify(got) === JSON.stringify(expect);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (expect=${JSON.stringify(expect)}, got=${JSON.stringify(got)})`);
  ok ? pass++ : fail++;
}

// --- parseResearchResponse ---
check(
  '正常応答→estimationとして採用',
  parseResearchResponse({ content: [{ text: '{"facts":[{"claim":"a","source_type":"estimation"}]}' }] }).facts[0].source_type,
  'estimation'
);
check(
  'AIがsource_typeを"fact"等と偽っても強制的にunknownへ矯正（捏造防止）',
  parseResearchResponse({ content: [{ text: '{"facts":[{"claim":"a","source_type":"fact"}]}' }] }).facts[0].source_type,
  'unknown'
);
check(
  'APIエラー時はunknownフォールバック1件',
  parseResearchResponse({ error: { message: 'credit balance too low' } }).facts.length,
  1
);
check(
  'APIエラー時のfallback source_typeはunknown',
  parseResearchResponse({ error: { message: 'x' } }).facts[0].source_type,
  'unknown'
);
check(
  'JSON解析失敗時もunknownフォールバック',
  parseResearchResponse({ content: [{ text: 'これはJSONではない' }] }).facts[0].source_type,
  'unknown'
);
check(
  'facts空配列は解析失敗扱い→フォールバック',
  parseResearchResponse({ content: [{ text: '{"facts":[]}' }] }).parse_error !== null,
  true
);

// --- parseExperimentDesign ---
check(
  '正常応答→AI値を採用しdesign_source=anthropic_ai',
  parseExperimentDesign({ content: [{ text: '{"variable_changed":"cta"}' }] }).design_source,
  'anthropic_ai'
);
check(
  'APIエラー時はfallback_defaultかつ既定のvariable_changed=hook',
  (() => { const r = parseExperimentDesign({ error: { message: 'x' } }); return [r.design_source, r.variable_changed]; })(),
  ['fallback_default', 'hook']
);
check(
  '解析失敗時もfallback_default',
  parseExperimentDesign({ content: [{ text: 'not json' }] }).design_source,
  'fallback_default'
);

// --- combineQaResult ---
const goodDraft = { note_body: 'あ'.repeat(30), threads_post: 'x', cta: 'CTA', affiliate: null, ad_disclosure: null };
check(
  'AI PASS + ルール違反なし→PASS/WAITING_APPROVAL',
  (() => { const r = combineQaResult({ content: [{ text: '{"qa_status":"PASS","issues":[]}' }] }, goodDraft); return [r.qa_status, r.state]; })(),
  ['PASS', 'WAITING_APPROVAL']
);
check(
  'AIがPASSでもアフィリ+PR表記なし(ルール違反)→BLOCKを優先（AI過信防止）',
  combineQaResult({ content: [{ text: '{"qa_status":"PASS","issues":[]}' }] }, { ...goodDraft, affiliate: 'a8net', ad_disclosure: null }).qa_status,
  'BLOCK'
);
check(
  'AI QA取得失敗時はFIX_REQUIRED以上に倒す（無条件PASSにしない）',
  combineQaResult({ error: { message: 'x' } }, goodDraft).qa_status,
  'FIX_REQUIRED'
);
check(
  '未差し替えプレースホルダーが残っていれば要修正',
  combineQaResult({ content: [{ text: '{"qa_status":"PASS","issues":[]}' }] }, { ...goodDraft, note_body: '【実際の経験に置き換える：本文】' }).qa_status,
  'FIX_REQUIRED'
);

console.log(`\n${pass}/${pass + fail} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
