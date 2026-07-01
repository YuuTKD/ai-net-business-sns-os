/**
 * Daily Publish Orchestrator
 * Reads day's post content and outputs for review or manual posting.
 *
 * Usage:
 *   node scripts/daily_publish_orchestrator.js --day 2 --threads-dry
 *   node scripts/daily_publish_orchestrator.js --day 2 --threads-live
 *
 * --threads-dry   : Preview post content (no API call)
 * --threads-live  : Output final text + manual posting instructions
 *
 * NOTE: Live posting to Threads requires manual action via the Threads app
 * or a configured Threads API token (not stored in this repo).
 */

const fs = require('fs');
const path = require('path');

const URLS = {
  TALLY_QUIZ_LINK: 'https://tally.so/r/MegGeM',
  GUMROAD_LINK: 'https://tokudatree.gumroad.com/l/qrrtvc',
};

const POSTS_FILE = path.join(__dirname, '..', 'content', 'global_x_threads_launch_posts_20.md');
const POST_LOG = path.join(__dirname, '..', 'operations', 'threads_post_log.md');

function getArgs() {
  const args = process.argv.slice(2);
  return {
    day: parseInt((args.find(a => a.startsWith('--day')) || '--day 1').split(' ')[1] ||
         args[args.indexOf('--day') + 1] || '1'),
    dryRun: args.includes('--threads-dry'),
    live: args.includes('--threads-live'),
  };
}

function resolveArgs() {
  const argv = process.argv.slice(2);
  let day = 1;
  let dryRun = false;
  let live = false;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--day') day = parseInt(argv[i + 1]);
    if (argv[i] === '--threads-dry') dryRun = true;
    if (argv[i] === '--threads-live') live = true;
  }
  return { day, dryRun, live };
}

function extractPost(content, postNumber) {
  const pattern = new RegExp(
    `## POST ${String(postNumber).padStart(2, '0')}[\\s\\S]*?\`\`\`([\\s\\S]*?)\`\`\``,
    'i'
  );
  const match = content.match(pattern);
  if (!match) return null;
  return match[1].trim();
}

function substituteUrls(text) {
  return text
    .replace(/\{\{TALLY_QUIZ_LINK\}\}/g, URLS.TALLY_QUIZ_LINK)
    .replace(/\{\{GUMROAD_LINK\}\}/g, URLS.GUMROAD_LINK);
}

function toThreadsLength(text) {
  // Threads limit: 500 chars. Trim if needed.
  const resolved = substituteUrls(text);
  if (resolved.length <= 500) return resolved;
  return resolved.slice(0, 497) + '...';
}

function checkAlreadyPosted(day) {
  if (!fs.existsSync(POST_LOG)) return false;
  const log = fs.readFileSync(POST_LOG, 'utf8');
  return log.includes(`Day ${day}`) && log.includes('✅');
}

function main() {
  const { day, dryRun, live } = resolveArgs();

  if (!dryRun && !live) {
    console.error('Usage: node scripts/daily_publish_orchestrator.js --day N [--threads-dry | --threads-live]');
    process.exit(1);
  }

  const content = fs.readFileSync(POSTS_FILE, 'utf8');
  const postText = extractPost(content, day);

  if (!postText) {
    console.error(`POST ${String(day).padStart(2, '0')} not found in posts file.`);
    process.exit(1);
  }

  const threadsText = toThreadsLength(postText);
  const charCount = threadsText.length;

  if (checkAlreadyPosted(day)) {
    console.error(`\n⚠️  Day ${day} is already marked as posted in threads_post_log.md`);
    console.error('Double-check before proceeding.\n');
  }

  console.log('\n' + '='.repeat(60));
  console.log(`THREADS DAY ${day} — ${dryRun ? 'DRY RUN' : 'LIVE PREP'}`);
  console.log('='.repeat(60));
  console.log(`\nAccount : @client_docs_lab`);
  console.log(`Chars   : ${charCount} / 500`);
  console.log(`Status  : ${charCount <= 500 ? '✅ Within limit' : '❌ TOO LONG'}`);
  console.log('\n--- POST CONTENT ---\n');
  console.log(threadsText);
  console.log('\n--- END ---');

  if (live) {
    console.log('\n' + '='.repeat(60));
    console.log('LIVE POSTING INSTRUCTIONS');
    console.log('='.repeat(60));
    console.log('\n1. Copy the text above');
    console.log('2. Open Threads app or threads.net');
    console.log('3. Log in as @client_docs_lab');
    console.log('4. Paste and post');
    console.log('5. Copy the post URL');
    console.log('6. Add to operations/threads_post_log.md');
    console.log('7. Report back: "Threads Day N posted: [URL]"\n');
    console.log('⚠️  Do NOT post until you have confirmed this is NOT already live.\n');
  }
}

main();
