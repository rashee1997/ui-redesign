#!/usr/bin/env node
/**
 * verify_ledger.mjs - mechanical gate checker. The agent's claims are only believed when this passes.
 *
 * It re-opens the real source files and checks the ledger's evidence against them, so a hallucinated
 * "PASS", a fake quote, a wrong line number, an omitted rule or a false "N/A" fails here, not in review.
 *
 * Usage (run from the repo root; <surface> = .ui-audit/<slug>):
 *   node verify_ledger.mjs init  <surface> [--categories LAY,RSP] [--force]   # skeleton 04-coverage/ with every rule ID, in order
 *   node verify_ledger.mjs check <surface> --gate g1 [--categories ...] [--sample 8]
 *   node verify_ledger.mjs check <surface> --gate g2
 *   node verify_ledger.mjs check <surface> --gate g5
 * Options: --root <dir> (repo root, default cwd) --catalog <file> (default ../references/rule-catalog.md)
 *
 * Evidence grammar (coverage rows, last cell):
 *   VIOLATION  F-001[, F-002]               every F-id must exist in 03-findings.md with this rule ID
 *   PASS       path:line "verbatim code"     the quote must appear within +-5 lines of that line
 *   N/A        grep:/regex/ reason (>=15ch)  the regex is run over every inventory file; any hit fails
 * Exit code 0 = pass, 1 = fail. Output ends with a stamp line to paste at the gate.
 */
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SECTIONS = [
  ['01-layout-hierarchy', 'Layout & hierarchy', ['LAY', 'HIE', 'RSP', 'DLG', 'FLW']],
  ['02-states-data', 'States & data', ['STA', 'LDG', 'PAG', 'TAB']],
  ['03-forms-actions', 'Forms & actions', ['MUT', 'FRM', 'UPL', 'ERR', 'NOT']],
  ['04-engineering-a11y', 'Engineering & a11y', ['HOOK', 'A11Y', 'NAV', 'PERF']],
  ['05-craft-copy', 'Craft, copy & platform', ['CON', 'CPY', 'SLOP', 'MOT', 'SOUL', 'HUM', 'I18N', 'THM', 'AI']],
];
const WINDOW = 5;
const MIN_QUOTE = 6;
const MIN_REASON = 15;
const MAX_ERRORS = 40;
const MAX_REUSE = 4;
const STATUSES = ['VIOLATION', 'PASS', 'N/A'];
const FINDING_STATUSES = ['open', 'fixed', 'deferred', 'rejected'];

const [cmd, surfaceArg, ...rest] = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? fallback : (rest[i + 1] ?? true);
};
const surface = path.resolve(surfaceArg ?? '.');
const root = path.resolve(flag('root', process.cwd()));
const catalogPath = path.resolve(flag('catalog', path.join(HERE, '..', 'references', 'rule-catalog.md')));
const only = flag('categories') ? String(flag('categories')).split(',').map((s) => s.trim().toUpperCase()) : null;
const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
const fileCache = new Map();
function sourceLines(rel) {
  if (!fileCache.has(rel)) {
    const text = read(rel === 'PLAN.md' ? path.join(surface, rel) : path.resolve(root, rel));
    fileCache.set(rel, text === null ? null : text.split(/\r?\n/));
  }
  return fileCache.get(rel);
}

function parseCatalog() {
  const rules = [];
  let cat = null;
  for (const line of fs.readFileSync(catalogPath, 'utf8').split(/\r?\n/)) {
    const h = line.match(/^## ([A-Z0-9]+) - /);
    if (h) cat = h[1];
    const r = line.match(/^- ([A-Z0-9]+-\d{2}) (.*)$/);
    if (r && cat && !/\(retired\b/.test(r[2])) rules.push({ id: r[1], cat, summary: r[2] });
  }
  return rules;
}

function sectionRules(rules, cats) {
  return rules.filter((r) => cats.includes(r.cat) && (!only || only.includes(r.cat)));
}

function tableRows(text) {
  return text
    .split(/\r?\n/)
    .filter((l) => l.trim().startsWith('|') && !/^\|\s*-{2,}/.test(l.trim()) && !/^\|[\s|:-]+$/.test(l.trim()))
    .map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
}

/** Does `quote` appear within +-WINDOW lines of `line` in `rel`? Returns an error string or null. */
function quoteError(rel, line, quote) {
  const lines = sourceLines(rel);
  if (!lines) return `file not found: ${rel}`;
  if (line < 1 || line > lines.length) return `${rel}:${line} is outside the file (${lines.length} lines)`;
  const from = Math.max(0, line - 1 - WINDOW);
  const near = norm(lines.slice(from, line + WINDOW).join(' '));
  return near.includes(norm(quote)) ? null : `quote not found within ${WINDOW} lines of ${rel}:${line} -> "${quote}"`;
}

const LOC = /([\w@./()[\]\\-]+\.[A-Za-z0-9]+):(\d+)/;
const quoted = (cell) => {
  const q = cell.match(/"(.+)"/s) ?? cell.match(/`([^`]{3,})`/);
  return q ? q[1] : null;
};

function parseFindings() {
  const text = read(path.join(surface, '03-findings.md'));
  if (text === null) return fail('03-findings.md missing'), new Map();
  const map = new Map();
  for (const c of tableRows(text)) {
    if (!/^F-\d+$/.test(c[0])) continue;
    map.set(c[0], { rule: c[1], where: c[2], problem: c[3], fix: c[4], sev: c[5], status: (c[6] ?? '').toLowerCase() });
  }
  return map;
}

function parseInventory() {
  const text = read(path.join(surface, '02-inventory.md'));
  if (text === null) return fail('02-inventory.md missing'), [];
  const files = [];
  for (const c of tableRows(text)) {
    const p = c[0].replace(/`/g, '').replace(/:\d+$/, '');
    if (!/\.[A-Za-z0-9]+$/.test(p) || /^file$/i.test(p)) continue;
    if (!c.join(' ').includes('✔')) fail(`inventory: ${p} is not marked Read ✔`);
    if (!fs.existsSync(path.resolve(root, p))) fail(`inventory: ${p} does not exist under ${root}`);
    else files.push(p);
  }
  if (!files.length) fail('inventory: no file rows found (first cell must be the file path)');
  return files;
}

function checkFindings(findings, rules, gate) {
  const ids = new Set(rules.map((r) => r.id));
  for (const [id, f] of findings) {
    if (!ids.has(f.rule) && !/^DM-\d+$/.test(f.rule)) fail(`${id}: rule ${f.rule} is not in the catalog`);
    if (!FINDING_STATUSES.includes(f.status)) fail(`${id}: status "${f.status}" must be one of ${FINDING_STATUSES.join('/')}`);
    if (f.status !== 'rejected' && gate === 'g1' && !/^P[0-3]$/.test(f.sev)) fail(`${id}: severity not rated (P0-P3)`);
    const locs = [...f.where.matchAll(new RegExp(LOC, 'g'))];
    const q = quoted(f.problem);
    if (!locs.length) fail(`${id}: Where has no path:line`);
    else if (!q) fail(`${id}: Problem has no quoted code ("..." or backticks)`);
    else if (gate === 'g1' || f.status === 'open') {
      const hit = locs.some((m) => !quoteError(m[1], Number(m[2]), q));
      if (!hit) fail(`${id}: ${quoteError(locs[0][1], Number(locs[0][2]), q)}`);
    }
  }
}

function checkCoverage(rules, findings, inventory) {
  const used = new Map();
  const sectionIds = [];
  for (const [file, title, cats] of SECTIONS) {
    const expected = sectionRules(rules, cats);
    if (!expected.length) continue;
    const text = read(path.join(surface, '04-coverage', `${file}.md`));
    if (text === null) {
      fail(`04-coverage/${file}.md missing (run: init)`);
      continue;
    }
    const by = text.match(/^Audited by:\s*(.*)$/m);
    if (!by || !by[1].trim() || /^TODO/i.test(by[1].trim())) fail(`${file}: missing "Audited by: <agent/model or lead>; files read: <paths>" line`);
    const rows = tableRows(text).filter((c) => /^[A-Z0-9]+-\d{2}$/.test(c[0]));
    const got = rows.map((c) => c[0]);
    const i = expected.findIndex((r, k) => got[k] !== r.id);
    if (i !== -1) {
      const missing = expected.filter((r) => !got.includes(r.id)).map((r) => r.id);
      const dupes = got.filter((g, k) => got.indexOf(g) !== k);
      fail(`${file}: first mismatch at row ${i + 1}: expected ${expected[i].id}, found ${got[i] ?? 'end of file'}; missing [${missing.join(', ')}] duplicated [${dupes.join(', ')}]`);
    }
    const byId = new Map(rows.map((c) => [c[0], c]));
    for (const r of expected) {
      const c = byId.get(r.id);
      if (c) sectionIds.push(rowCheck(r.id, c, findings, inventory, used));
    }
  }
  for (const [id, f] of findings) {
    if (f.status === 'rejected' || !/^[A-Z0-9]+-\d{2}$/.test(f.rule)) continue;
    const row = sectionIds.find((s) => s.id === f.rule);
    if (row && row.status !== 'VIOLATION') fail(`${id} cites ${f.rule} but coverage marks it ${row.status}`);
  }
  for (const [key, n] of used) if (n > MAX_REUSE) fail(`${key} is cited as proof for ${n} rules (max ${MAX_REUSE}) - rubber-stamping; cite the code that satisfies each rule`);
  return sectionIds;
}

function rowCheck(id, c, findings, inventory, used) {
  const status = (c[2] ?? '').toUpperCase();
  const ev = c.slice(3).join(' | ');
  const out = { id, status, ev };
  if (!STATUSES.includes(status)) return fail(`${id}: status "${c[2]}" must be VIOLATION, PASS or N/A (TODO is not a status)`), out;
  if (status === 'VIOLATION') {
    const refs = ev.match(/F-\d+/g);
    if (!refs) fail(`${id}: VIOLATION without an F-id`);
    for (const f of refs ?? []) {
      if (!findings.has(f)) fail(`${id}: ${f} is not in 03-findings.md`);
      else if (findings.get(f).rule !== id) fail(`${id}: ${f} is filed under ${findings.get(f).rule}`);
    }
  } else if (status === 'PASS') {
    const loc = ev.match(LOC);
    const q = quoted(ev);
    if (!loc || !q) fail(`${id}: PASS needs path:line plus a "verbatim quote"`);
    else if (q.length < MIN_QUOTE) fail(`${id}: PASS quote is too short to prove anything ("${q}")`);
    else {
      const e = quoteError(loc[1], Number(loc[2]), q);
      if (e) fail(`${id}: ${e}`);
      used.set(`${loc[0]}`, (used.get(`${loc[0]}`) ?? 0) + 1);
    }
  } else {
    const g = ev.match(/grep:\/(.+?)\/(?:\s|$)/);
    const reason = ev.replace(/grep:\/.+?\//, '').trim();
    if (!g) fail(`${id}: N/A needs grep:/regex/ proving the mechanism is absent`);
    else if (reason.length < MIN_REASON) fail(`${id}: N/A reason is shorter than ${MIN_REASON} characters`);
    else {
      let re;
      try {
        re = new RegExp(g[1], 'i');
      } catch {
        return fail(`${id}: N/A regex does not compile: ${g[1]}`), out;
      }
      for (const f of inventory) {
        const hit = (sourceLines(f) ?? []).findIndex((l) => re.test(l));
        if (hit !== -1) {
          fail(`${id}: N/A is false - /${g[1]}/ matches ${f}:${hit + 1}`);
          break;
        }
      }
    }
  }
  return out;
}

function init() {
  const rules = parseCatalog();
  const dir = path.join(surface, '04-coverage');
  fs.mkdirSync(dir, { recursive: true });
  let written = 0;
  for (const [file, title, cats] of SECTIONS) {
    const list = sectionRules(rules, cats);
    const target = path.join(dir, `${file}.md`);
    if (!list.length || (fs.existsSync(target) && !flag('force'))) continue;
    const out = [`# 04-coverage - ${path.basename(surface)} - ${title} (every rule ID in catalog order)`, '', 'Audited by: TODO', ''];
    for (const cat of cats.filter((c) => list.some((r) => r.cat === c))) {
      out.push(`### ${cat}`, '| Rule ID | Rule summary | Status | Evidence |', '|---|---|---|---|');
      for (const r of list.filter((x) => x.cat === cat)) out.push(`| ${r.id} | ${r.summary.slice(0, 90).replace(/\|/g, '/')} | TODO | |`);
      out.push('');
    }
    fs.writeFileSync(target, out.join('\n'));
    written++;
  }
  console.log(`init: ${written} section file(s) in ${dir}; ${rules.length} rules in catalog. Replace every TODO, then run check --gate g1.`);
}

function g1() {
  const rules = parseCatalog();
  const inventory = parseInventory();
  for (const f of ['00-scope.md', '01-design.md']) if (read(path.join(surface, f)) === null) fail(`${f} missing`);
  const findings = parseFindings();
  checkFindings(findings, rules, 'g1');
  const rows = checkCoverage(rules, findings, inventory);
  const count = (s) => rows.filter((r) => r.status === s).length;
  const sample = rows.filter((r) => r.status === 'PASS');
  const seed = crypto.createHash('sha1').update(sample.map((r) => r.ev).join('')).digest().readUInt32LE(0);
  const rank = (r) => crypto.createHash("sha1").update(seed + r.id).digest().readUInt32LE(0);
  const picks = sample.sort((a, b) => rank(a) - rank(b)).slice(0, Number(flag('sample', 8)));
  const stamp = `Gate G1 script: ${errors.length ? 'FAIL' : 'PASS'} - ${inventory.length} files, ${rows.length} rules (${count('VIOLATION')} violation, ${count('PASS')} pass, ${count('N/A')} n/a), ${findings.size} findings, ${errors.length} errors`;
  if (!errors.length) {
    fs.writeFileSync(path.join(surface, '04-coverage', '00-summary.md'), `# 04-coverage summary\n\n${stamp}\n\nCatalog sha1: ${crypto.createHash('sha1').update(read(catalogPath)).digest('hex').slice(0, 12)}\n`);
    console.log('\nSPOT-CHECK (an independent verifier re-reads these cited lines and judges whether each really satisfies its rule):');
    for (const p of picks) console.log(`  ${p.id}  ${p.ev}`);
  }
  return stamp;
}

function g2() {
  const plan = read(path.join(surface, 'PLAN.md'));
  if (plan === null) return fail('PLAN.md missing'), 'Gate G2 script: FAIL';
  const findings = parseFindings();
  const inventory = parseInventory();
  for (const [id, f] of findings) if (f.status !== 'rejected' && !plan.includes(id)) fail(`${id} is not placed in PLAN.md (slice or Deferred)`);
  if (!/##\s*4b/i.test(plan)) fail('PLAN.md has no section 4b (flow tables or "N/A: single-screen, no state change")');
  if (!/Chosen direction:/i.test(plan)) fail('PLAN.md has no "Chosen direction:" line');
  if (!/Revision log/i.test(plan)) fail('PLAN.md has no Revision log');
  const dir = path.join(surface, 'concepts');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter((f) => /\.(html|css|js)$/.test(f)) : [];
  if (!files.includes('index.html')) fail('concepts/index.html missing');
  if (fs.existsSync(dir) && fs.readdirSync(dir).some((f) => /^concept-[b-z]/.test(f))) fail('more than one concept found: keep exactly one (tweak it in place)');
  const inv = new Set(inventory);
  for (const f of files) {
    const text = read(path.join(dir, f)) ?? '';
    for (const lit of new Set(text.match(/#[0-9a-fA-F]{3,8}\b|(?:rgb|hsl|oklch)a?\([^)]*\)/g) ?? [])) {
      if (!plan.toLowerCase().includes(lit.toLowerCase())) fail(`concepts/${f}: ${lit} is not in the PLAN.md token ledger`);
    }
    for (const bad of text.match(/Lorem ipsum|User \d\b|Test Item|Acme/gi) ?? []) if (!plan.includes(bad)) fail(`concepts/${f}: filler "${bad}"`);
    if (!f.endsWith('.html')) continue;
    for (const m of text.matchAll(/data-trace="([^"]+)"/g)) {
      const loc = m[1].match(LOC);
      if (!loc || !inv.has(loc[1])) fail(`concepts/${f}: data-trace "${m[1]}" is not an inventory file:line`);
    }
    for (const m of text.matchAll(/<(\w+)[^>]*data-copy="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)) {
      const loc = m[2].match(LOC);
      const e = loc ? quoteError(loc[1], Number(loc[2]), m[3].replace(/<[^>]+>/g, '')) : `bad data-copy "${m[2]}"`;
      if (e) fail(`concepts/${f}: ${e}`);
    }
    if (f === 'index.html' && !/data-trace=/.test(text)) fail('concepts/index.html has no data-trace blocks');
  }
  return `Gate G2 script: ${errors.length ? 'FAIL' : 'PASS'} - ${findings.size} findings placed, ${files.length} concept file(s), ${errors.length} errors`;
}

function g5() {
  const findings = parseFindings();
  const verify = read(path.join(surface, '06-verify.md'));
  const progress = read(path.join(surface, '05-progress.md'));
  if (verify === null) fail('06-verify.md missing');
  if (progress === null) fail('05-progress.md missing');
  for (const [id, f] of findings) {
    if (f.status === 'open') fail(`${id} is still open`);
    if (f.status !== 'fixed' || verify === null) continue;
    const row = tableRows(verify).find((c) => c[0] === id) ?? [];
    const ev = row.slice(1).join(' | ');
    const loc = ev.match(LOC);
    const q = quoted(ev);
    if (!loc || !q) fail(`${id}: fixed but 06-verify.md has no path:line plus "quote of the NEW code"`);
    else if (quoteError(loc[1], Number(loc[2]), q)) fail(`${id}: ${quoteError(loc[1], Number(loc[2]), q)}`);
    const old = quoted(f.problem);
    const where = f.where.match(LOC);
    if (old && where && !quoteError(where[1], Number(where[2]), old) && !/still-present-ok:/.test(ev)) {
      fail(`${id}: marked fixed but the original evidence "${old}" is still at ${where[0]} (add "still-present-ok: reason" if intentional)`);
    }
  }
  for (const word of ['typecheck', 'lint']) if (verify && !new RegExp(word, 'i').test(verify)) fail(`06-verify.md has no ${word} output`);
  for (const block of (progress ?? '').split(/^## /m).slice(1)) {
    const sha = block.match(/\b[0-9a-f]{7,40}\b/);
    let ok = false;
    try {
      if (sha) execFileSync('git', ['-C', root, 'cat-file', '-e', `${sha[0]}^{commit}`], { stdio: 'ignore' }), (ok = true);
    } catch { /* unknown commit */ }
    if (!ok) fail(`05-progress.md: slice "${block.split('\n')[0].slice(0, 40)}" has no commit SHA that git knows`);
  }
  return `Gate G5 script: ${errors.length ? 'FAIL' : 'PASS'} - ${findings.size} findings, ${errors.length} errors`;
}

if (cmd === 'init') init();
else if (cmd === 'check') {
  const gate = String(flag('gate', 'g1')).toLowerCase();
  const run = { g1, g2, g5 }[gate];
  if (!run) (console.error('--gate must be g1, g2 or g5'), process.exit(2));
  const stamp = run();
  warnings.forEach((w) => console.log(`warn: ${w}`));
  errors.slice(0, MAX_ERRORS).forEach((e) => console.log(`FAIL: ${e}`));
  if (errors.length > MAX_ERRORS) console.log(`... and ${errors.length - MAX_ERRORS} more`);
  console.log(`\n${stamp}`);
  process.exit(errors.length ? 1 : 0);
} else {
  console.error('usage: verify_ledger.mjs init|check <surface> [--gate g1|g2|g5] [--root dir] [--categories A,B]');
  process.exit(2);
}
