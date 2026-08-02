// DEV_RIO_701/702/705（下書き準備レイヤー）の QAゲート分岐 と 応答パース/フォールバックの検証（n8n不要）。
// 対象: workflows/n8n/DEV_RIO_702_X_Post_Prepare.json の "QA Gate" / "Stop Before Publish"
//       DEV_RIO_701_Affiliate_Prepare.json の "Stop Before Embed"
//       DEV_RIO_705_Threads_Rakuten_Prepare.json の "Stop Before Reply"
// 実行: node products/revenue-intelligence-os/tests/parse_700_series.test.mjs
// 目的: (1) qa_status=PASS のときだけ下書き生成へ進み、品質未達はSKIPされること、
//       (2) AI応答の失敗時に「捏造せず」手動フォールバックへ倒れ、リンクは常にプレースホルダであること。
// 注意: n8n側Codeノードを変更したら本ファイルも同期すること（drift防止）。

// --- QAゲート（Collect Inputs の既定値付与 → IFノード qa_status=='PASS' の end-to-end 相当）---
// 実ワークフローでは Collect Inputs が `qa_status ?? 'PASS'` で既定化してから IF に渡す。
// そのため未設定の手動テスト入力は PASS 扱いになり生成へ進む（意図的な仕様）。
export function qaGate(rawQaStatus) {
  const effective = rawQaStatus ?? 'PASS'; // Collect Inputs の既定化
  return effective === 'PASS' ? 'generate' : 'skip';
}

// --- 702: Stop Before Publish のパース相当 ---
export function parseXDrafts(input) {
  let drafts = [], parse_error = null;
  if (input.error) {
    parse_error = 'anthropic_api_error: ' + JSON.stringify(input.error).slice(0, 300);
  } else {
    try {
      const text = input.content && input.content[0] && input.content[0].text;
      if (!text) throw new Error('no text in response');
      const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      const match = cleaned.match(/\[[\s\S]*\]/);
      drafts = JSON.parse(match ? match[0] : cleaned);
      if (!Array.isArray(drafts) || drafts.length === 0) throw new Error('drafts missing/empty');
      drafts = drafts.map(d => ({ angle: d.angle ?? '', text: d.text ?? '' }));
    } catch (e) { parse_error = 'parse_failed: ' + e.message; }
  }
  if (parse_error) drafts = [{ angle: 'manual', text: '（AI応答の取得/解析に失敗。手動で下書きを作成してください）' }];
  return { drafts, draft_count: drafts.length, draft_error: parse_error, published: false };
}

// --- 701: Stop Before Embed のパース相当（各案にリンク差し込み欄を必ず付与）---
export function parseAffiliate(input) {
  let suggestions = [], parse_error = null;
  if (input.error) {
    parse_error = 'anthropic_api_error: ' + JSON.stringify(input.error).slice(0, 300);
  } else {
    try {
      const text = input.content && input.content[0] && input.content[0].text;
      if (!text) throw new Error('no text in response');
      const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      const match = cleaned.match(/\[[\s\S]*\]/);
      suggestions = JSON.parse(match ? match[0] : cleaned);
      if (!Array.isArray(suggestions) || suggestions.length === 0) throw new Error('suggestions missing/empty');
    } catch (e) { parse_error = 'parse_failed: ' + e.message; }
  }
  if (parse_error) suggestions = [{ genre: 'manual', placement: '', anchor: '（AI応答の取得/解析に失敗。手動で作成してください）' }];
  const enriched = suggestions.map((s, idx) => ({
    genre: s.genre ?? '', placement: s.placement ?? '', anchor: s.anchor ?? '',
    affiliate_link_placeholder: `<<ここに自分の楽天/AmazonアフィリID付きリンクを貼る #${idx + 1}>>`
  }));
  return { suggestions: enriched, draft_error: parse_error, published: false };
}

// --- 704: Stop Before Publish のパース相当（format/text 配列）---
export function parseRepurpose(input) {
  let drafts = [], parse_error = null;
  if (input.error) {
    parse_error = 'anthropic_api_error: ' + JSON.stringify(input.error).slice(0, 300);
  } else {
    try {
      const text = input.content && input.content[0] && input.content[0].text;
      if (!text) throw new Error('no text in response');
      const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      const match = cleaned.match(/\[[\s\S]*\]/);
      drafts = JSON.parse(match ? match[0] : cleaned);
      if (!Array.isArray(drafts) || drafts.length === 0) throw new Error('drafts missing/empty');
      drafts = drafts.map(d => ({ format: d.format ?? 'unknown', text: d.text ?? '' }));
    } catch (e) { parse_error = 'parse_failed: ' + e.message; }
  }
  if (parse_error) drafts = [{ format: 'manual', text: '（AI応答の取得/解析に失敗。手動で下書きを作成してください）' }];
  return { repurpose_drafts: drafts, draft_count: drafts.length, draft_error: parse_error, published: false };
}

let pass = 0, fail = 0;
function check(name, got, expect) {
  const ok = JSON.stringify(got) === JSON.stringify(expect);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (expect=${JSON.stringify(expect)}, got=${JSON.stringify(got)})`);
  ok ? pass++ : fail++;
}

// --- QAゲート ---
check('qa_status=PASS → 生成へ', qaGate('PASS'), 'generate');
check('qa_status=FIX_REQUIRED → SKIP', qaGate('FIX_REQUIRED'), 'skip');
check('qa_status=BLOCK → SKIP', qaGate('BLOCK'), 'skip');
check('qa_status未設定 → 既定PASS扱いで生成（手動テスト用の意図的仕様）', qaGate(undefined), 'generate');

// --- 702 パース ---
check('702 正常JSON → 下書き採用', parseXDrafts({ content: [{ text: '[{"angle":"a","text":"本文 #tag"}]' }] }).drafts[0].text, '本文 #tag');
check('702 ```json フェンス除去', parseXDrafts({ content: [{ text: '```json\n[{"angle":"x","text":"t"}]\n```' }] }).draft_count, 1);
check('702 前置き付き → 配列抽出', parseXDrafts({ content: [{ text: 'はい:\n[{"angle":"x","text":"t"}]' }] }).draft_count, 1);
check('702 APIエラー → 手動フォールバック(error明示)', parseXDrafts({ error: { message: 'overloaded' } }).draft_error !== null, true);
check('702 非JSON → 手動フォールバック', parseXDrafts({ content: [{ text: 'ごめん出せません' }] }).drafts[0].angle, 'manual');
check('702 いかなる場合も published:false', parseXDrafts({ error: { message: 'x' } }).published, false);

// --- 701 パース（リンクは常にプレースホルダ = 偽URLを作らない）---
check('701 正常JSON → 各案にプレースホルダ付与', /^<<ここに自分の/.test(parseAffiliate({ content: [{ text: '[{"genre":"book","placement":"末尾","anchor":"参考書"}]' }] }).suggestions[0].affiliate_link_placeholder), true);
check('701 APIエラーでもプレースホルダは存在（実URL捏造なし）', /placeholder|<</.test(parseAffiliate({ error: { message: 'x' } }).suggestions[0].affiliate_link_placeholder) , true);
check('701 非JSON → 手動フォールバック(error明示)', parseAffiliate({ content: [{ text: 'not json' }] }).draft_error !== null, true);

// --- 704 パース（リパーパス下書き）---
check('704 正常JSON → 3フォーマット採用', parseRepurpose({ content: [{ text: '[{"format":"instagram_caption","text":"a"},{"format":"short_video_script","text":"b"},{"format":"substack_intro","text":"c"}]' }] }).draft_count, 3);
check('704 各要素は format/text を持つ', parseRepurpose({ content: [{ text: '[{"format":"instagram_caption","text":"a"}]' }] }).repurpose_drafts[0].format, 'instagram_caption');
check('704 APIエラー → 手動フォールバック(error明示)', parseRepurpose({ error: { message: 'overloaded' } }).draft_error !== null, true);
check('704 いかなる場合も published:false', parseRepurpose({ error: { message: 'x' } }).published, false);

console.log(`\n${pass}/${pass + fail} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
