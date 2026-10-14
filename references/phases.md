# Phases in detail

The short version is in SKILL.md; the enforcement (files, gates) is in harness.md. This file is the how-to for each phase. FOCUSED mode runs the same phases, limited to the categories mapped in `00-scope.md`.

**Antislop skills integration**: Always load and apply the `antislop` skills family (`antislop`, `antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, `antislop-code`) if available in the environment; otherwise skip gracefully.

## Contents
1. Research
2. Plan
3. Approval
4. Implement
5. Verify
6. Key design rules (quick reference)

## 1. Research

**1a. Design language, archetype & external domain research** → `01-design.md`.
- **Project DESIGN.md**: Find the project's DESIGN.md (any casing or folder; in a monorepo, the closest one to the page) and read all of it plus what it links to. Build the digest by topic with section references, list Gaps, list conflicts (design-md.md). Map each rule to its code name (CSS var, Tailwind class, primitive). Sample 2-3 of the app's best pages to see how the language is applied. Only these tokens and primitives may be used later.
- **App Archetype & Audience Discovery**: Classify the app type: B2B SaaS, internal operations cockpit, high-density compliance workbench, developer tool, or consumer app. Define the target audience persona, cognitive environment, scan frequency, time pressure, and density tolerance.
- **Mandatory External Domain Research**: Run external research using available tools (`search_web`, docs search, competitive benchmarks) to investigate top-tier market standards for the domain (e.g. Stripe for billing, Linear for developer tools, Veeva/TrackWise for compliance, Retool/Palantir for internal operations). Document domain-specific interaction patterns, table behaviors, and workflow conventions in `01-design.md`. Never design blindly.

**1b. Surface** → `02-inventory.md`. Trace from the route entry through the render tree, everything it opens (dialogs, sheets, menus, toasts, confirms), the data it reads (down to the query/API) and writes (down to the handler), shared state, and styles (static-audit.md §2). This is the familiarization pass: move through the surface as a user first, without judging. For > ~15 files, read groups with read-only subagents that return findings in the ledger format; you still own the ledger.

**1c. The job & the flow.** List what users come here to do, in priority order, and name the single primary action. Then map each state-changing job as a flow: ordered steps and transitions with, per step, what validates and where a failure lands (user-flow.md §1). This list, synthesized with the researched app archetype and audience mental model (not the current DOM order or database schema), decides which states exist, the visual hierarchy, and the structure. For new features: define the mental model first (Sweller/Miller 3-4 chunks) before touching code. If no primary action can be named, that's the first finding (HIE-01).

**1d. Static audit** → `03-findings.md`. Second pass: violations only. Read every inventory file fully (or inspect the proposed new feature specs/files) and run the per-file pass, then the cross-file passes, then the grep recipes (static-audit.md). Check DESIGN.md rules first (each violation cites the rule as `DM-n`), then evaluate **every rule in the catalog in strict sequential order from LAY-01 through AI-06 (including FLW-01..04, TAB-01..07, UPL-01..06, NOT-01..05, and NAV-11..12)**. For new feature UI implementations: verify that the proposed design violates zero rules from the catalog before implementation starts. Every single rule in scope must be verified against code. Fill the flow audit questions for every state-changing flow (user-flow.md §4), the mutation audit block for every write (mutations-forms.md §4), the hook audit for every component (react-hooks.md §6), the scroll containment check (responsive-fluid.md §9), the human cognitive pass, the data table audit (tables-data-grids.md), the file upload audit (file-uploads.md), the notification toast audit (notifications-toasts.md), and the AI answer audit for every generated answer (ai-ux.md).

**1e. Runtime evidence (optional).** If the app runs, `scripts/ui_audit.mjs` gives overflow/wrapping at many widths, layout shift, console errors, loading and pending-button behaviour. Pass the project's breakpoints and minimums (`--widths`, `--min-font`, `--min-target`). Add confirmed issues to the ledger; never close a category because the script found nothing. If the app can't run, say so.

**1f. Falsify and complete coverage ledger.** Re-open each finding and try to prove it wrong (harness.md §3). FULL: build the `04-coverage/` directory (`00-summary.md` plus 5 section reports `01-layout-hierarchy.md` through `05-craft-copy.md`), detailing **every single rule ID in exact sequential order** (`LAY-01` through `AI-06`, including `FLW-01..04`, `TAB-01..07`, `UPL-01..06`, `NOT-01..05`, and `NAV-11..12`) without omitting, skipping, or jumping IDs, recording each as either a finding ID (`VIOLATION`), concrete line-referenced code proof (`PASS`), or explicit justified `N/A`. Verify Gate G1 passing conditions before writing `PLAN.md`.

## 2. Plan

Write `PLAN.md` from plan-template.md. Ground all decisions in the researched app archetype, audience mental model, and domain benchmarks (no blind planning or generic card soup). It must have:
- the mode, the verbatim request, the finding counts
- app archetype, audience persona, and domain research summary
- DESIGN.md digest summary, gaps with the defaults used, conflicts as questions
- findings summarized by category with IDs (evidence stays in the ledger)
- **flow tables before the wireframes** for every state-changing flow: per step the entry, user action, validation `file:line`, pass → and fail → landing, plus the friction line (user-flow.md §1-2; Gate G2) - the wireframes then draw the states these tables named; `N/A: single-screen, no state change` allowed
- declutter table for every visible element (if redesigning) or cognitive chunking architecture (if designing a new UI feature)
- wireframes at phone, tablet and desktop (the project's breakpoints if defined) and each dialog on phone and desktop
- three interactive HTML layout concepts in `.ui-audit/<surface>/concepts/` (Concept A Structured, Concept B Balanced, Concept C Contextual) with working interactions, validations, dark mode and themes, and `concepts/index.html` switcher shell (`references/interactive-prototypes.md`); before styling, build the token ledger (§2) and collect verbatim toast/alert/error/empty strings from the codebase; every concept block traces to `02-inventory.md`, every feedback string is verbatim, and the §7 fidelity protocol passes with its table filled in §6
- layout mechanics per region (grid/flex, container vs media query, what collapses when)
- copy table, consistency table, pagination contract (if any), loading/pending table (with matching skeletons mirroring final UI - never reusing legacy skeletons), mutations table
- proposed new tokens/shared components/DESIGN.md changes (not done yet)
- what won't change
- slices, each listing the finding IDs it closes and its "done when" check; a Deferred list with reasons

Keep scope honest: a declutter isn't permission to rebuild data flow. Backend changes are listed with files, params, response shape and all callers. Then Gate G2.

## 3. Approval

Present a short summary: mode, top findings, links to the 3 interactive HTML concepts in `concepts/index.html`, declutter decisions, copy changes, backend changes, and slices. Direct the user to open `concepts/index.html` in their browser to test responsive views, dialogs, dark mode/themes, and interactions. Ask Approve / Change / Reject and record the selected concept (e.g. Concept A, B, C, or a blend). On "change", update the concepts/plan and ask again. Record the approval quote and chosen concept in `PLAN.md`. If the user said up front "don't wait", record that quote instead, but still write the plan first. Then Gate G3.

## 4. Implement

Typical slice order: structure → flow fixes (step signposting, transition gates, fail-path landing, redundant-step removal - FLW-01..04) → hierarchy & spacing → shared pieces (Spinner, Button `loading`, Skeleton, Pagination, EmptyState) → pagination backend + callers → pagination URL state + UI → tables & data grids (alignment, sticky headers, frozen columns, sort indicators) → skeletons & pending buttons (redesign skeletons to mirror the new UI; replace any legacy skeletons) → dialogs & overlays (scroll-lock layout shift, z-index scale, tooltip traps) → mutations, forms & file uploads (with field labels, input masking, wheel blur, upfront file constraints, object URL cleanup, & `aria-describedby`) → toasts & notifications (stack caps, hover pause, persistent errors) → hooks → accessibility & keyboard (focus rings, accessible names, live regions, `scroll-margin`) → human cognitive & emotional experience (chunking, progressive disclosure, recognition over recall, calm attention) → soulful finish (concentric radii, tactile depression, optical alignment, calm crossfades) → other states & copy → remaining fixes.

Rules:
- **Tokens and primitives only.** No new hex, no arbitrary `p-[13px]`, no new fonts; use the project's components and their variants (`cn()`/`cva` the way the codebase does).
- **Preserve behaviour.** Keep handlers, props, data hooks, routes, test ids, accessible names. If a test selects by text you changed, update it and log it.
- **Only fix ledger findings.** Something new turns up → add it to the ledger first (with evidence), then fix it if in scope; otherwise defer. In FOCUSED mode, out-of-scope items are never touched.
- **One version of each pattern** - use the shared canonical component, don't restyle a one-off.
- **Deviations**: small and sensible → do it and log it in `05-progress.md`; large (new structure, new dependency, another feature) → stop and ask.
- **After each slice**: typecheck/lint the touched files, look at a phone and a desktop width if the app runs, set finding statuses to `fixed`, log the slice with command output — then stage that slice's files by path (`git add <paths>`, never `-A`) and commit. One verified slice, one commit; never batch slices, never commit unverified. Then next slice. After all slices, Gate G4.

## 5. Verify

Produce `06-verify.md`:
1. **Build checks** run now - typecheck, lint, tests from `package.json`. Paste results. Name pre-existing failures.
2. **Per finding**: how it's verified - re-read the changed code (quote the new line), command output, or screenshot. A finding without a verification line is still open.
3. **DESIGN.md compliance**: each digest rule → followed / n.a. / broken (fix or approved exception). Grep the diff for raw hex, arbitrary values (`-[`), new font names.
4. **Responsive**: if the app runs, re-run `ui_audit.mjs` with the same options: zero page overflow, no wrapped short labels, no undersized targets, CLS ≤ 0.1, no new console errors; compare with before. Otherwise, re-read the layout code against RSP rules at each breakpoint.
5. **Dialogs**: each one at phone and desktop - focus in, Esc closes, internal scroll, footer reachable.
6. **States**: empty, loading, error, pending and permission branches exist and match the plan (force them in the running app where possible).
6b. **Flows** (user-flow.md §4): walk each flow table row - advance must be gated by the step's validation (fail → stays on step, inline error, inputs kept); failure lands where the plan's fail cell says; position/next action visible; no redundant step; Back restores or warns. Any mismatch is a new ledger finding before G5.
7. **Pagination** (if in scope): page 2 and back; filter resets page; `?page=9999`; page size above the max is clamped; bar fits at 320px.
8. **Checklists**: craft taste/human checklists (craft.md §4), ux-copy, loading-states, consistency, accessibility (accessibility.md §9) - any "yes" gets fixed, unless DESIGN.md asks for it. Re-audit every changed surface against the SLOP and MOT rules its slices touched (a loop, not a one-shot pass): any regression is fixed and re-verified before G5.
9. **Fresh eyes** (large runs): a subagent reads only PLAN.md, 03-findings.md and the diff, and reports findings marked fixed that the diff doesn't fix.

Then Gate G5 and the final report.

## 6. Key design rules (quick reference)

Defaults; DESIGN.md wins where it says otherwise.
- **Flow before screen**: every multi-step or state-changing flow gets a flow table (step, validation `file:line`, pass/fail landing) plus a friction line before wireframes (user-flow.md, PLAN §4b, Gate G2). No step advances on invalid input (FLW-02); on failure the user stays put with inputs kept (FLW-04); every step shows position and one obvious next action (FLW-01).
- **Hierarchy with soul & craft**: Spend boldness in one focal anchor (North Star); quiet the secondary before enlarging the primary (HIE-01, HIE-09). Eliminate competing eyebrow badges and icon clutter (HIE-10). Use a modular type scale with optical leading (HIE-11). Build depth through surface luminance tiers and hairline borders, not muddy drop shadow soup (HIE-12). Exactly one primary action per view (HIE-02).
- **Proximity carries meaning**: inside group < between groups < between sections. Never one uniform gap.
- **Not everything is a card**; never cards in cards.
- **No holes**: auto-fit/minmax grids, max widths on wide screens, text ≤ ~75ch.
- **Fluid, not two sizes**: rem-based `clamp()` (max ≤ 2.5× min); media queries for the page, container queries for components.
- **Short text never wraps awkwardly**: `whitespace-nowrap` on buttons/tabs/badges/headers, truncation + title for long values, `min-w-0` on flex/grid text children, `text-wrap: balance` on headings.
- **Mobile touch & viewport ergonomics**: Sticky bottom bars and sheets include `env(safe-area-inset-bottom)` padding (`RSP-14`); interactive targets use `touch-action: manipulation` (`RSP-15`); scrollable drawers/panels contain overscroll (`DLG-10`).
- **Dialogs are responsive**: `dvh` max height, internal scroll, sticky footer, sheet or full-screen on phones.
- **Lists paginated on the server**, previous data kept while loading, one shared pagination bar.
- **Every data region has a matching skeleton** (redesigned in lockstep with any layout changes; never reuse legacy skeletons); every action button shows a round spinner, is disabled and keeps its size while pending.
- **Actions are deduplicated**: exactly one canonical action button per task on screen (HIE-08); never duplicate submit buttons at top and bottom of a short card or form.
- **Inputs respect user autonomy**: never block paste (`FRM-15`), ensure checkboxes/radios share unified hit targets (`FRM-16`), avoid mobile autoFocus disruptions (`FRM-17`), maintain scroll scroller bounds without phantom leaks (`LAY-11`, `LAY-12`), and explicitly set `type="button"` on non-submitting form buttons to prevent premature form submission on click or input Enter keypress (`FRM-18`).
- **Shared components over duplicate forms**: unify create and edit forms across pages into a single polymorphic component sharing one validation schema (CON-06, FRM-14).
- **Dynamic item binding across workbench views (CON-08)**: master-detail views, split workbenches, and revision pickers must propagate the actively selected item and its sub-resources (approvals, facts, telemetry) to all child panels and headers; never hardcode child components to root/first/current items (`items[0]`, `currentVersion`) while the viewer inspects another variant.
- **Archive query filter parity (PAG-14)**: queries for soft-deleted, archived, or obsolete records must omit active-only filters (`is_current: true`, `is_active: true`) so records never vanish from both active and archive tabs simultaneously.
- **Every mutation (MUT-01..MUT-13)**: pending state, error shown, success feedback, fresh data after via complete query invalidation (including child audit logs and telemetry, `MUT-13`), safe destructive flow.
- **Micro-interactions provide purposeful feedback**: buttons react on press within 100ms (`active:scale-[0.98]`), transitions use composited properties only (`transform`, `opacity`) under 250ms, and all motion respects `motion-reduce` (motion.md).
- **Human cognitive & emotional experience (HUM-01..HUM-08)**: Chunk complex screens into 3–5 items maximum (Sweller/Miller); bridge Gulf of Execution with visible signifiers and natural mapping (Norman); bridge Gulf of Evaluation with instant <100ms perceptible feedback; honor Gestalt proximity (labels close to fields, far from neighbors); eliminate hidden modal state traps (Raskin); prioritize recognition over recall with autocomplete and summaries (Nielsen); keep routine telemetry in calm periphery (Weiser); provide affirming completion summaries and compassionate error recovery (Kahneman).
- **Soulful craft & tactile finish**: Active press depression (`active:scale-[0.98]`) on all controls within 100ms (SOUL-01); concentric nested corner radii R_inner = R_outer - P (SOUL-02); optical alignment for asymmetric icons and badges (SOUL-03); state continuity with 1:1 skeleton twins and calm crossfades without CLS (SOUL-04); depth through tonal surface luminance and crisp hairlines rather than muddy shadow soup (SOUL-06); unpretentious, dignified human voice (SOUL-08).
- **Accessibility is structural (WCAG 2.2 AA)**: Native HTML controls over div hacks (A11Y-01); all icon-only buttons have accessible names (A11Y-02); visible focus rings with ≥ 3:1 contrast against neighbors (A11Y-03); focus not obscured by sticky bars (A11Y-12); targets ≥ 24×24px (44×44 touch) (A11Y-05); form inputs linked with `htmlFor` and `aria-describedby` (FRM-01, A11Y-18); color never the sole status signal (A11Y-06).
- **Identifiers used before they exist (HOOK-14)**: never build a request path, cache key, `href` or required id from a value that can be `undefined`/`null` (a URL like `/api/x/undefined` is the tell); guard the boundary and treat the literal `'undefined'`/`'null'` as absent, and gate an asynchronously loaded component on the key it was loaded for (`loadedKey === currentKey`) so it never mounts against a changed prop.
- **Copy says what happens**: verb + object buttons, cause + fix errors, what + action empty states.
- **Data tables & grids (TAB-01..TAB-07)**: Header and cell alignment parity (text left, numbers right with `tabular-nums`), opaque sticky headers (`bg-background` and border; no transparent bleed), explicit select-all scope banner and persistent selection across pages, persistent non-hover row action buttons, horizontal scroll shadow affordance and frozen key columns, cell truncation tooltips/popovers for full text inspection, and active sort direction chevrons.
- **File uploads & drag-and-drop (UPL-01..UPL-06)**: Global window `dragover`/`drop` `preventDefault` containment preventing tab takeover on missed drops, file input value reset (`e.target.value = ''`) ensuring re-selection fires `onChange`, explicit `URL.revokeObjectURL` cleanup in effects, upfront visible format and size constraints, per-file batch progress and individual failure retry, and determinate progress metrics with an active Abort button for uploads >1 MB.
- **Toasts, notifications & alerts (NOT-01..NOT-05)**: Persistent alerts for critical/actionable errors (no vanishing error codes), interactive toasts pause timers on hover and focus with ≥8s duration, single aggregated summary toast for batch mutations (max 3 visible toasts stacked), zero occlusion of primary headers or mobile tab bars, and synchronous unread badge counter decrements.
- **Form input, dialog & search edge cases (FRM-19..24, DLG-11..14, NAV-06..10, ERR-08..10)**: Suppress wheel stepping on number inputs, ensure mobile virtual keyboard clears focused inputs, store dates as local `YYYY-MM-DD` strings (no UTC midnight day-shift), provide character counters on `maxLength` inputs, include show/hide toggles on password fields, preserve multi-step wizard drafts, prevent modal scroll-lock 15px layout shift (`scrollbar-gutter: stable`), eliminate tooltip tautology and hover traps, abort in-flight stale search queries, provide search clear buttons, scroll combobox active-descendant options into listbox view, flush debounced input on submit, preserve form drafts upon session expiration (401), and show an offline banner with queued retry instead of silent failure.
- **Command palette & shortcuts (NAV-11..12)**: Empty query shows 4-6 recents; no-results offers exits; async renders skeleton rows; local commands survive offline; nested pages show back; disabled rows show reasons; binding taught on a visible trigger and alive inside inputs.
- **AI answers (AI-01..06)**: Stream tokens with step text + Stop; cite sources with count; contextual first-person / High-Med-Low uncertainty on risky outputs; labelled AI group never outranking real commands; AI writes confirm or undo; feedback + verify path.
- **First-run, dark, latency (STA-11, THM-04, PERF-07)**: Progressive checklist over blocking tours; overlay raised above page in dark with legible hints; keystroke-to-paint ≤ ~250ms with virtualization past ~200 rows.
