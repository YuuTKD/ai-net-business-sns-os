// DEV_RIO_101 → 102 → 103 → 201 のローカル擬似実行（n8n不要・Anthropic API課金なし）
// 実行: node products/revenue-intelligence-os/tests/simulate_pipeline.mjs
//
// 目的: Anthropicクレジット購入前・n8n再インポート前に、パイプライン全体の「配線」が
// 正しく繋がっているか（各段の出力フィールドが次段の期待フィールドと一致するか）を
// ローカルで検証する。REPORT-014で見つかったフィールド不整合バグ（theme/audience/facts
// のロスト、note_body↔note_draft_bodyの名前不一致）の再発防止テストを兼ねる。
//
// ⚠️ 重要: このファイルが出力する記事本文・投稿文・リサーチ結果は全て「モック（仮の再現データ）」であり、
// 実在の事実・実測データではない。content/drafts/ 等、公開候補の場所に転記して使用しないこと。
//
// 注意: n8n側Codeノードを変更したら、本ファイルの各関数も同期すること（drift防止）。
//       AI応答パース/フォールバック/QA統合の詳細ロジックは tests/parse_ai_responses.test.mjs 側で検証済み。
//       本ファイルは「段をまたいだ配線（フィールドの受け渡し）」の検証に専念する。

import { parseResearchResponse, parseExperimentDesign, combineQaResult } from './parse_ai_responses.test.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MOCK_WARNING = 'MOCK SIMULATION DATA — 実在の事実・実測データではありません。公開候補として使用禁止。';

// ---- 101: Collect Inputs ----
function collectInputs101(i = {}) {
  return {
    experiment_id: i.experiment_id ?? 'exp-001',
    theme: i.theme ?? '店舗の固定費/決済手数料の見直し',
    audience: i.audience ?? '小規模店舗経営者(飲食・美容)',
    raw_sources: i.raw_sources ?? []
  };
}

// ---- 101: Assemble Evidence Pack (修正後: theme/audienceを引き継ぐ) ----
function assembleEvidencePack101(o, execId) {
  const rawFacts = (o.raw_sources && o.raw_sources.length)
    ? o.raw_sources.map(s => ({ claim: s.claim, value: s.value ?? null, source_type: s.source_type ?? 'unknown', source_url: s.source_url ?? null }))
    : [];
  const facts = rawFacts.length ? rawFacts.concat(o.research_facts || []) : (o.research_facts || [{ claim: '需要・競合・報酬条件は未取得', value: null, source_type: 'unknown', source_url: null }]);
  return {
    evidence_pack_id: 'ev-' + execId,
    experiment_id: o.experiment_id,
    theme: o.theme,
    audience: o.audience,
    sources: (o.raw_sources || []).map(s => s.source_url).filter(Boolean),
    facts,
    notes: o.research_error ? ('AIリサーチ取得に問題あり: ' + o.research_error) : 'AIリサーチ(Anthropic API)による一般的傾向の推測を含む。実測データではない。',
    assets: []
  };
}

// ---- 102: Collect Evidence Input ----
function collectEvidenceInput102(i = {}) {
  return {
    experiment_id: i.experiment_id ?? 'exp-001',
    theme: i.theme ?? '店舗の固定費/決済手数料の見直し',
    audience: i.audience ?? '小規模店舗経営者(飲食・美容)',
    facts: i.facts ?? [],
    judge_by: i.judge_by ?? null
  };
}

// ---- 102: Validate (single variable) ----
function validateSingleVariable102(o) {
  const required = ['experiment_id', 'audience_id', 'offer_id', 'channel', 'variable_changed', 'success_condition', 'stop_condition'];
  const missing = required.filter(k => !o[k]);
  const singleVariable = typeof o.variable_changed === 'string' && !o.variable_changed.includes(',');
  const valid = missing.length === 0 && singleVariable;
  return { ...o, valid, missing, singleVariable, state: valid ? 'QA_REVIEW' : 'FAILED_RETRYABLE' };
}

// ---- 103: Collect Content Brief (修正後: media は channel からもフォールバック) ----
function collectContentBrief103(i = {}) {
  return {
    content_id: i.content_id ?? 'ca-note-001',
    media: i.media ?? i.channel ?? 'note',
    theme: i.theme ?? '店舗の固定費/決済手数料の見直し',
    audience: i.audience ?? null,
    angle: i.angle ?? 'AIで店舗の雑務を減らす手順',
    cta: i.cta ?? 'Brainで7日分のテンプレを配布中',
    affiliate: i.affiliate ?? null,
    ad_disclosure: i.ad_disclosure ?? (i.affiliate ? 'PR' : null),
    facts: i.facts ?? [],
    line_user_id: i.line_user_id ?? null
  };
}

// ---- 103: Build LINE Message ----
function buildLineMessage103(o) {
  const line_message = o.state === 'WAITING_APPROVAL'
    ? `【下書き完成】${o.media}「${o.content_id}」の下書きができました。n8nで内容を確認し、問題なければご自身の操作で投稿してください。(QA: ${o.qa_status})`
    : `【要対応】${o.media}「${o.content_id}」の下書きが${o.qa_status}判定です。issues: ${(o.issues || []).join(' / ')}`;
  return { ...o, line_message };
}

// ---- 201: Prepare Distribution (修正後: note_body を優先して受け取る) ----
function prepareDistribution201(i) {
  const experiment_id = i.experiment_id ?? 'exp-001';
  const theme = i.theme ?? 'store-ai';
  const variant = i.variant ?? 'a';
  const utm = `utm_source=note&utm_medium=organic&utm_campaign=${theme}-${experiment_id}&utm_content=${variant}`;
  const brand_url = i.brand_url ?? 'https://brain-market.com/u/ai_store_yuya/a/b1MTM1UjMgoTZsNWa0JXY';
  return {
    content_id: i.content_id ?? 'ca-note-001',
    threads_post: i.threads_post ?? '雑務、AIに投げてます。手順はnoteに（プロフから）。',
    note_draft_body: i.note_body ?? i.note_draft_body ?? '（note本文サンプル）… 末尾CTA↓',
    brain_link_with_utm: `${brand_url}?${utm}`,
    account_id: 'ai_store_lab',
    platform: 'threads',
    action_type: 'prepare_distribution'
  };
}

// ---- 201: Stop Before Publish ----
function stopBeforePublish201(o, execId) {
  const idempotency_key = ['ai_store_lab', o.platform, o.content_id, o.action_type].join('|');
  return { ...o, idempotency_key, state: 'WAITING_APPROVAL', published: false };
}

// ============================================================
// モックAnthropic応答（realistic だが完全に架空のサンプルデータ）
// ============================================================
function mockAnthropicResponse(text) {
  return { content: [{ text }] };
}

const MOCK_RESEARCH_TEXT = JSON.stringify({
  facts: [
    { claim: '小規模店舗では決済手数料が月次固定費の中で見落とされがちという傾向が一般に言われる', value: null, source_type: 'estimation', source_url: null },
    { claim: 'キャッシュレス決済比率の上昇に伴い、複数の決済手段の手数料比較を行う店舗が増える傾向にある', value: null, source_type: 'estimation', source_url: null },
    { claim: '固定費見直しの発信は「今すぐ試せる具体策」への反応が良い傾向がある（一般的な傾向）', value: null, source_type: 'estimation', source_url: null }
  ]
});

const MOCK_DESIGN_TEXT = JSON.stringify({
  audience_id: 'aud-store-owner',
  offer_id: 'P-BRAIN-01',
  angle: '決済手数料の見直しだけで浮く金額を具体的に示す',
  channel: 'note',
  variable_changed: 'hook',
  success_condition: 'note遷移が既存平均の1.5倍（14日間）',
  stop_condition: '≥1000表示でCTRが既存平均を明確に下回る',
  min_data: '≥1000表示 or ≥50クリック'
});

const MOCK_DRAFT_TEXT = JSON.stringify({
  note_body: '毎月の決済手数料、見直したことはありますか。【実際の経験に置き換える：自店舗での見直しエピソード】ここでは一般的な確認ポイントを3つ紹介します。',
  threads_post: '決済手数料、見直すだけで浮くお金があるかも。詳しくはnoteに。'
});

const MOCK_QA_PASS_TEXT = JSON.stringify({ qa_status: 'PASS', issues: [] });

// ============================================================
// パイプライン実行
// ============================================================
function runPipeline(label, { researchResponse, designResponse, draftResponse, qaResponse, sourceInput = {} }) {
  console.log(`\n===== シミュレーション: ${label} =====`);
  const execId = 'sim-' + label.replace(/\s+/g, '-');

  // --- DEV_RIO_101 ---
  const i101 = collectInputs101(sourceInput);
  const research = parseResearchResponse(researchResponse);
  const evidencePack = assembleEvidencePack101({ ...i101, research_facts: research.facts, research_error: research.parse_error }, execId);

  // --- DEV_RIO_102 ---
  const i102 = collectEvidenceInput102(evidencePack);
  const parsedDesign = parseExperimentDesign(designResponse);
  const design = { ...i102, ...parsedDesign }; // Parse Experiment DesignノードはExperiment_idもtheme/audience/factsも上書きする形でo(=Build Experiment Design Promptの出力)から取るため、ここでは i102 の値を土台にparsedDesignで上書き
  const validated = validateSingleVariable102(design);

  // --- DEV_RIO_103 ---
  const brief = collectContentBrief103(validated);
  const draftParsed = (() => {
    // Parse Content Draftの簡易再現（フォールバック文言のみ共通化）
    if (draftResponse.error) {
      return { note_body: '【AI下書き生成に失敗。人間による手動執筆が必要】', threads_post: '【AI下書き生成に失敗。人間による手動執筆が必要】', draft_source: 'fallback_placeholder' };
    }
    try {
      const text = draftResponse.content[0].text;
      const parsed = JSON.parse(text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, ''));
      return { note_body: parsed.note_body, threads_post: parsed.threads_post, draft_source: 'anthropic_ai' };
    } catch {
      return { note_body: '【AI下書き生成に失敗。人間による手動執筆が必要】', threads_post: '【AI下書き生成に失敗。人間による手動執筆が必要】', draft_source: 'fallback_placeholder' };
    }
  })();
  const draftMerged = { ...brief, ...draftParsed };
  const qaCombined = combineQaResult(qaResponse, draftMerged);
  const contentResult = { ...draftMerged, ...qaCombined };
  const withLine = buildLineMessage103(contentResult);

  // --- DEV_RIO_201 ---
  const distPrepared = prepareDistribution201({ ...withLine, experiment_id: validated.experiment_id, theme: validated.theme });
  const distFinal = stopBeforePublish201(distPrepared, execId);

  console.log('evidence_pack.theme/audience:', evidencePack.theme, '/', evidencePack.audience);
  console.log('facts source_types:', evidencePack.facts.map(f => f.source_type));
  console.log('experiment.variable_changed:', validated.variable_changed, '| valid:', validated.valid, '| state:', validated.state);
  console.log('content.qa_status/state:', contentResult.qa_status, '/', contentResult.state);
  console.log('LINE message:', withLine.line_message);
  console.log('201 note_draft_body (should reflect actual draft, not dummy sample):', distFinal.note_draft_body);
  console.log('201 idempotency_key:', distFinal.idempotency_key, '| published:', distFinal.published);

  return { evidencePack, validated, contentResult, distFinal };
}

// ============================================================
// アサーション（回帰防止）
// ============================================================
let pass = 0, fail = 0;
function assert(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  cond ? pass++ : fail++;
}

// --- シナリオA: 正常系（全AI応答成功） ---
const happy = runPipeline('正常系(AI全成功)', {
  researchResponse: mockAnthropicResponse(MOCK_RESEARCH_TEXT),
  designResponse: mockAnthropicResponse(MOCK_DESIGN_TEXT),
  draftResponse: mockAnthropicResponse(MOCK_DRAFT_TEXT),
  qaResponse: mockAnthropicResponse(MOCK_QA_PASS_TEXT),
});

assert('101: theme/audienceが102以降まで正しく引き継がれる', happy.evidencePack.theme === '店舗の固定費/決済手数料の見直し' && happy.validated.theme === '店舗の固定費/決済手数料の見直し');
assert('102: channelがnote指定→103のmediaにも反映される', happy.contentResult.media === 'note');
assert('103→201: note_bodyの内容が201のnote_draft_bodyに正しく渡る（ダミー文言に落ちない）', happy.distFinal.note_draft_body.includes('決済手数料'));
assert('未差し替えプレースホルダーが残っているためFIX_REQUIREDになる（公開に進まない）', happy.contentResult.qa_status === 'FIX_REQUIRED' && happy.contentResult.state === 'FAILED_RETRYABLE');
assert('全factsのsource_typeがestimation/unknownのみ（捏造なし）', happy.evidencePack.facts.every(f => ['estimation', 'unknown'].includes(f.source_type)));

// --- シナリオB: 障害系（Anthropic API全失敗＝今日実際に発生したクレジット不足エラーを模擬） ---
const failure = runPipeline('障害系(Anthropic全失敗=クレジット不足を模擬)', {
  researchResponse: { error: { type: 'error', error: { message: 'Your credit balance is too low to access the Anthropic API.' } } },
  designResponse: { error: { type: 'error', error: { message: 'Your credit balance is too low to access the Anthropic API.' } } },
  draftResponse: { error: { type: 'error', error: { message: 'Your credit balance is too low to access the Anthropic API.' } } },
  qaResponse: { error: { type: 'error', error: { message: 'Your credit balance is too low to access the Anthropic API.' } } },
});

assert('障害系: パイプライン全体が例外で落ちずに最後まで完走する', !!failure.distFinal);
assert('障害系: factsは捏造されずunknownフォールバックになる', failure.evidencePack.facts.every(f => f.source_type === 'unknown'));
assert('障害系: 実験設計はfallback_defaultで安全な既定値になる', failure.validated.design_source === 'fallback_default' && failure.validated.valid === true);
assert('障害系: 下書き生成失敗時はプレースホルダーになりQAはFIX_REQUIRED以上（絶対にPASSしない）', failure.contentResult.qa_status !== 'PASS');
assert('障害系: WAITING_APPROVALには絶対に到達しない（人間が気づかず公開に進むリスクを排除）', failure.contentResult.state !== 'WAITING_APPROVAL');

console.log(`\n${pass}/${pass + fail} passed, ${fail} failed`);

// ---- サンプル出力をfixtureとして保存（明示的にMOCKと分かる形式で） ----
const fixture = {
  _MOCK_WARNING: MOCK_WARNING,
  generated_by: 'products/revenue-intelligence-os/tests/simulate_pipeline.mjs',
  scenarios: { happy_path: happy, failure_path: failure }
};

const fixtureDir = join(__dirname, 'fixtures');
mkdirSync(fixtureDir, { recursive: true });
const fixturePath = join(fixtureDir, 'sample_pipeline_run.MOCK.json');
writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + '\n');
console.log(`\nサンプル出力を保存しました（MOCKデータ・公開候補として使用禁止）: ${fixturePath}`);

if (fail > 0) process.exit(1);
