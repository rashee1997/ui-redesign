#!/usr/bin/env node
/**
 * scan_patterns.mjs — static scan of source code for the patterns this skill fixes.
 * Heuristic: it points at places to look, it doesn't prove bugs. Read each hit before acting.
 *
 * Finds:
 *   - spinners and spinner risks (oval/squashed: missing shrink-0, missing size, inline border spinner,
 *     animate-spin on an element that also holds text)
 *   - loading branches with no skeleton (return null / bare "Loading..." / whole-page spinner)
 *   - Skeleton usage
 *   - pagination components, client-side slicing, and list queries that may have no limit
 *   - submit/action buttons without a disabled/loading prop
 *   - consistency counts: Button variants and sizes, raw hex colors, arbitrary Tailwind values,
 *     date-format methods, spinner kinds
 *
 * Usage:
 *   node scan_patterns.mjs                       # scan ./src ./app ./components ./lib ./server ./pages (those that exist)
 *   node scan_patterns.mjs --path app/(dash)/invoices --path components/invoices   # scope to the surface
 *   node scan_patterns.mjs --out .ui-audit/scan.md
 */
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opts = { paths: [], out: null, max: 40 };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--path') opts.paths.push(argv[++i]);
  else if (a === '--out') opts.out = argv[++i];
  else if (a === '--max') opts.max = Number(argv[++i]);
  else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(new URL(import.meta.url)).toString().split('*/')[0]); process.exit(0); }
  else { console.error(`Unknown option ${a}`); process.exit(2); }
}
if (!opts.paths.length) opts.paths = ['src', 'app', 'components', 'lib', 'server', 'pages', 'features', 'modules'].filter((p) => fs.existsSync(p));
if (!opts.paths.length) opts.paths = ['.'];

const SKIP = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'coverage', '.turbo', 'out', '.ui-audit']);
const EXT = /\.(tsx?|jsx?|mjs|vue|svelte|astro)$/;
const files = [];
const walk = (p) => {
  let st; try { st = fs.statSync(p); } catch { return; }
  if (st.isDirectory()) { if (!SKIP.has(path.basename(p))) for (const f of fs.readdirSync(p)) walk(path.join(p, f)); }
  else if (EXT.test(p) && !/\.(test|spec|stories)\./.test(p)) files.push(p);
};
opts.paths.forEach(walk);

const hits = {}; const counts = {};
const add = (key, file, line, text) => { (hits[key] ||= []).push(`${file}:${line}  ${text.trim().slice(0, 140)}`); };
const count = (key, val) => { (counts[key] ||= {}); counts[key][val] = (counts[key][val] || 0) + 1; };

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const lines = src.split('\n');
  const near = (i, n) => lines.slice(i, i + n).join('\n');
  const offsets = []; { let o = 0; for (const l of lines) { offsets.push(o); o += l.length + 1; } }

  lines.forEach((l, i) => {
    const ln = i + 1;
    // ---- spinners ----
    if (/animate-spin|Loader2|LoaderCircle|<Spinner\b|CircularProgress|\bspinner\b/i.test(l)) {
      const kind = (l.match(/Loader2|LoaderCircle|<Spinner\b|CircularProgress/) || [/rounded-full[^"'`]*border/.test(l) ? 'border ring + animate-spin' : /animate-spin/.test(l) ? 'animate-spin (other)' : 'spinner class'])[0].replace('<', '');
      count('Spinner kinds', kind);
      add('Spinners (all)', file, ln, l);
      if (/animate-spin/.test(l)) {
        const cls = (l.match(/class(Name)?=\{?["'`]([^"'`]*animate-spin[^"'`]*)/) || [])[2] || l;
        const risks = [];
        if (!/shrink-0|flex-none/.test(cls)) risks.push('no shrink-0');
        if (!/\bsize-|\b(h-\S+)[\s\S]*\b(w-\S+)|\b(w-\S+)[\s\S]*\b(h-\S+)/.test(cls)) risks.push('width+height not both set');
        if (/<span\b/.test(l) && /rounded-full/.test(cls) && /border/.test(cls) && !/\b(inline-block|block|inline-flex|flex)\b/.test(cls)) risks.push('inline span border spinner (size ignored)');
        if (/<(div|span|button|Button|p)\b[^>]*animate-spin[^>]*>[^<{]*[A-Za-z]{3,}/.test(l)) risks.push('spinning element also contains text');
        if (/\b(scale|translate|rotate)-/.test(cls)) risks.push('other transforms on spinning element');
        if (risks.length) add('Spinner risks (oval / wobble)', file, ln, `[${risks.join(', ')}] ${l}`);
      }
    }
    // ---- loading without skeleton ----
    if (/(isLoading|isPending|loading|status\s*===\s*['"]pending['"])\s*\)?\s*(\)|&&|\?)?\s*return\s+null/.test(l) || /if\s*\(\s*!?\s*(isLoading|loading)\s*\)\s*return\s+null/.test(l))
      add('Loading branch renders nothing', file, ln, l);
    if (/['">]\s*Loading(\.\.\.|…)?\s*['"<]/.test(l)) add('Bare "Loading..." text', file, ln, l);
    if (/if\s*\(\s*(isLoading|loading|!data)\s*\)\s*return\s*<\s*(Spinner|Loader|Loading)/.test(l)) add('Whole view replaced by spinner', file, ln, l);
    if (/<Skeleton\b|animate-pulse|skeleton/i.test(l)) count('Skeleton usage', file);

    // ---- pagination ----
    if (/\b(Pagination|Paginator|Pager|PageNav|usePagination|getPaginationRowModel)\b/.test(l)) { add('Pagination components / hooks', file, ln, l); count('Pagination impls', (l.match(/\b(Pagination\w*|Paginator|Pager|PageNav|usePagination|getPaginationRowModel)\b/) || [''])[0]); }
    if (/\.slice\(\s*\(?\s*\w*page\w*/i.test(l) || /\.slice\([^)]*(pageSize|perPage|PAGE_SIZE)/i.test(l)) add('Client-side page slicing', file, ln, l);
    if (/\.findMany\(/.test(l) && !/take\s*:/.test(near(i, 15))) add('Possibly unbounded query (findMany without take)', file, ln, l);
    if (/db\s*\.\s*select\([^)]*\)\s*\.from\(/.test(l) || /\.select\(\)\s*$/.test(l) && /\.from\(/.test(near(i, 2))) {
      const chunk = near(i, 10);
      if (!/\.limit\(|\.where\([^)]*eq\([^)]*\.id\b|\.then\(\s*\(?\s*\w*\s*\)?\s*=>\s*\w+\[0\]|\[0\]/.test(chunk)) add('Possibly unbounded query (select without limit)', file, ln, l);
    }
    if (/supabase[\s\S]*\.from\(/.test(l) && /\.select\(/.test(near(i, 4)) && !/\.(range|limit|single|maybeSingle)\(/.test(near(i, 10))) add('Possibly unbounded query (supabase select without range/limit)', file, ln, l);

    // ---- action buttons ----
    if (/<Button\b|<button\b/.test(l)) {
      const tag = src.slice(offsets[i], offsets[i] + 1200).match(/<[Bb]utton\b[\s\S]*?>/)?.[0] || l;
      if (/type=["']submit["']/.test(tag) && !/disabled|loading|isPending|isSubmitting|pending/.test(tag)) add('Submit button without disabled/loading', file, ln, tag.replace(/\s+/g, ' '));
      const v = tag.match(/variant=["'{]+([\w-]+)/); count('Button variants', v ? v[1] : '(default)');
      const s = tag.match(/size=["'{]+([\w-]+)/); count('Button sizes', s ? s[1] : '(default)');
    }
    // ---- consistency signals ----
    for (const m of l.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) if (/class|style|color|bg|fill|stroke/i.test(l) && !/^\s*(\/\/|\*)/.test(l)) { add('Raw hex colors', file, ln, l); count('Raw hex values', m[0].toLowerCase()); break; }
    if (/className=[^>]*\b[a-z-]+-\[[^\]]+\]/.test(l)) add('Arbitrary Tailwind values', file, ln, l);
    for (const m of l.matchAll(/\b(toLocaleDateString|toLocaleString|toISOString|Intl\.DateTimeFormat|formatDistance\w*|format\(|dayjs\(|moment\()/g)) count('Date formatting methods', m[1]);
  });
}

// ---------- report ----------
let md = `# Pattern scan\n\nScanned ${files.length} files in: ${opts.paths.join(', ')}\nHeuristic hits — read each one before acting.\n`;
const order = ['Spinner risks (oval / wobble)', 'Submit button without disabled/loading', 'Loading branch renders nothing', 'Whole view replaced by spinner', 'Bare "Loading..." text',
  'Possibly unbounded query (findMany without take)', 'Possibly unbounded query (select without limit)', 'Possibly unbounded query (supabase select without range/limit)',
  'Client-side page slicing', 'Pagination components / hooks', 'Raw hex colors', 'Arbitrary Tailwind values', 'Spinners (all)'];
for (const k of order) {
  const h = hits[k]; if (!h) continue;
  md += `\n## ${k} (${h.length})\n` + h.slice(0, opts.max).map((x) => `- ${x}`).join('\n') + (h.length > opts.max ? `\n- … ${h.length - opts.max} more` : '') + '\n';
}
md += `\n## Counts (consistency)\n`;
for (const [k, obj] of Object.entries(counts)) {
  const rows = Object.entries(obj).sort((a, b) => b[1] - a[1]);
  md += `\n**${k}** (${rows.length} distinct): ` + rows.slice(0, 15).map(([v, c]) => `${v} ×${c}`).join(', ') + '\n';
}
md += `\nMore than one spinner kind, pagination impl, or date method = a consistency finding. No Skeleton usage in a data-heavy surface = a missing-skeleton finding.\n`;
if (opts.out) { fs.mkdirSync(path.dirname(opts.out), { recursive: true }); fs.writeFileSync(opts.out, md); }
console.log(md);
