/**
 * Playwright Publish Helper
 * Sell the Client Docs You Already Use
 *
 * What this does:
 * - Opens each publish page in sequence
 * - Navigates to the correct section (after user has logged in)
 * - Does NOT handle login, 2FA, passwords, or form submission
 *
 * Usage:
 *   node operations/playwright_publish_helper.js [task]
 *
 * Tasks:
 *   gumroad  - Open Gumroad new product page
 *   tally    - Open Tally new form page
 *   brevo    - Open Brevo automations page
 *   linkedin - Open LinkedIn profile edit page
 *   threads  - Open Threads profile page
 *   all      - Open all pages in sequence (default)
 *   check    - Check if placeholders remain in key files
 *
 * Requirements:
 *   npm install playwright (or: npx playwright install chromium)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PAGES = {
  gumroad:  'https://app.gumroad.com/products/new',
  tally:    'https://tally.so/forms',
  brevo:    'https://app.brevo.com/automation/list',
  linkedin: 'https://www.linkedin.com/in/',
  threads:  'https://www.threads.net/',
};

const PROJECT_ROOT = path.join(__dirname, '..');

async function openPage(browser, name, url) {
  console.log(`Opening ${name}...`);
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  console.log(`  ${name} opened → ${url}`);
  console.log(`  Action required: Log in if needed, then follow claude_publish_operator.md Phase for ${name}`);
  return page;
}

async function openAll() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium',
    args: ['--start-maximized'],
  });

  console.log('\n=== Opening all publish pages ===\n');
  for (const [name, url] of Object.entries(PAGES)) {
    await openPage(browser, name, url);
    await new Promise(r => setTimeout(r, 800));
  }

  console.log('\n=== All pages opened ===');
  console.log('Next: Log in to each service, then follow operations/claude_publish_operator.md\n');
  console.log('Press Ctrl+C when done to close the browser.');

  await new Promise(() => {});  // Keep open until user closes
}

async function openOne(task) {
  const url = PAGES[task];
  if (!url) {
    console.error(`Unknown task: ${task}`);
    console.error(`Valid tasks: ${Object.keys(PAGES).join(', ')}, all, check`);
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: false,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium',
    args: ['--start-maximized'],
  });

  await openPage(browser, task, url);
  console.log('\nPress Ctrl+C when done to close the browser.');
  await new Promise(() => {});
}

function checkPlaceholders() {
  console.log('\n=== Checking for remaining placeholders ===\n');

  const placeholders = ['{{GUMROAD_LINK}}', '{{TALLY_QUIZ_LINK}}', '{{SUPPORT_EMAIL}}', '{{BREVO_FORM_LINK}}'];
  const extensions = ['.md', '.sh', '.txt'];
  const skipDirs = ['node_modules', '.git', 'dist'];

  let found = 0;
  const results = {};

  function walk(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!skipDirs.includes(entry.name)) walk(fullPath);
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            for (const ph of placeholders) {
              if (content.includes(ph)) {
                if (!results[fullPath]) results[fullPath] = [];
                results[fullPath].push(ph);
                found++;
              }
            }
          } catch (e) {
            // skip unreadable files
          }
        }
      }
    } catch (e) {
      // skip unreadable dirs
    }
  }

  walk(PROJECT_ROOT);

  if (found === 0) {
    console.log('✅ No placeholders found. All URLs are replaced. Ready to publish.\n');
  } else {
    console.log(`⚠️  Found ${found} placeholder(s) in the following files:\n`);
    for (const [file, phs] of Object.entries(results)) {
      const rel = path.relative(PROJECT_ROOT, file);
      console.log(`  ${rel}`);
      for (const ph of [...new Set(phs)]) {
        console.log(`    → ${ph}`);
      }
    }
    console.log('\nReplace all placeholders using url_placeholder_replacement_map.md');
    console.log('or ask Claude Code to run the replacement for you.\n');
  }
}

async function main() {
  const task = process.argv[2] || 'all';

  if (task === 'check') {
    checkPlaceholders();
    return;
  }

  if (task === 'all') {
    await openAll();
  } else {
    await openOne(task);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
