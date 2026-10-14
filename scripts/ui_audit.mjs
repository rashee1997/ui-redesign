#!/usr/bin/env node
/**
 * ui_audit.mjs — responsive + UI bug audit for one or more pages.
 *
 * For each URL and each width it:
 *   - takes a full-page screenshot
 *   - measures page-level horizontal overflow
 *   - lists elements that stick out of the viewport (outside a scroll container)
 *   - lists short labels (buttons, tabs, headers, badges, nav links) that wrapped to 2+ lines
 *   - lists text clipped by overflow:hidden without an ellipsis
 *   - lists tap targets smaller than --min-target (default 24x24 CSS px, WCAG 2.5.8; inline links skipped)
 *   - lists visible text smaller than --min-font (default 12px)
 *   - lists <img> without width/height (layout shift risk)
 *   - collects console errors and failed requests
 *   - finds spinners that aren't round (oval/squashed) or that spin together with text
 *   - measures layout shift (CLS) while the page loads
 * With --open it also clicks each trigger selector, audits the open dialog, screenshots it, and presses Escape.
 * With --loading-shot it slows fetch/XHR responses and screenshots the loading state: skeleton, spinner only, or blank.
 * With --press it clicks action buttons (submit/save/delete) while holding their request, and checks the pending state:
 *   button disabled/aria-busy, spinner round, button size unchanged. Requests are ABORTED after the hold unless
 *   --press-allow is passed, so nothing is written. Use --fill to fill required fields first.
 *
 * Usage:
 *   node ui_audit.mjs --url http://localhost:3000/invoices --out .ui-audit/before
 *   node ui_audit.mjs --url http://localhost:3000/a --url http://localhost:3000/b --out .ui-audit/after \
 *        --open "button:has-text('New invoice')" --open "[data-testid=filters]" \
 *        --wait-for "main" --cookie "session=abc" --storage-state auth.json
 *
 * Options:
 *   --url <url>            page to audit (repeatable, required)
 *   --out <dir>            output folder (default .ui-audit/run)
 *   --widths <list>        comma list (default 320,375,390,412,768,1024,1280,1920)
 *   --height <px>          viewport height (default 900)
 *   --open <selector>      trigger to click to open a dialog/sheet/menu (repeatable)
 *   --open-widths <list>   widths used for --open (default 390,1280)
 *   --wait-for <selector>  wait for this selector before checking
 *   --wait <ms>            extra settle time after load (default 500)
 *   --cookie <name=value>  cookie for the URL's domain (repeatable)
 *   --storage-state <file> Playwright storage state JSON (logged-in session)
 *   --no-full-page         viewport-only screenshots
 *   --min-font <px>        smallest allowed text size (default 12; use DESIGN.md's value if it sets one)
 *   --min-target <px>      smallest allowed tap target (default 24; use DESIGN.md's value if it sets one)
 *   --loading-shot         also capture the loading state (at --open-widths) with data requests slowed
 *   --slow <ms>            how long to hold requests for --loading-shot / --press (default 2500)
 *   --press <selector>     action button to press and check its pending state (repeatable, at --open-widths)
 *   --fill <sel=value>     fill a field before pressing (repeatable)
 *   --press-allow          let pressed requests through after the hold (only on test data!)
 *
 * Pass the project's breakpoints via --widths when DESIGN.md defines them, e.g. --widths 320,390,640,1024,1440
 *
 * Output: <out>/report.json, <out>/summary.md, <out>/*.png. Exit code 0 always (it's a report).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

// ---------- args ----------
const argv = process.argv.slice(2);
const opts = { urls: [], open: [], cookies: [], out: '.ui-audit/run', widths: [320, 375, 390, 412, 768, 1024, 1280, 1920],
  openWidths: [390, 1280], height: 900, waitFor: null, wait: 500, storageState: null, fullPage: true, minFont: 12, minTarget: 24,
  loadingShot: false, slow: 2500, press: [], fill: [], pressAllow: false };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i], v = () => argv[++i];
  if (a === '--url') opts.urls.push(v());
  else if (a === '--out') opts.out = v();
  else if (a === '--widths') opts.widths = v().split(',').map(Number);
  else if (a === '--open-widths') opts.openWidths = v().split(',').map(Number);
  else if (a === '--height') opts.height = Number(v());
  else if (a === '--open') opts.open.push(v());
  else if (a === '--wait-for') opts.waitFor = v();
  else if (a === '--wait') opts.wait = Number(v());
  else if (a === '--cookie') opts.cookies.push(v());
  else if (a === '--storage-state') opts.storageState = v();
  else if (a === '--no-full-page') opts.fullPage = false;
  else if (a === '--min-font') opts.minFont = Number(v());
  else if (a === '--min-target') opts.minTarget = Number(v());
  else if (a === '--loading-shot') opts.loadingShot = true;
  else if (a === '--slow') opts.slow = Number(v());
  else if (a === '--press') opts.press.push(v());
  else if (a === '--fill') opts.fill.push(v());
  else if (a === '--press-allow') opts.pressAllow = true;
  else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(new URL(import.meta.url)).toString().split('*/')[0]); process.exit(0); }
  else { console.error(`Unknown option ${a}`); process.exit(2); }
}
if (!opts.urls.length) { console.error('Need at least one --url. See --help.'); process.exit(2); }

// ---------- load playwright (local project first, then global) ----------
async function loadPlaywright() {
  for (const name of ['playwright', '@playwright/test']) {
    try { const req = createRequire(path.join(process.cwd(), 'noop.js')); return req(name); } catch {}
  }
  try {
    const root = execSync('npm root -g', { encoding: 'utf8' }).trim();
    const req = createRequire(path.join(root, 'noop.js'));
    return req('playwright');
  } catch {}
  console.error('Playwright not found. Install it: npm i -D playwright  (then: npx playwright install chromium, unless a browser is preinstalled)');
  process.exit(2);
}

// ---------- in-page checks (serialized into the browser) ----------
function pageChecks({ scopeSelector, minFont, minTarget }) {
  const vw = document.documentElement.clientWidth;
  const scope = scopeSelector ? document.querySelector(scopeSelector) : document.body;
  if (!scope) return { error: `scope ${scopeSelector} not found` };
  const LIMIT = 25;
  const sel = (el) => {
    const parts = [];
    let n = el;
    for (let d = 0; n && n.nodeType === 1 && d < 4; d++, n = n.parentElement) {
      let s = n.tagName.toLowerCase();
      if (n.id) { s += '#' + n.id; parts.unshift(s); break; }
      const tid = n.getAttribute('data-testid');
      if (tid) { s += `[data-testid="${tid}"]`; parts.unshift(s); break; }
      const cls = (typeof n.className === 'string' ? n.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 3);
      if (cls.length) s += '.' + cls.join('.');
      parts.unshift(s);
    }
    return parts.join(' > ').slice(0, 220);
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0;
  };
  const text = (el) => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  const directText = (el) => [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim().length);
  const inScrollX = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') return true;
    }
    return false;
  };
  const all = [...scope.querySelectorAll('*')].filter(visible);

  const res = {
    viewport: vw,
    pageOverflow: Math.max(0, document.documentElement.scrollWidth - vw),
    offscreen: [], contentSpill: [], wrappedLabels: [], clippedText: [], smallTargets: [], tinyText: [], unsizedImages: [],
    leakedAbsolute: [], nestedScrollers: [],
    spinners: [], badSpinners: [], cls: Math.round((window.__cls || 0) * 1000) / 1000,
  };
  // Spinners: anything rotating via CSS animation or with animate-spin. Uses the untransformed layout size.
  for (const el of all) {
    const cls = typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '');
    const anims = el.getAnimations ? el.getAnimations() : [];
    const spinning = /\banimate-spin\b/.test(cls) || anims.some((a) => a.playState === 'running' && /spin|rotat/i.test(a.animationName || ''));
    if (!spinning) continue;
    const cs = getComputedStyle(el);
    const w = el.offsetWidth ?? parseFloat(cs.width), h = el.offsetHeight ?? parseFloat(cs.height);
    const info = { el: sel(el), w: Math.round(w * 10) / 10, h: Math.round(h * 10) / 10, round: Math.abs(w - h) <= 1, hasText: text(el).length > 0 };
    res.spinners.push(info);
    if ((!info.round || info.hasText) && res.badSpinners.length < LIMIT) res.badSpinners.push(info);
  }

  for (const el of all) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    // Sticks out of the viewport horizontally, and not because a scroll/clip ancestor contains it
    if ((r.right > vw + 1 || r.left < -1) && cs.position !== 'fixed' && !inScrollX(el) && res.offscreen.length < LIMIT) {
      const kids = [...el.children].some((c) => { const cr = c.getBoundingClientRect(); return cr.right > vw + 1 || cr.left < -1; });
      if (!kids) res.offscreen.push({ el: sel(el), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), text: text(el).slice(0, 60) });
    }
    // Content spills out of a visible-overflow box
    if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && cs.overflowX === 'visible' && !['HTML', 'BODY', 'svg'].includes(el.tagName) && res.contentSpill.length < LIMIT) {
      res.contentSpill.push({ el: sel(el), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, text: text(el).slice(0, 60) });
    }
    // Clipped text without ellipsis
    if (directText(el) && el.scrollWidth > el.clientWidth + 1 && ['hidden', 'clip'].includes(cs.overflowX) && cs.textOverflow !== 'ellipsis' && res.clippedText.length < LIMIT) {
      res.clippedText.push({ el: sel(el), text: text(el).slice(0, 80) });
    }
    // Tiny text
    if (directText(el) && parseFloat(cs.fontSize) < minFont && res.tinyText.length < LIMIT) {
      res.tinyText.push({ el: sel(el), fontSize: cs.fontSize, text: text(el).slice(0, 40) });
    }
    // Scroll containment (responsive-fluid.md §9): absolute/fixed element below the fold anchored to <body> leaks page height
    if (r.bottom > window.innerHeight + 1 && (cs.position === 'absolute' || cs.position === 'fixed') && el.offsetParent === document.body && res.leakedAbsolute.length < LIMIT) {
      res.leakedAbsolute.push({ el: sel(el), position: cs.position, bottom: Math.round(r.bottom), text: text(el).slice(0, 60) });
    }
    // Scroll containment: a vertical scroller that sits inside another vertical scroller (not the document)
    if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1 && res.nestedScrollers.length < LIMIT) {
      let outer = el.parentElement;
      while (outer && outer !== document.documentElement && outer !== document.scrollingElement) {
        const ocs = getComputedStyle(outer);
        if (/(auto|scroll)/.test(ocs.overflowY) && outer.scrollHeight > outer.clientHeight + 1) break;
        outer = outer.parentElement;
      }
      if (outer && outer !== document.documentElement && outer !== document.scrollingElement) {
        res.nestedScrollers.push({ el: sel(el), outer: sel(outer), scrollHeight: el.scrollHeight, clientHeight: el.clientHeight });
      }
    }
  }

  // Short labels that wrapped
  const labelSel = 'button, [role=button], [role=tab], [role=menuitem], th, label, nav a, [class*=badge], [class*=Badge], [class*=chip], [class*=pill], [class*=tag]:not(html)';
  for (const el of scope.querySelectorAll(labelSel)) {
    if (!visible(el)) continue;
    const t = text(el);
    if (!t || t.length > 40) continue;
    const range = document.createRange();
    range.selectNodeContents(el);
    const tops = new Set([...range.getClientRects()].filter((q) => q.width > 0).map((q) => Math.round(q.top / 4)));
    if (tops.size > 1 && res.wrappedLabels.length < LIMIT) res.wrappedLabels.push({ el: sel(el), lines: tops.size, text: t });
  }

  // Small tap targets (inline links inside running text are exempt in WCAG 2.5.8)
  const tapSel = 'a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=tab], [role=checkbox], [role=switch], [role=menuitem], [tabindex]:not([tabindex="-1"])';
  const targets = [...scope.querySelectorAll(tapSel)].filter(visible);
  const rects = targets.map((t) => t.getBoundingClientRect());
  targets.forEach((el, i) => {
    const r = rects[i];
    if (r.width >= minTarget && r.height >= minTarget) return;
    if (el.tagName === 'A' && el.closest('p, li') && directText(el.closest('p, li'))) return;
    if (el.tagName === 'INPUT' && ['checkbox', 'radio'].includes(el.type) && el.closest('label')) return;
    // spacing exception: a minTarget-diameter circle around the centre must not hit another target
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const hits = rects.some((o, j) => j !== i && !targets[j].contains(el) && !el.contains(targets[j]) &&
      Math.max(o.left - cx, 0, cx - o.right) ** 2 + Math.max(o.top - cy, 0, cy - o.bottom) ** 2 < (minTarget / 2) ** 2);
    if (hits && res.smallTargets.length < LIMIT) res.smallTargets.push({ el: sel(el), w: Math.round(r.width), h: Math.round(r.height), name: (el.getAttribute('aria-label') || text(el)).slice(0, 40) });
  });

  for (const img of scope.querySelectorAll('img')) {
    if (!img.hasAttribute('width') && !img.hasAttribute('height') && getComputedStyle(img).aspectRatio === 'auto' && res.unsizedImages.length < LIMIT)
      res.unsizedImages.push({ el: sel(img), src: (img.currentSrc || img.src || '').slice(-80) });
  }
  if (scopeSelector) {
    const r = scope.getBoundingClientRect();
    res.dialogBox = { width: Math.round(r.width), height: Math.round(r.height), fitsWidth: r.left >= 0 && r.right <= vw, fitsHeight: r.top >= 0 && r.bottom <= window.innerHeight };
  }
  return res;
}

// ---------- run ----------
const slug = (s) => s.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 60) || 'page';
const CLS_INIT = () => { window.__cls = 0; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch {} };
const checkArgs = (scopeSelector = null) => ({ scopeSelector, minFont: opts.minFont, minTarget: opts.minTarget });

// Loading state: slow down data requests, screenshot early, classify, then measure the shift when data lands.
async function loadingShot(browser, url, width) {
  const ctx = await browser.newContext({ viewport: { width, height: opts.height }, storageState: opts.storageState || undefined });
  await ctx.addInitScript(CLS_INIT);
  await ctx.route('**/*', async (route) => {
    const t = route.request().resourceType();
    if (t === 'fetch' || t === 'xhr') await new Promise((r) => setTimeout(r, opts.slow));
    route.continue().catch(() => {});
  });
  const page = await ctx.newPage();
  const entry = { width };
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(Math.min(800, opts.slow / 2));
    entry.screenshot = path.join(opts.out, `${slug(url)}-${width}-loading.png`);
    await page.screenshot({ path: entry.screenshot });
    Object.assign(entry, await page.evaluate(() => {
      const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
      const skeletons = [...document.querySelectorAll('[class*=skeleton i], .animate-pulse, [data-skeleton], [data-slot=skeleton]')].filter(vis).length;
      const spinners = [...document.querySelectorAll('*')].filter((el) => vis(el) && ((typeof el.className === 'string' && /\banimate-spin\b/.test(el.className)) || (el.getAnimations?.() || []).some((a) => /spin|rotat/i.test(a.animationName || '')))).length;
      const busy = document.querySelectorAll('[aria-busy=true]').length;
      const textLen = ((document.querySelector('main') || document.body).innerText || '').trim().length;
      const elCount = (document.querySelector('main') || document.body).querySelectorAll('*').length;
      return { skeletons, spinners, busy, textLen, elCount };
    }));
    await settle(page);
    await page.waitForTimeout(300);
    entry.clsAfterData = Math.round((await page.evaluate(() => window.__cls || 0)) * 1000) / 1000;
    entry.textAfter = await page.evaluate(() => ((document.querySelector('main') || document.body).innerText || '').trim().length);
    entry.elAfter = await page.evaluate(() => (document.querySelector('main') || document.body).querySelectorAll('*').length);
    const grew = entry.textAfter - entry.textLen > 5 || entry.elAfter - entry.elCount >= 2;
    entry.kind = entry.skeletons ? 'skeleton' : entry.spinners ? (grew ? '**spinner only**' : 'spinner only')
      : grew ? (entry.textLen < 20 ? '**blank, then content**' : '**nothing for the data, then it pops in**')
      : 'no change seen (data server-rendered or not slowed)';
  } catch (e) { entry.error = e.message.split('\n')[0]; }
  await ctx.close();
  return entry;
}

// Action button pending state: hold the mutation request, check the button while pending.
async function pressCheck(browser, url, width, selector) {
  const ctx = await browser.newContext({ viewport: { width, height: opts.height }, storageState: opts.storageState || undefined });
  let holding = false;
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    if (holding && !['GET', 'HEAD', 'OPTIONS'].includes(req.method()) && req.resourceType() !== 'document') {
      await new Promise((r) => setTimeout(r, opts.slow));
      return opts.pressAllow ? route.continue().catch(() => {}) : route.abort().catch(() => {});
    }
    route.continue().catch(() => {});
  });
  const page = await ctx.newPage();
  const entry = { press: selector, width };
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await settle(page);
    for (const f of opts.fill) { const [fs_, ...v] = f.split('='); await page.locator(fs_).first().fill(v.join('='), { timeout: 3000 }).catch((e) => { entry.fillError = `${fs_}: ${e.message.split('\n')[0]}`; }); }
    const btn = page.locator(selector).first();
    const before = await btn.boundingBox();
    holding = true;
    await btn.click({ timeout: 5000 });
    await page.waitForTimeout(350);
    const during = await btn.boundingBox().catch(() => null);
    entry.state = await btn.evaluate((el) => ({ disabled: !!el.disabled || el.getAttribute('aria-disabled') === 'true', ariaBusy: el.getAttribute('aria-busy') === 'true', text: (el.innerText || '').trim().slice(0, 40) })).catch(() => null);
    const checks = await page.evaluate(pageChecks, checkArgs());
    entry.spinners = checks.spinners; entry.badSpinners = checks.badSpinners;
    if (before && during) entry.sizeChange = { dw: Math.round(during.width - before.width), dh: Math.round(during.height - before.height) };
    const box = during || before;
    if (box) {
      entry.screenshot = path.join(opts.out, `${slug(url)}-${width}-press-${slug(selector)}.png`);
      await page.screenshot({ path: entry.screenshot, clip: { x: Math.max(0, box.x - 40), y: Math.max(0, box.y - 40), width: Math.min(width, box.width + 80), height: box.height + 80 } }).catch(() => {});
    }
    entry.pendingSeen = !!(entry.state?.disabled || entry.state?.ariaBusy || checks.spinners.length);
    if (!entry.pendingSeen) entry.note = 'no pending state seen (validation blocked submit? fill fields with --fill)';
  } catch (e) { entry.error = e.message.split('\n')[0]; }
  holding = false;
  await ctx.close();
  return entry;
}

const DIALOG_SEL = '[role=dialog][data-state=open], [role=alertdialog], [role=dialog]:not([aria-hidden=true]), dialog[open], [data-vaul-drawer][data-state=open], [role=menu], [role=listbox]';

async function settle(page) {
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch {}
  if (opts.waitFor) { try { await page.waitForSelector(opts.waitFor, { timeout: 10000 }); } catch { console.warn(`  ! wait-for ${opts.waitFor} timed out`); } }
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(opts.wait);
}

(async () => {
  const { chromium } = await loadPlaywright();
  fs.mkdirSync(opts.out, { recursive: true });
  const launchOpts = {};
  if (fs.existsSync('/opt/pw-browsers/chromium') && !process.env.PLAYWRIGHT_BROWSERS_PATH) launchOpts.executablePath = '/opt/pw-browsers/chromium';
  let browser;
  try { browser = await chromium.launch(launchOpts); } catch (e) { browser = await chromium.launch(); }
  const report = { createdAt: new Date().toISOString(), options: opts, pages: [] };

  for (const url of opts.urls) {
    const pageReport = { url, widths: [], dialogs: [], loading: [], presses: [] };
    for (const width of opts.widths) {
      const ctx = await browser.newContext({ viewport: { width, height: opts.height }, storageState: opts.storageState || undefined, deviceScaleFactor: 1 });
      if (opts.cookies.length) {
        const u = new URL(url);
        await ctx.addCookies(opts.cookies.map((c) => { const [name, ...rest] = c.split('='); return { name, value: rest.join('='), domain: u.hostname, path: '/' }; }));
      }
      await ctx.addInitScript(CLS_INIT);
      const page = await ctx.newPage();
      const consoleErrors = [], failedRequests = [];
      page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });
      page.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 300)));
      page.on('requestfailed', (r) => failedRequests.push(`${r.failure()?.errorText} ${r.url()}`.slice(0, 200)));
      page.on('response', (r) => { if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`.slice(0, 200)); });
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      } catch (e) {
        pageReport.widths.push({ width, error: `navigation failed: ${e.message}` });
        await ctx.close();
        continue;
      }
      await settle(page);
      const shot = path.join(opts.out, `${slug(url)}-${width}.png`);
      await page.screenshot({ path: shot, fullPage: opts.fullPage });
      const checks = await page.evaluate(pageChecks, checkArgs());
      pageReport.widths.push({ width, screenshot: shot, ...checks, consoleErrors, failedRequests: [...new Set(failedRequests)] });

      if (opts.open.length && opts.openWidths.includes(width)) {
        for (const trigger of opts.open) {
          const entry = { trigger, width };
          try {
            await page.locator(trigger).first().click({ timeout: 5000 });
            await page.waitForTimeout(500);
            const found = await page.$(DIALOG_SEL);
            if (!found) { entry.error = 'no dialog/sheet/menu appeared'; }
            else {
              const dshot = path.join(opts.out, `${slug(url)}-${width}-open-${slug(trigger)}.png`);
              await page.screenshot({ path: dshot });
              entry.screenshot = dshot;
              await found.evaluate((el) => el.setAttribute('data-ui-audit-scope', '1'));
              Object.assign(entry, await page.evaluate(pageChecks, checkArgs('[data-ui-audit-scope]')));
              entry.focusInside = await page.evaluate(() => !!document.activeElement?.closest('[data-ui-audit-scope]'));
              await page.keyboard.press('Escape');
              await page.waitForTimeout(300);
              entry.closedOnEscape = !(await page.$('[data-ui-audit-scope]')) || !(await page.$eval('[data-ui-audit-scope]', (el) => el.getBoundingClientRect().height > 0).catch(() => false));
            }
          } catch (e) { entry.error = e.message.split('\n')[0]; }
          pageReport.dialogs.push(entry);
          await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
          await settle(page);
        }
      }
      await ctx.close();
      if (opts.openWidths.includes(width)) {
        if (opts.loadingShot) pageReport.loading.push(await loadingShot(browser, url, width));
        for (const sel of opts.press) pageReport.presses.push(await pressCheck(browser, url, width, sel));
      }
    }
    report.pages.push(pageReport);
  }
  await browser.close();

  // ---------- summary ----------
  const n = (a) => (a ? a.length : 0);
  let md = `# UI audit — ${report.createdAt}\n\n`;
  for (const p of report.pages) {
    md += `## ${p.url}\n\n| Width | Page overflow | Off-screen | Spill | Wrapped labels | Clipped | Small targets | Tiny text | Unsized img | Bad spinners | Leaked abs | Nested scrollers | CLS | Console errors | Failed req |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
    for (const w of p.widths) {
      if (w.error) { md += `| ${w.width} | ${w.error} |||||||||||\n`; continue; }
      md += `| ${w.width} | ${w.pageOverflow ? `**${w.pageOverflow}px**` : 0} | ${n(w.offscreen)} | ${n(w.contentSpill)} | ${n(w.wrappedLabels)} | ${n(w.clippedText)} | ${n(w.smallTargets)} | ${n(w.tinyText)} | ${n(w.unsizedImages)} | ${n(w.badSpinners)} | ${n(w.leakedAbsolute)} | ${n(w.nestedScrollers)} | ${w.cls > 0.1 ? `**${w.cls}**` : w.cls} | ${n(w.consoleErrors)} | ${n(w.failedRequests)} |\n`;
    }
    const details = (key, label) => {
      const seen = new Map();
      for (const w of p.widths) for (const item of w[key] || []) {
        const k = typeof item === 'string' ? item : item.el + '|' + (item.text || item.name || '');
        if (!seen.has(k)) seen.set(k, { item, widths: [] });
        if (!seen.get(k).widths.includes(w.width)) seen.get(k).widths.push(w.width);
      }
      if (!seen.size) return '';
      let s = `\n### ${label}\n`;
      for (const { item, widths } of [...seen.values()].slice(0, 30)) s += `- @${widths.join(',')}: ${typeof item === 'string' ? item : JSON.stringify(item)}\n`;
      return s;
    };
    md += details('offscreen', 'Elements outside the viewport') + details('contentSpill', 'Content spilling out of its box') +
      details('wrappedLabels', 'Short labels that wrapped') + details('clippedText', 'Text clipped without ellipsis') +
      details('smallTargets', `Tap targets under ${opts.minTarget}px`) + details('tinyText', `Text under ${opts.minFont}px`) +
      details('unsizedImages', 'Images without size') + details('badSpinners', 'Spinners not round or spinning with text') +
      details('leakedAbsolute', 'Absolute/fixed elements below the fold anchored to body (phantom scroll, LAY-11)') + details('nestedScrollers', 'Vertical scroller inside another vertical scroller (LAY-12)') + details('consoleErrors', 'Console errors') + details('failedRequests', 'Failed requests');
    if (p.dialogs.length) {
      md += `\n### Dialogs / sheets / menus\n| Trigger | Width | Fits W | Fits H | Focus inside | Esc closes | Overflow issues | Wrapped | Small targets | Note |\n|---|---|---|---|---|---|---|---|---|---|\n`;
      for (const d of p.dialogs) {
        md += `| \`${d.trigger}\` | ${d.width} | ${d.dialogBox?.fitsWidth ?? '-'} | ${d.dialogBox?.fitsHeight ?? '-'} | ${d.focusInside ?? '-'} | ${d.closedOnEscape ?? '-'} | ${n(d.offscreen) + n(d.contentSpill)} | ${n(d.wrappedLabels)} | ${n(d.smallTargets)} | ${d.error || ''} |\n`;
      }
    }
    if (p.loading.length) {
      md += `\n### Loading state (data requests held ${opts.slow}ms)\n| Width | Shows | Skeletons | Spinners | aria-busy | CLS when data lands | Note |\n|---|---|---|---|---|---|---|\n`;
      for (const l of p.loading) md += `| ${l.width} | ${l.kind ?? '-'} | ${l.skeletons ?? '-'} | ${l.spinners ?? '-'} | ${l.busy ?? '-'} | ${l.clsAfterData > 0.1 ? `**${l.clsAfterData}**` : l.clsAfterData ?? '-'} | ${l.error || ''} |\n`;
    }
    if (p.presses.length) {
      md += `\n### Action buttons while pending\n| Button | Width | Pending seen | Disabled | aria-busy | Size change | Spinners | Not round / with text | Note |\n|---|---|---|---|---|---|---|---|---|\n`;
      for (const b of p.presses) {
        const sc = b.sizeChange ? `${b.sizeChange.dw}×${b.sizeChange.dh}px` : '-';
        md += `| \`${b.press}\` | ${b.width} | ${b.pendingSeen ?? '-'} | ${b.state?.disabled ?? '-'} | ${b.state?.ariaBusy ?? '-'} | ${sc === '0×0px' ? '0' : `**${sc}**`} | ${n(b.spinners)} | ${n(b.badSpinners) ? `**${b.badSpinners.map((x) => `${x.w}×${x.h}${x.hasText ? ' +text' : ''}`).join(', ')}**` : 0} | ${b.error || b.note || b.fillError || ''} |\n`;
      }
    }
    md += '\n';
  }
  md += `Screenshots and full JSON in ${opts.out}. Numbers find bugs; look at the screenshots to find awkward layouts.\n`;
  fs.writeFileSync(path.join(opts.out, 'report.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(opts.out, 'summary.md'), md);
  console.log(md);
})().catch((e) => { console.error(e); process.exit(1); });
