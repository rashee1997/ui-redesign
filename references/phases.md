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

**1d. Static audit** → `03-findings.md`. Second pass: violations only. Read every inventory file fully (or inspect the proposed new feature specs/files) and run the per-file pass, then the cross-file passes, then the grep recipes (grep-recipes.md). Check DESIGN.md rules first (each violation cites the rule as `DM-n`), then evaluate **every rule in the catalog in catalog order** (the generated `04-coverage/` files list them). For new feature UI implementations: verify that the proposed design violates zero rules from the catalog before implementation starts. Every single rule in scope must be verified against code. Fill the flow audit questions for every state-changing flow (user-flow.md §4), the mutation audit block for every write (mutations-forms.md §4), the hook audit for every component (react-hooks.md §6), the scroll containment check (responsive-fluid.md §9), the human cognitive pass, the data table audit (tables-data-grids.md), the file upload audit (file-uploads.md), the notification toast audit (notifications-toasts.md), and the AI answer audit for every generated answer (ai-ux.md).

**1e. Runtime evidence (optional).** If the app runs, `scripts/ui_audit.mjs` gives overflow/wrapping at many widths, layout shift, console errors, loading and pending-button behaviour. Pass the project's breakpoints and minimums (`--widths`, `--min-font`, `--min-target`). Add confirmed issues to the ledger; never close a category because the script found nothing. If the app can't run, say so.

**1f. Falsify, then verify by script.** Re-open each finding and try to prove it wrong (harness.md §3). FULL: run `node <skill>/scripts/verify_ledger.mjs init .ui-audit/<slug>` (FOCUSED: add `--categories` for the mapped categories), replace every `TODO` with `PASS path:line "quote"`, `VIOLATION F-xxx` or `N/A grep:/regex/ reason`, then run `check --gate g1` and fix every FAIL (harness.md §4). Hand the printed spot-check list to the independent verifier (harness.md §6). Paste the script's last line and cross G1 only on PASS.

## 2. Plan

Write `PLAN.md` from plan-template.md. Ground all decisions in the researched app archetype, audience mental model, and domain benchmarks (no blind planning or generic card soup). It must have:
- the mode, the verbatim request, the finding counts
- app archetype, audience persona, and domain research summary
- DESIGN.md digest summary, gaps with the defaults used, conflicts as questions
- findings summarized by category with IDs (evidence stays in the ledger)
- **flow tables before the wireframes** for every state-changing flow: per step the entry, user action, validation `file:line`, pass → and fail → landing, plus the friction line (user-flow.md §1-2; Gate G2) - the wireframes then draw the states these tables named; `N/A: single-screen, no state change` allowed
- declutter table for every visible element (if redesigning) or cognitive chunking architecture (if designing a new UI feature)
- wireframes at phone, tablet and desktop (the project's breakpoints if defined) and each dialog on phone and desktop
- **one** interactive HTML concept in `.ui-audit/<surface>/concepts/index.html` for the direction judged best from the archetype, audience and research, plus a `PLAN.md` §6 list of three one-line directions (text and ASCII wireframes, no code) with the reason for the chosen one (interactive-prototypes.md §2); build the token ledger and collect verbatim feedback strings first; every block carries `data-trace`, every feedback string `data-copy`; run `verify_ledger.mjs check --gate g2`
- layout mechanics per region (grid/flex, container vs media query, what collapses when)
- copy table, consistency table, pagination contract (if any), loading/pending table (with matching skeletons mirroring final UI - never reusing legacy skeletons), mutations table
- proposed new tokens/shared components/DESIGN.md changes (not done yet)
- what won't change
- slices, each listing the finding IDs it closes and its "done when" check; a Deferred list with reasons

Keep scope honest: a declutter isn't permission to rebuild data flow. Backend changes are listed with files, params, response shape and all callers. Then run the G2 script check (paste its last line) and cross Gate G2.

## 3. Approval and the tweak loop

Present a short summary: mode, top findings, the link to `concepts/index.html` (test phone/tablet/desktop, dialogs, toasts, dark mode), declutter decisions, copy changes, backend changes and slices. Ask Approve / Change / Reject. **On "change", do not restart:** run the tweak loop (interactive-prototypes.md §6) - log the user's words in the Revision log, edit the one concept and the affected plan sections in place, re-run the G2 script, and reply with a three-line change summary. Repeat until the user approves a specific revision; record their quote and `Approved rev N` in `PLAN.md`. If the user said up front "don't wait", record that quote instead, but still write the plan first. Then Gate G3.

## 4. Implement

Typical slice order: structure → flow fixes (step signposting, transition gates, fail-path landing, redundant-step removal - FLW-01..04) → hierarchy & spacing → shared pieces (Spinner, Button `loading`, Skeleton, Pagination, EmptyState) → pagination backend + callers → pagination URL state + UI → tables & data grids (alignment, sticky headers, frozen columns, sort indicators) → skeletons & pending buttons (redesign skeletons to mirror the new UI; replace any legacy skeletons) → dialogs & overlays (scroll-lock layout shift, z-index scale, tooltip traps) → mutations, forms & file uploads (with field labels, input masking, wheel blur, upfront file constraints, object URL cleanup, & `aria-describedby`) → toasts & notifications (stack caps, hover pause, persistent errors) → hooks → accessibility & keyboard (focus rings, accessible names, live regions, `scroll-margin`) → human cognitive & emotional experience (chunking, progressive disclosure, recognition over recall, calm attention) → soulful finish (concentric radii, tactile depression, optical alignment, calm crossfades) → other states & copy → remaining fixes.

Rules:
- **Tokens and primitives only.** No new hex, no arbitrary `p-[13px]`, no new fonts; use the project's components and their variants (`cn()`/`cva` the way the codebase does).
- **Preserve behaviour.** Keep handlers, props, data hooks, routes, test ids, accessible names. If a test selects by text you changed, update it and log it.
- **Only fix ledger findings.** Something new turns up → add it to the ledger first (with evidence), then fix it if in scope; otherwise defer. In FOCUSED mode, out-of-scope items are never touched.
- **One version of each pattern** - use the shared canonical component, don't restyle a one-off.
- **Deviations**: small and sensible → do it and log it in `05-progress.md`; large (new structure, new dependency, another feature) → stop and ask.
- **Tweaks after approval** reopen the loop for the plan and concept (revision row, G2 script) before the code changes.
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

Then run `verify_ledger.mjs check --gate g5`, hand the diff to the independent verifier (harness.md §6), and cross Gate G5 only on PASS; then the final report.

## 6. Principles to keep in mind while implementing

Defaults; DESIGN.md wins. The rule IDs and their fixes live in `rule-catalog.md` and the category guides: do not restate them in the ledger from memory, read them.

- **Flow before screen**: a flow table per state-changing flow before wireframes; no step advances on invalid input; failure keeps the user on the step with inputs kept (user-flow.md).
- **One focal point, calm periphery**: one primary action per view, quiet the secondary before enlarging the primary, proximity carries meaning (inside group < between groups < between sections), not everything is a card.
- **Fluid, not two sizes**: `clamp()` type, container queries for components, media queries for the page, `dvh` and safe-area insets, short text never wraps awkwardly, no holes on wide screens.
- **Every async region has loading, empty, error and permission states**; skeletons mirror the redesigned UI; action buttons show a round spinner, disable and keep their size.
- **Every mutation** has a pending guard, visible error, success feedback, fresh data and a safe destructive path; lists are paginated on the server with URL state.
- **Reuse before reinvent**: one canonical component per pattern, shared create/edit forms, shared pagination, tokens and primitives only.
- **Accessible by structure** (WCAG 2.2 AA): native controls, names, visible non-obscured focus, targets, color never the only signal, works in dark and forced-colors.
- **Human voice**: verb + object buttons, cause + fix errors, what + action empty states; motion only to explain state, under ~250 ms, respecting reduced motion.
