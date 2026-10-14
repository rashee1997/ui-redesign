# Changelog

## 7.0.0 (2026-10-14): Script-verified gates, one tweakable concept, platform rules
- Added:
  - `scripts/verify_ledger.mjs` (`init`, `check --gate g1|g2|g5`): generates `04-coverage/` with every catalog rule in order; re-opens the source to verify `PASS path:line "quote"`, rejects false `N/A grep:/regex/`, mismatched finding/rule links, omitted or reordered rules, rubber-stamping (>4 rules on one `path:line`), unquoted or misplaced finding evidence, concept colour literals outside the token ledger, untraced `data-trace` blocks, non-verbatim `data-copy` strings, "fixed" findings whose old evidence is still present, and unknown commit SHAs. Prints a random spot-check list for an independent verifier. Tested on a fixture: baseline passes; fake quote, wrong line, omitted row, TODO, false N/A, wrong rule and rubber-stamp each fail.
  - `references/platform-quality.md`: detect/fix text for PERF, I18N, THM (previously no guide) and six new rules: STA-12 permission-denial dead end, ERR-11 429/`Retry-After`, FRM-25 `:user-invalid`, A11Y-21 forced-colors, MOT-15 View Transitions + reduced motion, PERF-08 LCP image. Catalog 316 → 322 rules.
  - Independent verifier mandatory at G1 and G5 (harness §6); red flags against unscripted "checked every rule" claims, line reuse, and second concepts.
- Changed:
  - Concepts: three prototypes → one, tweaked in place (`interactive-prototypes.md` rewritten, 265 → ~110 lines); directions compared as three one-line text options in `PLAN.md` §6; Revision log; G3 approves a specific revision (`Approved rev N`); `data-trace` / `data-copy` attributes make fidelity machine-checkable.
  - Gates G1, G2, G3, G5 now require the script's PASS line (`harness.md`, `SKILL.md`, `phases.md`, `plan-template.md`, `static-audit.md`, `README.md`).
  - Debloat: hard-coded rule counts and ID ranges removed from docs (the script reads the catalog); `phases.md` §6 duplicate rule list replaced by 8 principles (115 → 95 lines); coverage-related red-flag rows consolidated.
  - Fixes: `updating-skill.md` stale `04-coverage.md` text; README version badge (4.3.2 → 7.0.0); `updating-skill.md` verification adds script fixture, count and badge checks.
- Reason: user asked for research-backed fixes to the skill's flaws: the AI could claim it followed every rule without proof, three concepts were bloat, and some guidance was stale.
- Sources: NN/g "Parallel & Iterative Design + Competitive Testing" (Fessenden 2024; parallel ideas stay cheap, the merged design is iterated; iteration alone risks local maxima); MDN `:user-invalid`, `forced-colors`, `startViewTransition`, `prefers-reduced-motion`; web.dev LCP, Fetch Priority, same-document view transitions Baseline (2025-10-14). All read 2026-10-14.

## 6.0.1 (2026-10-14): README stale rule counts
- Changed: `README.md` badge, intro, G1 gate row, catalog summary heading, file-map entry: 312 → 316 rules, 26 → 27 categories; Layout & Hierarchy summary row gains `FLW` and the flow-table check.
- Reason: 6.0.0 updated every other count site but missed README (Correction cascade: fix every place the wrong statement appears); filed as PATCH because 6.0.0 was already tagged and packaged.
- Sources: this session - grep for `312|26 categor` across the skill after the 6.0.0 commit found README.md:10, 23, 71, 77, 103.

## 6.0.0 (2026-10-14): UI flow audit & design - FLW category, flow tables at G2
- Added:
  - `references/user-flow.md` guide: flow table format (step, entry, action, validation `file:line`, pass →, fail → landing), the 4-check friction line (path ok / next visible / back safe / interruption ok), per-rule detect & fix for FLW-01..04, and 7 flow audit questions
  - New catalog category **FLW - User flow & transitions** (inserted after DLG, before STA, staying inside the LAY-01..AI-06 walk): FLW-01 no step position/next-action signposting; FLW-02 transition without a validation gate; FLW-03 redundant flow step (re-displays known data, no decision); FLW-04 transition failure loses flow position (advance before success, toast-only failure)
  - `PLAN.md` §4b "User flow" section (flow table + friction line, or `N/A: single-screen, no state change`) - **Gate G2 condition** in harness.md
  - FLW example row in plan-template §5; "Flow & transitions" per-file block and 3 grep recipes (stepper transitions, `.then(advance)` without error branch, step signposting) in static-audit.md; flow walk in phases.md Phase 5 (6b); red flag "the screens look fine, so the flow between them is fine"
  - SKILL.md: non-negotiable "Every state-changing flow gets a flow table before wireframes", router row `FLW → user-flow.md`, description triggers "user flows/steps" and "flow transitions"
- Changed:
  - `references/rule-catalog.md`: FLW section + Contents + Sources (NN/g Wireflows, NN/g error-form guidelines, Baymard inline validation)
  - `references/harness.md`: Section 1 count 62 → 66 rules, G1 example 26 → 27 categories / 312 → 316 rules, G2 flow-table condition
  - `references/phases.md`: 1c maps the flow before hierarchy; 1d/1f include FLW-01..04; Phase 2 requires flow tables before wireframes; slice order puts flow fixes right after structure; §6 quick-reference "Flow before screen" line
  - `SKILL.md`: Phase 1 count 312 → 316, Phase 2 row mentions flow tables, non-negotiable sequence list includes FLW-01..04
  - Rule totals: 312 → 316; categories 26 → 27 (plan-template §5 wording too)
- Reason: user asked to include UI flow audit and design in this skill - screens were audited one at a time while the path between them (per-step validation gates, fail-path landing, redundant steps, step signposting) was never checked or planned
- Sources: NN/g "Wireflows: A UX Deliverable for Workflows and Apps" https://www.nngroup.com/articles/wireflows/ (arrows from acting control to resulting state incl. error states, read 2026-10-14); NN/g "10 Design Guidelines for Reporting Errors in Forms" https://www.nngroup.com/articles/errors-forms-design-guidelines/ (inline errors next to field, never validate before input complete, dialogs sparingly, read 2026-10-14); Baymard "Usability Testing of Inline Form Validation" https://baymard.com/research-articles/inline-form-validation (submit-only errors force full stops, premature validation is the failure mode, read 2026-10-14); user approval this session (v6.0.0 plan)

## 5.0.0 (2026-10-13): Concept fidelity hardening - traced concepts, verbatim copy, G2 reject gate
- Added:
  - Concept Fidelity Verification Protocol (`references/interactive-prototypes.md` §7): ledger completeness, hex hunt, structure trace, copy trace, shell check, data sanity, plus the fidelity table pasted into `PLAN.md` §6
  - Token-ledger-first rule (§3.1): name-plus-literal-value ledger built before any concept CSS; concepts and switcher shell may use only ledger entries
  - Inventory-trace rule (§3.3): every concept block, dialog, action, field, and status traces to one `02-inventory.md` row; untraced blocks removed
  - Verbatim feedback-copy rule (§3.5): toasts, alerts, inline errors, empty states, and validation strings copied verbatim from the codebase or `PLAN.md` §7; invented error codes and generic success text banned; simulation test bar fires only verbatim strings
  - G2 reject gate: unlisted color values, invented copy, untraced blocks, filler data, or placeholder shell chrome fail G2
  - `PLAN.md` §6 fidelity table, hex-hunt line, and shell-chrome line (`references/plan-template.md`)
  - Harness red flags against styling concepts from memory and inventing prototype copy
- Changed:
  - `references/interactive-prototypes.md`: §3 rewritten as anti-hallucination rules (§3.1-§3.7), §6 G2 condition hardened
  - `references/harness.md`: G2 row requires filled token ledger and fidelity table
  - `references/phases.md`: Phase 2 requires ledger, verbatim-string collection, and §7 pass before approval
  - `references/design-md.md`: §3 records exact literal values alongside code names for the ledger
  - `SKILL.md`: Phase 2 row and router mention traced concepts; new non-negotiable "Concepts are traced, not invented" (98 lines)
- Reason: concepts were styled from memory with invented colors, filler data, and hallucinated toast/error text that did not match DESIGN.md or the existing surface
- Sources: user report, this session

## 4.3.2 (2026-10-13): Theme & dark mode support in layout concepts
- Added:
  - Dual Theme Token Mapping in `references/interactive-prototypes.md`: concepts must define both light (`:root`) and dark (`.dark`, `[data-theme="dark"]`) token variables from `DESIGN.md`.
  - Dark Mode & Theme switching requirement (`THM-01`..`THM-04`): concepts must support toggling between light, dark, and project themes without broken contrast or unstyled flashes.
  - Theme switcher in `concepts/index.html`: added Dark / Light segmented toggle and keyboard shortcut (`T`) syncing theme class to both the shell and the active concept preview iframe.
- Changed:
  - `references/phases.md`: Phase 2 and Phase 3 updated to require dark mode and theme toggling in interactive concepts.
  - `references/harness.md`: Gate G2 condition updated to verify dark mode/theme toggling.
  - `SKILL.md`: Phase 2 row updated with dark mode & themes while staying strictly under 100 lines (96 lines).
- Reason: Ensure user can preview and verify redesign concepts across both light and dark themes before approving.

## 4.3.1 (2026-10-13): Debloat concept instructions & unify interaction recipes
- Changed:
  - `references/interactive-prototypes.md`: Replaced verbose individual JavaScript recipes (180+ lines of repetitive code) with a unified, lightweight interaction pattern (`setupPrototypeInteractions`), compact alert/toast dispatches, and a streamlined switcher shell template (~125 lines eliminated).
  - `references/phases.md`: Streamlined Phase 2 and Phase 3 prototype descriptions, removing verbose laundry-list text while preserving all validation, alert, and switcher requirements.
  - `references/harness.md`: Tightened Gate G2 condition description to reference interactive simulations cleanly.
  - `SKILL.md`: Maintained strict <=100 line limit (96 lines) while tightening Phase 2 concept description.
- Reason: Eliminate unnecessary instruction bloat and verbose boilerplate scripts in the skill references while retaining full interactive prototype, validation, alert, and switcher capabilities.

## 4.3.0 (2026-10-13): Decomposed Phase 1 coverage reports (04-coverage/), mandatory domain research & antislop integration
- Added:
  - Decomposed coverage directory architecture (`04-coverage/`) in `.ui-audit/<surface-slug>/` comprising:
    - `00-summary.md`: Rollup matrix, category completion states, rule counts, and Gate G1 certification stamp
    - `01-layout-hierarchy.md`: Section 1 coverage (LAY 18, HIE 15, RSP 15, DLG 14: 62 rules)
    - `02-states-data.md`: Section 2 coverage (STA 11, LDG 11, PAG 14, TAB 7: 43 rules)
    - `03-forms-actions.md`: Section 3 coverage (MUT 17, FRM 24, UPL 6, ERR 10, NOT 5: 62 rules)
    - `04-engineering-a11y.md`: Section 4 coverage (HOOK 18, A11Y 20, NAV 12, PERF 7: 57 rules)
    - `05-craft-copy.md`: Section 5 coverage (CON 11, CPY 13, SLOP 12, MOT 14, SOUL 14, HUM 8, I18N 6, THM 4, AI 6: 88 rules)
  - Standardized section report header format: `# 04-coverage - <surface-slug> - <Section Title> (FULL: every rule ID in strict catalog order)`
  - App Archetype & Audience Discovery pass in Phase 1a/1c: classify product archetype (B2B SaaS, internal operations cockpit, high-density workbench, consumer) and define user cognitive environment
  - Mandatory External Domain Research requirement: agents must run external searches (`search_web`, docs) to benchmark top-tier market standards before planning or prototyping; no blind designing
  - Mandatory Antislop Skills Protocol across all phases: always load and apply `antislop`, `antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, `antislop-code` if available in the environment; otherwise skip gracefully
  - Interactive Form & Input Validations in `concepts/`: prototypes include working form validation (`FRM-01`..`FRM-24`, `A11Y-18`), inline field errors linked via `aria-describedby`, live error clearing on typing, character counters, and password show/hide toggles
  - Error Alerts & Prototype Simulation Test Bar in `concepts/`: prototypes provide an interactive test panel to toggle form errors, trigger 422/500 alert banners (`role="alert"`), and test hover-paused toast notifications (`NOT-01`..`NOT-05`) before approving plans
- Changed:
  - `references/interactive-prototypes.md`: Added §4 D (Interactive Form & Input Validations) and §4 E (Error Alerts & Simulation Test Bar) recipes
  - `references/harness.md`: §1 ledger table, §2 Gate G1 & G2 conditions, §4 coverage ledger, and §5 red flags updated to require archetype/audience, external research, 04-coverage/ folder verification, and live form validations/alerts in concepts
  - `references/phases.md`: Phase 1a/1c updated with archetype discovery and mandatory external research; Phase 1f updated to build decomposed section files during FULL audits; Phase 2 & 3 updated to require interactive form validations and error alerts in concepts; antislop skill loading directive added
  - `references/plan-template.md`: Added §1.5 App archetype, target audience & domain research section to PLAN.md template; §5 findings reference updated to 04-coverage/
  - `references/taste-engineering.md`: §1 context and audience updated to anchor dial presets to researched archetype and mandatory external benchmarks
  - `references/static-audit.md`: Step 7 updated to walk rules into 04-coverage/ section reports
  - `references/rule-catalog.md`: Header line 3 updated to reference section reports in 04-coverage/
  - `SKILL.md`: Phase 1 output, Phase 2 concepts description, static analysis router, antislop loading directive, and non-negotiables updated while maintaining strict <=100 line limit (96 lines)
  - `README.md`: Version badge bumped to 4.3.0; What It Does and 6-Gate Pipeline table updated with archetype research, antislop integration, and 04-coverage/
- Reason: Eliminate AI context bloat and token truncation during Phase 1 full audits, ground UI planning in real domain research and user personas instead of blind prototyping, enable testing of form validations and error alerts in HTML concepts before approval, and enforce antislop skills whenever available

## 4.2.0 (2026-10-13): Animated slop-to-fixed demo GIF
- Added:
  - `assets/showcase/ui-redesign-demo.gif`: animated checkout demo (findings pinned to rule IDs, morph to fixed UI, G0-G5 ledger ticks down to zero open)
  - `README.md`: See It Work section with the demo GIF and slop-to-fixed rule table
- Removed:
  - `assets/showcase/set-dark-app.png`, `set-light-hero.png` (replaced by the demo GIF)
- Reason: show the skill working on the public repo page

## 4.1.0 (2026-10-13): Slop vs fixed showcase, two realistic sets
- Added:
  - `assets/showcase/set-dark-app.png`: realistic dark invoices app screen, slop (pill badge, gradient icon stat cards, glowing dot statuses, cards in cards, duplicate glow CTAs) vs fixed (one primary, toolbar, tabular amounts, visible kebabs, shared pager)
  - `assets/showcase/set-light-hero.png`: light landing hero, slop (gradient headline, hype copy, icon card row, plain-text logo wall, gradient big-number stat) vs fixed (one focal, honest copy, real proof cards, component preview)
  - Both sets carry the G0-G5 gate ledger strip
  - `README.md`: Slop vs Fixed section with both sets; file map covers `assets/showcase/`
- Changed:
  - `README.md`: version badge to 4.1.0
- Reason: show what the skill fixes on the public repo page
- Sources: prg.sh (purple-gradient default), dev.to (purple gradient problem), Anthropic cookbook frontend aesthetics, `references/craft.md` slop tells

## 4.0.4 (2026-10-13): Replace unindexed skills.sh badge
- Changed:
  - `README.md`: version badge to 4.0.4; replaced skills.sh install-count badge (rendered `resource not found` — skill not yet indexed, indexing follows install telemetry) with a static install badge linking to `Usage`
- Reason: broken badge image on the public repo page
- Revert note: restore `[![skills.sh](https://skills.sh/b/rashee1997/ui-redesign)](https://skills.sh/rashee1997/ui-redesign)` once skills.sh indexes the skill

## 4.0.3 (2026-10-13): skills.sh install badge and instructions
- Changed:
  - `README.md`: version badge to 4.0.3; added skills.sh install-count badge; `Usage` documents `npx skills add rashee1997/ui-redesign`
- Reason: make the published skill installable and indexable via skills.sh telemetry

## 4.0.2 (2026-10-13): README covers interactive concepts
- Changed:
  - `README.md`: version badge to 4.0.2; `What It Does` documents the 3 interactive HTML concepts step; pipeline table G2/G3 rows mention `concepts/` and the chosen concept
- Reason: README lagged behind the v4.0.0 concepts protocol and the v4.0.1 gate-scope fix

## 4.0.1 (2026-10-13): Fix concept prototype contradictions and gate scope
- Fixed:
  - `references/interactive-prototypes.md`: toast recipe now uses 8000ms to match `NOT-01..NOT-05` (was 4000ms)
  - `references/interactive-prototypes.md`: switcher `setConcept` replaced always-true `pathname.includes('/')` branch with explicit `SINGLE_FILE` flag
  - `references/interactive-prototypes.md`: switcher shell template notes placeholder chrome must be replaced with project DESIGN.md tokens (§3 zero-drift rule)
  - `references/harness.md`: Gate G2 concepts requirement scoped with `if layout changes` (was unconditional; trivial FOCUSED fixes no longer forced into 3 prototypes)
- Reason: review of v4.0.0 found internal contradictions and an over-broad gate
- Sources: `references/notifications-toasts.md` (≥8s toast rule)

## 4.0.0 (2026-10-13): Interactive HTML layout concepts, switcher shell, and pre-approval prototyping
- Added:
  - Protocol and reference guide `references/interactive-prototypes.md` defining pre-approval interactive prototyping:
    - Generation of 3 distinct layout concepts in `.ui-audit/<slug>/concepts/` (Concept A: High-Density Structured, Concept B: Modern SaaS Balanced, Concept C: Contextual Fluid)
    - Sizing heuristic: single-file (`concept-{x}.html`) for compact surfaces (< 400 lines) vs modular multi-file (`concept-{x}/` with `index.html`, `styles.css`, `app.js`) for complex surfaces
    - Project token fidelity: extraction of `DESIGN.md` CSS custom properties into prototypes
    - Vanilla JS interactive recipes: accessible dialogs with backdrop/Esc traps, alerts/toasts with hover-pause, and simulated mutation loading states
    - Lightweight concepts switcher shell `concepts/index.html` with responsive viewport emulation (Mobile 375px, Tablet 768px, Desktop 1280px) and keyboard cycling (`1`, `2`, `3`)
  - Top repository cover banner `assets/cover/ui-redesign-cover.png` and developer metadata badges in `README.md`
  - Rotated D caliper brand emblem in `assets/logo/concept-a-caliper.svg` and `assets/logo/concept-a-caliper.png`
  - MIT License (`LICENSE`)
- Changed:
  - `SKILL.md`: Added `interactive-prototypes.md` to reference router table and updated Phase 2 description (kept under 100 lines: 96 lines)
  - `references/phases.md`: Phase 2 (Plan) updated to mandate building the 3 interactive concepts in `concepts/`; Phase 3 (Approval) updated to direct the user to open `concepts/index.html` in their browser and record the chosen concept
  - `references/harness.md`: Gate G2 updated to require verified, interactive HTML concepts in `concepts/` with zero syntax errors; Gate G3 updated to record user's chosen concept
  - `references/plan-template.md`: Added interactive concepts links to §6 and chosen concept slot to § Approval
  - `README.md`: Updated version badge to 4.0.0 and added `interactive-prototypes.md` to File Reference Map

## 3.2.0 (2026-10-13): Taste engineering, Three Dials, brief inference, and anti-slop rules
- Added:
  - Reference guide `references/taste-engineering.md` synthesizing 13 skills from `Leonxlnx/taste-skill`:
    - Three Dials calibration (`DESIGN_VARIANCE` 0-10, `MOTION_INTENSITY` 0-10, `VISUAL_DENSITY` 0-10)
    - Brief Inference and 1-line "Design Read" protocol for converting brief intents into concrete UI parameters
    - Archetype mapping (Official Enterprise/B2B vs Craft/Editorial vs Brutalist vs Minimalist vs Soft)
    - Modernisation Levers Priority Stack (Layout > Surface > Typography > Motion > Polish)
    - Canonical GSAP Sticky-Stack and Horizontal-Pan animation patterns with cleanup
    - Full-output emission enforcement (ban on placeholders, omissions, and truncations)
  - 28 new falsifiable rules across 7 categories in `references/rule-catalog.md`:
    - `LAY-13` to `LAY-18`: display headline wrap cap (2-3 lines, max-w-5xl+), hero viewport overflow (`min-h-[100dvh]`, top padding cap `pt-24`), hero stack overload (max 4 text items), zigzag alternation cap (max 2), bento grid voids and visual variation (`grid-flow-dense`), split-header default ban
    - `HIE-13` to `HIE-15`: duplicate CTA intent, multi-column card baseline misalignment, double-bezel / nested enclosure violation
    - `CON-09` to `CON-11`: Page Theme Lock (no mid-page light/dark flipping), Color Consistency Lock (no off-token brand colors), Corner Radius Scale Lock
    - `CPY-10` to `CPY-13`: Absolute Zero Em-Dash Ban, artificial meta-numbering filler (`01 / ARCHITECTURE`), middle-dot rationing, performative copy register
    - `SLOP-08` to `SLOP-12`: eyebrow spam cap (max 1 per 3 sections), div-based fake screenshots, lazy warm craft palette drift, plain text wordmarks on trust walls, decorative unclickable status dots
    - `MOT-11` to `MOT-14`: motivated motion mandate, raw scroll listener state ban, marquee count/overflow, ScrollTrigger pinning integrity
    - `SOUL-11` to `SOUL-14`: desktop CTA button text wrap ban, italic serif descender clearance, button-in-button nested trailing icon, full-output omission ban
- Changed:
  - `references/rule-catalog.md`: Added sources and cataloged rules (expanded to 312 rules across 26 categories)
  - `references/craft.md`: Added Doppelrand nested container recipe, button-in-button trailing icon, italic descender clearance, palette rotation, fake screenshot ban, and updated audit checklists
  - `references/motion.md`: Added Motivated Motion mandate (`MOT-11`), raw scroll listener ban (`MOT-12`), marquee limit (`MOT-13`), ScrollTrigger pinning integrity (`MOT-14`), and updated checklist
  - `references/ux-copy.md`: Added Absolute Zero Em-Dash Ban (`CPY-10`), meta-numbering ban (`CPY-11`), middle-dot rationing (`CPY-12`), performative copy register ban (`CPY-13`), and single CTA intent (`HIE-13`)
  - `references/hierarchy-declutter.md`: Added Section 10 on display headline wrap, hero viewport stability, zigzag cap, bento density, split-header ban, and multi-column baseline alignment (`LAY-13..18`, `HIE-14`)
  - `references/consistency.md`: Added Page Theme Lock (`CON-09`), Color Consistency Lock (`CON-10`), Corner Radius Scale Lock (`CON-11`), and updated checklist
  - `references/static-audit.md`: Added per-file pass questions in §3, cross-file checks in §4, and candidate grep recipes in §5
  - `references/plan-template.md`: Added Anti-slop & copy hygiene category and examples in §5
  - `references/harness.md`: Updated Gate G1 count (312 rules) and hook rule range (`HOOK-01` through `HOOK-14`)
  - `SKILL.md`: Added `taste-engineering.md` to reference router and updated Non-negotiables (kept under 100 lines: 94 lines)
- Reason: User requested cloning and reading `Leonxlnx/taste-skill`, extracting every skill, and updating, enhancing, and hardening `ui-redesign`.
- Sources: `Leonxlnx/taste-skill` (taste-skill v2 experimental, redesign-skill, soft-skill, minimalist-skill, brutalist-skill, gpt-tasteskill, stitch-skill, output-skill, image-to-code-skill, imagegen-frontend-web, imagegen-frontend-mobile, brandkit).

## 3.1.0 (2026-10-10): AI answers, palette states, first-run, offline, dark/latency parity
- Added:
  - Category `AI` with rules `AI-01` to `AI-06` and reference guide `references/ai-ux.md` (stream state + Stop, source drill-down, contextual uncertainty, visible seam, confirm/undo on AI writes, feedback + verify)
  - Rules `NAV-11` to `NAV-12`: palette production states and shortcut discoverability
  - Rules `STA-11` (first-run checklist over blocking tours), `ERR-10` (offline banner + queued retry), `THM-04` (dark elevation parity), `PERF-07` (interaction latency budget + virtualization)
- Changed:
  - `references/rule-catalog.md`: Contents + AI section, Sources (NN/g AI Hallucinations, Setproduct palette guide)
  - `SKILL.md`: router rows for NAV and AI; G1 range now `LAY-01` through `AI-06`
  - `references/responsive-fluid.md` §6, `references/loading-states.md` §6-7, `references/mutations-forms.md` §3, `references/static-audit.md` (§1, §3, §5), `references/plan-template.md` (§5), `references/phases.md` (§1d, §1f, §6)
- Deferred: full charts/dataviz category and print/PDF rules (bloat control; PAG-11..13 already cover aggregate parity; each rule adds mandatory G1 cost)
- Reason: user-approved gap audit — skill had zero AI-UX rules despite AI Q&A product, 1 of 12 palette checks, no first-run/offline rules
- Sources: NN/g "AI Hallucinations" (Laubheimer 2025), https://www.nngroup.com/articles/ai-hallucinations/ (read 2026-10-10); Setproduct "Command Palette UI Design" (Kamushken 2026), https://www.setproduct.com/blog/command-palette-ui-design-guide (read 2026-10-10)

## 3.0.0 (2026-10-09): Commit-per-verified-slice in Implement
- Changed: `phases.md` implement rules — after each slice's checks pass, stage by path and commit; one verified slice, one commit; never batch, never commit unverified. `harness.md` 05-progress row and G4 gate now require the commit SHA per slice.
- Reason: user instruction — the implement step had no commit instructions; same gap as edgecase-review v4.1.0.
- Sources: user, this session.

## 2.0.0 (2026-10-09): Structured rebuild, craft merge, sourced protocol, evaluator removed

- Added: `references/craft.md` — merges `soulful-design.md`, `human-design-theory.md`, and `anti-slop.md` into one taste/craft/human guide (slop tells, 8 human laws with fixes, craft finish with recipes, three audit checklists). Catalog SLOP/SOUL/HUM IDs unchanged.
- Added: severity second pass in `harness.md` §3 — findings recorded severity-free during the hunt, P-rated after against frequency × impact × persistence (P0–P3 ≙ Nielsen 4–1, rejected ≙ 0); two-pass read named in `phases.md` (trace pass → violation pass); fresh-eyes subagent rates independently before opening ledger ratings.
- Added: primary-source lines — `loading-states.md` (NN/g skeleton thresholds: full-page loads under ~10s, frame-only ≈ spinner, processes get progress bars, shimmer needs motion-reduce), `harness.md` (audit shape follows W3C WCAG-EM: scope → explore → sample → evaluate → report).
- Changed: `scroll-containment.md` folded into `responsive-fluid.md` §9 (owner table, leak causes, browser snippet, checklist); `plan-template.md` §5 findings collapsed from ~110 lines of per-category examples to row format plus one compact worked shape; harness red flags 28 → 17 (rule-specific gotchas stay in their guides).
- Changed: SKILL.md router, `phases.md`, `static-audit.md`, and `rule-catalog.md` guide links point at `craft.md` and responsive §9.
- Removed: `scripts/evaluate_audit.py` (mechanical gate enforcer + self-reflection prompt generator). Coverage stays ledger-enforced by Gate G1; the two evidence scripts (`ui_audit.mjs`, `scan_patterns.mjs`) are unchanged.
- Reason: user asked for a structured, debloated, well-organized redesign skill grounded in deep research on audit standards.
- Sources: NN/g "Severity Ratings for Usability Problems" (Nielsen 1994), https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/ (frequency × impact × persistence, 0–4 scale, independent post-hoc rating; read 2026-10-09); NN/g "How to Conduct a Heuristic Evaluation" (Moran & Gordon 2023), https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/ (narrow scope, independent evaluators, two passes, violation ≠ problem; read 2026-10-09); NN/g "Skeleton Screens 101" (Tankala 2023), https://www.nngroup.com/articles/skeleton-screens/ (read 2026-10-09); W3C WCAG-EM 2.0 Overview, https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/ (5-step pipeline, sampling, preliminary checks; read 2026-10-09); Pavle Lucic, "UX Audit vs Heuristic Evaluation", https://pavle-design.com/blog/ux-audit-vs-heuristic-evaluation (audit scope, heuristic-first triage; read 2026-10-09).

## 1.6.0 (2026-10-07): Point to skill-creator for self-updates
- Changed: references/updating-skill.md: added a line directing to the skill-creator skill when available
- Reason: user asked that every skill's update-skill doc reference the skill-creator skill
- Sources: skill-creator CHANGELOG.md v2.1.0 entry

## 1.5.0 (2026-10-06): Dynamic catalog introspection, silent mutation bugs, hook state traps, post-mutation dead ends, and race conditions
- Added:
  - Dynamic Catalog Introspection Engine in `scripts/evaluate_audit.py`: parses `rule-catalog.md` on the fly (categories, titles, rules, guides). Zero hardcoded category names or rule counts; automatically supports any future catalog expansions and dynamically validates Gate G1 coverage.
  - Rules `MUT-14` to `MUT-17`: synthetic event leaks into optional arguments, un-awaited mutation promises, optimistic payload shape mismatches, and non-idempotent retry idempotency.
  - Rules `HOOK-15` to `HOOK-18`: uncontrolled-to-controlled input flash, effect prop-to-state synchronization anti-patterns, object/array identity churn in dependency arrays, and stale closures in async handlers/listeners.
  - Rules `STA-09` to `STA-10`: post-deletion navigation to deleted resource, and success modal dead ends lacking affirmative next actions.
  - Rules `NAV-09` to `NAV-10`: post-creation back button form resubmission traps (`router.push` vs `router.replace`), and debounced input vs instant submit race conditions.
- Changed:
  - `references/rule-catalog.md`: added rules `MUT-14..17`, `HOOK-15..18`, `STA-09..10`, and `NAV-09..10`.
  - `references/mutations-forms.md`: documented silent mutation bugs (`MUT-14..17`).
  - `references/react-hooks.md`: documented hook state traps and identity churn (`HOOK-15..18`).
  - `references/loading-states.md`: documented post-mutation transitions and dead ends (`STA-09..10`).
  - `references/responsive-fluid.md`: documented back button replacement and debounce flush on submit (`NAV-09..10`).
- Reason: user requested researching silent bugs in mutations, hooks, race conditions, and dead ends, updating the catalog, and making the evaluation script dynamic to support future expansions.

## 1.4.1 (2026-10-06): Advanced Actor-Critic AI self-reflection prompt architecture with dynamic telemetry injection
- Added:
  - Dynamic audit telemetry injection in `scripts/evaluate_audit.py`: extracts surface name, inventory counts, finding severities, category distribution, wireframe indicators, and microtask counts directly into the prompt.
  - 5-Axis Orthogonal Self-Critique Protocol based on Reflexion (Shinn et al.) & Self-Refine (Madaan et al.): Factual Grounding & Proof Integrity, Negative Space & Unnoticed Regressions, Cognitive Load & Human Design Laws, Wireframe Rigor & Responsive Truth, and Microtask Atomicity & Falsifiability.
  - CLI flags `--prompt-only` and `--json` for programmatic evaluator workflows.
- Reason: user requested deep research into AI self-reflection prompting and updating the evaluation script using research-backed critique structures.
- Sources: Reflexion (Shinn et al., 2023), Self-Refine (Madaan et al., 2023), SurePrompts Self-Refine Guide, Prompt Engineering Guide.

## 1.4.0 (2026-10-06): Automated audit and plan evaluation script (evaluate_audit.py) with self-reflection rubric and microtasks verification
- Added:
  - Script `scripts/evaluate_audit.py`: automated audit validator that verifies ledger file integrity, 100% Gate G1 rule catalog coverage, finding consistency, full wireframes across phone/tablet/desktop, and fine-grained microtasks decomposition matching qhsedocks-sdd standards.
  - Structured Self-Reflection Rubric: outputs actionable reflection questions for cognitive load, responsive wireframe rigor, zero-unhandled-state resilience, and microtask atomicity/falsifiability.
- Changed:
  - `SKILL.md`: updated "Which reference, when" router table to include `scripts/evaluate_audit.py`.
- Reason: user requested full wireframes in redesign plans, microtasks implementation plan matching qhsedocks-sdd parity, and an automated self-evaluation Python script to check audit correctness and output self-reflection prompts.

## 1.3.1 (2026-10-06): Fix HOOK router entry in SKILL.md and replace em dashes with hyphens
- Changed:
  - `SKILL.md`: restored `| HOOK - React hooks | react-hooks.md |` to the "Which reference, when" router table after it was displaced during router table category expansion.
  - `references/mutations-forms.md`: replaced em dash in MUT-12 description with a standard hyphen.
  - `references/pagination.md`: replaced em dashes in PAG-11 and PAG-12/13 descriptions with standard hyphens.
- Reason: validation with `validate_skill.py` from skill-creator flagged `react-hooks.md` as unrouted from `SKILL.md` and flagged em dashes in reference guides.

## 1.3.0 (2026-10-06): Production data table integrity, file upload drag-and-drop safety, persistent notification architecture, and expanded form/dialog/search edge cases
- Added:
  - Category `TAB` (Tables & Data Grids) with rules `TAB-01` to `TAB-07` and reference guide `references/tables-data-grids.md` (header/cell alignment parity, opaque sticky headers, select-all page vs dataset scope clarity, persistent row actions on touch/keyboard, horizontal scroll cues and frozen key columns, cell truncation tooltips, active sort direction chevrons)
  - Category `UPL` (File Uploads & Drag-and-Drop) with rules `UPL-01` to `UPL-06` and reference guide `references/file-uploads.md` (global drop window containment preventing tab takeover, file input value reset for re-selection, object URL memory leak revocation, upfront visible format/size limits, per-file batch progress/retry, determinate upload progress and abort controllers)
  - Category `NOT` (Toasts, Notifications & Alerts) with rules `NOT-01` to `NOT-05` and reference guide `references/notifications-toasts.md` (persistent alerts for critical errors, interactive toast hover/focus pause with ≥8s duration, batch mutation single summary aggregation with max 3 stack cap, zero occlusion of primary headers/tab bars, synchronous unread badge counter decrements)
  - Rules `FRM-19` to `FRM-24`: mouse wheel stepping on number inputs, mobile virtual keyboard input occlusion, date picker UTC timezone day-shift, silent character limit truncation, password field show/hide visibility toggle, and multi-step wizard draft state loss
  - Rules `DLG-11` to `DLG-14`: modal scroll-lock 15px layout shift (`scrollbar-gutter: stable`), z-index layering scale and portal containment, tooltip cursor hover traps and mobile access, and tooltip tautology
  - Rules `NAV-06` to `NAV-08`: search/filter async query race condition cancellation, search input instant clear button, and combobox active-descendant keyboard scroll into view
  - Rules `ERR-08` to `ERR-09`: session timeout form submission data preservation, and multi-tab authentication state desynchronization
- Changed:
  - `references/rule-catalog.md`: added `TAB`, `UPL`, `NOT` to Contents and catalog; updated Sources with Roman Kamushken and BuiltUX; appended new rules across categories.
  - `references/mutations-forms.md`: documented `FRM-19`..`FRM-24` and `ERR-08`..`ERR-09`.
  - `references/responsive-fluid.md`: documented `DLG-11`..`DLG-14` and `NAV-06`..`NAV-08`.
  - `SKILL.md`: updated "Which reference, when" router table and non-negotiables strict sequential range.
  - `references/harness.md`: added red flags for `TAB-02`, `UPL-01`, `NOT-01`, and `FRM-21`.
  - `references/phases.md`: updated static audit, coverage ledger, implement slice order, and §6 Key design rules.
  - `references/static-audit.md`: added per-file passes and grep candidate recipes for all new rules.
  - `references/plan-template.md`: updated category count to 25 and added findings subsections and sample findings.
- Reason: user requested deep web research of modern UI/UX bug classes and interaction flaws, adding them as strict law of the book dedicated categories and catalog expansions.
- Sources: Vercel Web Interface Guidelines, Roman Kamushken (Data Table UI Design 2026), BuiltUX (Toast Notifications & Snackbars in Production UX 2026), W3C ARIA Authoring Practices Guide (Combobox), WCAG 2.2, research conducted 2026-10-06.

## 1.2.0 (2026-10-06): Dynamic workbench item binding, non-submitting form button safety, archive query filter parity, and complete child query invalidation
- Added:
  - Rule `CON-08`: Dynamic item binding across workbench views (orchestrating view provides a selector/picker, but child components remain bound to root/default/current items like items[0] or currentVersion instead of dynamically reacting to the active selected variant)
  - Rule `FRM-18`: Explicit `type="button"` on non-submitting form controls (utility buttons like file pickers, preview toggles, clear buttons default to `type="submit"`, causing premature submission on click or input Enter keypress; multi-field modal forms lack Enter key suppression on inputs)
  - Rule `PAG-14`: Soft-delete / archive queries retain active-only filters (e.g. `is_current: true`, `is_active: true`, `archived_at: null`), causing soft-deleted or obsolete records to return zero rows and vanish from the archive view
  - Rule `MUT-13`: Cache invalidation on mutation misses child/telemetry queries (primary entity query refreshed, but audit logs, approval histories, activity feeds, or related sub-resources stay stale)
- Changed:
  - `references/rule-catalog.md`: appended `CON-08`, `FRM-18`, `PAG-14`, and `MUT-13`.
  - `references/consistency.md`: documented dynamic item binding across workbench views and added checklist item.
  - `references/mutations-forms.md`: documented complete child query cache invalidation (MUT-13) and explicit `type="button"` / Enter suppression on form controls (FRM-18).
  - `references/pagination.md`: documented soft-delete and archive query filter parity (PAG-14) and added checklist item.
  - `references/static-audit.md`: added grep candidate finders for CON-08, FRM-18, PAG-14, and MUT-13.
  - `references/phases.md` §6: added quick-reference bullets for dynamic item binding, explicit button types, archive query filter parity, and complete child invalidation.
  - `references/harness.md` §5: added red flags against hardcoded child item props and untyped buttons in forms.
  - `references/plan-template.md`: added sample findings for CON-08, FRM-18, PAG-14, and MUT-13.
- Reason: user requested updating the skill to audit and prevent these bug classes (hardcoded child props across workbenches, untyped buttons auto-submitting forms, soft-delete archive queries hiding obsolete records, and stale child telemetry).

## 1.1.0 (2026-10-05): AI UI slop patterns (fonts, placeholder people, generic templates), purposeful motion, and cross-app consistency checks
- Added:
  - Rule `SLOP-06`: typography slop (single font default e.g. Inter without deliberate pairing or modular rhythm)
  - Rule `SLOP-07`: AI/placeholder people as content (generated avatars, anime/3D mascots, stock faces; missing/placeholder alt)
  - Rule `CON-07`: reference existing best-in-class usage before reinventing (patterns must reuse/extend canonical shared primitives or best existing usage instead of one-off restyling)
- Changed:
  - `SLOP-03`: extended to explicitly forbid generic SaaS page templates (hero → features grid → social-proof stats → testimonials → FAQ)
  - `MOT-03`: extended to forbid bounce/fade animations applied to every hover and scroll entry with no functional intent
  - `references/anti-slop.md`: documented typography and people/media slop sections
  - `references/motion.md`: added non-functional hover/scroll bounce to banned motion tells and checklist
  - `references/consistency.md`: added canonical cross-app usage step and CON-07 checklist item
  - `references/static-audit.md`: added grep recipes for SLOP-06, SLOP-07, CON-07
  - `references/phases.md` §5 & `references/harness.md` §5: formalized closed-loop re-audit against SLOP and MOT rules before G5 passes
- Reason: user requested researching latest design systems (2025/2026), AI slop patterns, and cross-app UI consistency
- Sources: Hallmark guide (rohitraj.tech), SmoothUI "AI Design Slop" (smoothui.dev), vibecodekit AI-slop community test, read 2026-10-05

## 1.0.1 (2026-10-05): Fix the source path in the previous entry
- Changed: reworded the skill-creator template source in the 1.0.0 entry to name the skill instead of a bare file path, so the validator no longer reads it as a missing local file
- Reason: validate_skill.py reported a CHANGELOG link to a missing skill-creator template file

## 1.0.0 (2026-10-05): Version control and versioning instructions
- Added: "Version control" and "Versioning" sections in `references/updating-skill.md`; every version is a git commit and an annotated tag `v<MAJOR.MINOR.PATCH>` derived from the newest `CHANGELOG.md` heading
- Changed: update steps and the changelog format now commit and tag each version; semantic versioning starts at 1.0.0 (entries below are date-only history)
- Reason: project rollout of git tracking with version tags, matching skill-creator 2.0.0
- Sources: skill-creator skill, Version control and Versioning template sections, read 2026-10-05

## 2026-10-04 - Missing/stale identifier rule (HOOK-14) for undefined-request bugs
- Added: rule `HOOK-14` (a request path, cache key, `href` or required id built from a value that can be missing, producing a literal `undefined`/`null` request, and the stale async component that surfaces it).
- Changed:
  - `references/rule-catalog.md`: appended `HOOK-14` after `HOOK-13`.
  - `references/react-hooks.md`: new HOOK-14 section with the two failure shapes, boundary guards, `enabled`/`key` fixes, and the signals to look for.
  - `references/static-audit.md`: hooks per-file question plus dynamic grep recipes (interpolated URLs/keys/hrefs, `encodeURIComponent` arguments, async components held in state).
  - `references/phases.md` §6: quick-reference bullet.
  - `references/harness.md` §5: red flag against assuming the id is present when the effect runs.
- Reason: user asked the skill to audit this bug class dynamically on any surface after a transient stale view render issued `GET .../undefined` from a hook. Written generically (any id, route, key or href), not tied to one endpoint.

## 2026-10-04 — Dynamic summary-vs-list consistency rules (aggregate parity, enum coverage, cache invalidation)
- Added:
  - Rules `PAG-11` (summary/dashboard aggregates must use the same exclusion filters as the list they summarize), `PAG-12` (every status/enum value must appear in one breakdown bucket and one filter option), `PAG-13` (breakdown parts must sum to the stated total or an "other" bucket holds the remainder), and `MUT-12` (server-side caches holding derived counts must be invalidated on mutation).
- Changed:
  - `references/pagination.md`: aggregate-parity, enum-exhaustiveness and sum-check guidance with scope-labelling rule, plus checklist items.
  - `references/mutations-forms.md`: server-cache invalidation row (MUT-12) in the mutations table.
  - `references/static-audit.md`: data-flow pass extended with aggregate/filter diffing and enum-to-bucket tracing, plus generic grep recipes for aggregates, exclusion filters, enums, breakdowns, and cache set/del pairing.
- Reason: user asked the skill to audit this bug class dynamically on any UI after a dashboard showed "1 document" while the list showed "0" (tombstone rows counted in the total, a status value missing from every breakdown, and a cached aggregate with no invalidation).

## 2026-10-04 — Human Design Theory (UI/UX for humans not robots) & new feature design trigger expansion
- Added:
  - Reference guide: `references/human-design-theory.md` (comprehensive foundation on cognitive load theory, Sweller/Miller/Hick, Norman's Gulfs of Execution and Evaluation, Gestalt visual perception laws, Weiser's calm technology and peripheral attention, Raskin's Humane Interface and mode errors, Nielsen's recognition over recall, Kahneman's Peak-End rule, human vs robot UI matrix, and audit checklist).
  - Category `HUM` in `rule-catalog.md` with rules `HUM-01` (extraneous cognitive overload / >7 unchunked options), `HUM-02` (wide Gulf of Execution / missing visible affordance), `HUM-03` (wide Gulf of Evaluation / delayed or hidden feedback), `HUM-04` (Gestalt proximity violation), `HUM-05` (modality trap / hidden conflicting system modes), `HUM-06` (recall over recognition / manual code entry), `HUM-07` (attention hijacking / non-calm interruptions), `HUM-08` (hostile peak-end resolution / unguided error crashes).
- Changed:
  - `SKILL.md`: streamlined frontmatter description to automatically trigger whenever performing ANY UI/UX work (implementing new feature views/screens, building forms/modals, or redesigning/decluttering/fixing existing UI); updated Phase 0 table for new UI feature flows without bloating the main skill.
  - `phases.md`: updated §1c and §1d to clearly guide designing new UI features (defining user mental models and cognitive chunking before writing code, and validating against all catalog rules before building).
  - `rule-catalog.md`: added `HUM` to contents and sources (Norman, Raskin, Sweller, Weiser, Kahneman).
  - `harness.md`: updated Gate G1 example and added red flag against treating data schemas as human interfaces.
  - `phases.md`: updated implement slice order in §4 and added human design theory principles to §6 key design rules.
  - `static-audit.md`: added human cognitive & emotional experience pass to §3.
  - `plan-template.md`: added Human cognitive & emotional experience findings subsection and sample findings.
- Reason: user requested that the skill triggers on all UI/UX work (new features and redesigns) and provides clear instructions to follow rules for perfect UI/UX without bloating the main skill.

## 2026-10-04 — Web research rule catalog expansion & strict sequential rule-by-rule enforcement
- Added:
  - Rules `LAY-11` (uncontained absolute/`sr-only` elements leaking scroll height, linked to `scroll-containment.md`) and `LAY-12` (nested uncontained scrollers competing for scroll events)
  - Rules `RSP-14` (sticky bars and floating sheets lacking `env(safe-area-inset-bottom)` safe area padding on mobile) and `RSP-15` (interactive touch targets lacking `touch-action: manipulation` causing 300ms double-tap delay)
  - Rule `DLG-10` (scrollable panels, sheets, or sidebar drawers lacking `overscroll-behavior: contain`)
  - Rules `FRM-15` (paste blocked on input via `onPaste` + `preventDefault`), `FRM-16` (checkbox/radio and label having disjoint hit targets with dead zone), `FRM-17` (unconditional `autoFocus` on mobile viewports causing abrupt zoom/keyboard shift)
  - Rules `CPY-08` (straight quotes in prose instead of typographic curly quotes) and `CPY-09` (missing non-breaking spaces before units or shortcuts causing orphan wrapping)
  - Rule `I18N-06` (untranslated system tokens, SKU/Asset IDs, and acronyms lacking `translate="no"`)
  - Rule `PERF-06` (large dropdown or combobox lists >100 items unvirtualized in DOM)
- Changed:
  - `rule-catalog.md`: appended new rule IDs, updated Sources with Front-End Checklist and modern web guidelines, linked LAY to `scroll-containment.md`.
  - `scroll-containment.md`: added direct rule mappings to `LAY-11` and `LAY-12`.
  - `responsive-fluid.md`: added guidance and patterns for `RSP-14` (safe-area insets), `RSP-15` (`touch-action: manipulation`), and `DLG-10` (`overscroll-behavior: contain`).
  - `mutations-forms.md`: added rules and code examples for `FRM-15` (never block paste), `FRM-16` (unified hit area for checkbox/radio), `FRM-17` (restrained autoFocus).
  - `ux-copy.md`: added guidance for `CPY-08` (curly quotes), `CPY-09` (non-breaking spaces for units/keys), `I18N-06` (`translate="no"` on identifiers).
  - `harness.md`: Gate G1 updated to mandate strict sequential evaluation of every rule ID from first to last without skipping or jumping order; §4 and §5 updated with strict sequence enforcement.
  - `static-audit.md`: §1 and §3 updated with strict sequential walkthrough order and grep recipes for new rules.
  - `phases.md`: §1d, §1f, and §6 updated to enforce strict sequential catalog order from LAY-01 to THM-03 and include new rules in quick reference.
  - `SKILL.md`: primary static analysis and non-negotiables updated to require strict sequential evaluation order (`LAY-01` to `THM-03`); router table updated with `scroll-containment.md`.
  - `plan-template.md`: added sample findings for new rules across relevant categories.
- Reason: user requested deep web research to add missing rules useful for UI redesigns and make the harness strict to follow every rule in order.

## 2026-10-04 — Strict rule-by-rule audit enforcement & harness hardening
- Changed:
  - `references/harness.md`: Gate G1 updated to strictly require every single rule ID from `rule-catalog.md` accounted for in `04-coverage.md` (`VIOLATION` with finding IDs, `PASS` with file:line proof, or justified `N/A`); §4 rewritten to define the mandatory Rule-by-Rule Coverage Ledger format; §5 updated with red flags against lump passes, category skimming, and undocumented audit mental shortcuts.
  - `references/static-audit.md`: §1 updated to mandate individual evaluation of every rule ID in `rule-catalog.md` to build `04-coverage.md`.
  - `references/phases.md`: §1d, §1e, and §1f updated to require full rule-by-rule audit verification and Gate G1 passing conditions before moving to `PLAN.md`.
  - `SKILL.md`: Phase 1, primary static analysis method, and Non-negotiables updated with mandatory rule-by-rule accounting in `04-coverage.md`.
  - `references/updating-skill.md`: §3 updated with strict rule enforceability and gate/coverage integrity standards for future skill maintenance.
  - `references/plan-template.md`: §5 findings template updated to note mandatory rule-by-rule coverage verification in `04-coverage.md` under Gate G1.
- Reason: user requested making the main skill, harness, and future updates strict so AI cannot miss full audits for all mentioned rules.

## 2026-10-03 — Soulful Design Theory integration: craft, tactile finish, concentric geometry, optical alignment, and out-of-the-box UI/UX perfection
- Added: `references/soulful-design.md` (comprehensive guide on soulful design theory, beyond assembly-line software, Don Norman's 3 levels of emotional experience, the 7 pillars of soulful UI/UX craft, concentric machining geometry / Doppelrand rule R_inner = R_outer - P, tactile mechanical depression and fidgetability, optical alignment vs geometric bounding boxes, living state continuity / 1:1 skeleton twin FLIP crossfades, surface luminance tiers and crisp hairline illumination, human dignity voice, and diagnostic audit checklist); rules `SOUL-01` (flat/dead controls with no active depression), `SOUL-02` (non-concentric nested radii), `SOUL-03` (uncompensated optical misalignment), `SOUL-04` (jarring state transitions / layout jumps), `SOUL-05` (monotone cookie-cutter layout devoid of spatial rhythm), `SOUL-06` (muddy drop shadows or fake glows instead of hairline luminance), `SOUL-07` (disconnected spatial provenance), `SOUL-08` (artificial, patronizing, or robotic voice), `SOUL-09` (lack of fidgetable/satisfying mechanical tactile feedback), `SOUL-10` (fragile edge handling with 0, 1, or 10,000 items)
- Changed: `rule-catalog.md` (Contents line, Sources, and new SOUL category with SOUL-01..SOUL-10), `SKILL.md` (frontmatter description updated, router table row added for soulful-design.md), `static-audit.md` (per-file pass §3 updated with Soulful design block, grep recipes §5 updated for SOUL), `plan-template.md` (§5 findings template updated with Soulful design subsection and sample findings), `phases.md` (§4 implement slice order, §5 verify checklists, §6 key design rules), `anti-slop.md` (bridged anti-slop with soulful design so removing slop does not leave a sterile void, added soulful craft item to checklist), `harness.md` (§5 red flag against sterile UI void without soulful craft)
- Reason: user requested researching soulful design theory for UI/UX and updating this skill for flawless, consistent, out-of-the-box UI/UX perfection

## 2026-10-03 — Comprehensive Accessibility (A11Y) audit & WCAG 2.2 AA integration
- Added: `references/accessibility.md` (comprehensive accessibility guide covering native HTML first, accessible names, keyboard navigation & focus architecture, visible focus with ≥3:1 contrast, WCAG 2.2 SC 2.4.11 focus not obscured, color & contrast standards, WCAG 2.2 SC 2.5.8 target sizes, SC 2.5.7 dragging alternatives, form & error linkage with aria-describedby, SC 3.3.7 redundant entry, SC 3.3.8 accessible authentication, dynamic live regions & announcements, APG widget patterns, and audit checklist); rules `A11Y-12` (focus obscured by sticky headers/chrome), `A11Y-13` (dragging-only interactions without pointer/keyboard alternatives), `A11Y-14` (keyboard traps), `A11Y-15` (positive tabIndex), `A11Y-16` (ARIA misuse and aria-hidden on focusable elements), `A11Y-17` (nested interactive elements), `A11Y-18` (form inputs missing accessible error/help description), `A11Y-19` (redundant data entry), `A11Y-20` (cognitive test in authentication without accessible alternative)
- Changed: `rule-catalog.md` (linked A11Y to accessibility.md and appended A11Y-12..A11Y-20), `SKILL.md` (frontmatter description updated with accessibility audits, router table row added for accessibility.md), `static-audit.md` (dedicated Accessibility & assistive tech per-file pass in §3 and grep candidate finders in §5), `phases.md` (§1d static audit, §4 implement slice order, §5 verify checklists, §6 key design rules), `plan-template.md` (dedicated Accessibility A11Y findings subsection with sample findings), `harness.md` (§5 red flags against accessibility shortcuts)
- Reason: user requested researching web best practices and updating the skill with a dedicated, comprehensive accessibility (a11y) section audit

## 2026-10-03 — UI design hierarchy with soul, craft, harmonic type scale, and tonal surface depth
- Added: rules `HIE-09` (monotone visual weight across components), `HIE-10` (competing secondary anchors / badges / icon clutter), `HIE-11` (unscaled typographic jumps without modular ratio scale), `HIE-12` (depth through shadow soup instead of surface luminance)
- Changed: `hierarchy-declutter.md` (re-architected with research on visual hierarchy with soul, the "No-Asset Monochrome" test, dominant focal anchor, harmonic typography scales, optical leading and tracking calibration, editorial whitespace pacing tiers, and surface luminance architecture over blurry drop shadows), `rule-catalog.md` (appended HIE-09..HIE-12 and updated Sources), `static-audit.md` (audit questions in §3 per-file pass and grep recipes for HIE-11/HIE-12), `phases.md` (§6 quick reference updated with hierarchy with soul & craft), `plan-template.md` (§5 sample findings for HIE-09..HIE-12 and §6 Type & spacing scale ratios and surface elevation tiers)
- Reason: user requested researching web best practices for UI design hierarchy with soul and updating the hierarchy section of this skill

## 2026-10-03 — Action button deduplication, shared forms across pages, micro-interactions and animations
- Added: `references/motion.md` (principles of micro-interactions, 100ms rule, composited properties, duration/easing budget, accessibility & prefers-reduced-motion); rules `HIE-08` (duplicate/redundant buttons with same action), `CON-06` (duplicate component or form implementations across routes), `FRM-14` (separate create/edit forms diverging instead of polymorphic component), `MOT-06` (lack of active/press micro-feedback), `MOT-07` (abrupt state transitions), `MOT-08` (layout thrashing animations), `MOT-09` (sluggish micro-interactions >250ms), `MOT-10` (abrupt skeleton-to-content transition)
- Changed: `rule-catalog.md` (new rule IDs, linked MOT to motion.md), `hierarchy-declutter.md` (§6 Actions expanded with button deduplication, canonical trigger placement, scroll-aware sticky action bars, empty state vs toolbar deduplication), `consistency.md` (unifying repeated forms & components across pages, polymorphic form pattern), `mutations-forms.md` (§2 Forms updated with shared create/edit form architecture and single submit button rules), `anti-slop.md` (motion tells and micro-interaction guidelines), `static-audit.md` (audit questions and grep recipes for duplicate buttons, shared forms, and micro-interactions), `plan-template.md` (motion & micro-interactions findings, consistency form reuse row), `phases.md` (§6 Key design rules updated), `bug-checklist.md` (checks for duplicate buttons, shared forms, and micro-interactions), `SKILL.md` (frontmatter description, router table row for `motion.md`)
- Reason: user requested updating the skill to deduplicate unwanted repeated buttons with same actions, unify repeated components and forms across pages, add micro-interactions and animations, and research web best practices

## 2026-10-03 — Skeletons must be redesigned with new UI (no legacy skeleton reuse)
- Added: rule `LDG-11` (legacy skeleton reused for redesigned UI) in `rule-catalog.md`
- Changed: `plan-template.md` (§10 & §13 require planning skeleton redesign for new UI instead of reusing old skeletons), `loading-states.md` (mandatory skeleton redesign rule & checklist item), `phases.md` (§2 Plan, §4 Implement, §6 Key design rules), `static-audit.md` (audit check for legacy skeleton reuse), `harness.md` (red flag against reusing old skeletons), `SKILL.md` (non-negotiable rule)
- Reason: user requested that when planning a UI redesign, skeleton redesign is explicitly added to match the new UI instead of reusing old skeletons

## 2026-10-02 — Skill maintenance mode
- Added: `references/updating-skill.md` (how to update this skill: cascade map, writing rules, verification), this changelog
- Changed: SKILL.md (mode table entry and router row for skill updates; description trigger)
- Reason: user wants new issues and features added to the skill without running a redesign

## 2026-10-02 — Harness, scope modes, full audit categories
- Added: `harness.md` (ledger, gates, proof rule, red flags), `static-audit.md`, `rule-catalog.md` (rule IDs), `mutations-forms.md`, `react-hooks.md`, `phases.md`
- Changed: SKILL.md shortened to routing, modes and gates; declutter made mandatory; plan template tied to the ledger; scripts made optional
- Retired: `bug-checklist.md` (merged into `rule-catalog.md`)

## 2026-10-01 — Pagination, loading states, consistency
- Added: `pagination.md`, `loading-states.md`, `consistency.md`, `scripts/scan_patterns.mjs`; loading-shot and press checks in `scripts/ui_audit.mjs`

## 2026-09-28 — Project DESIGN.md as the authority
- Changed: `design-md.md` reads the user's own DESIGN.md in any format; all guides marked as defaults

## 2026-09-28 — First version
- Five-phase workflow; hierarchy, responsive, anti-slop, copy guides; `scripts/ui_audit.mjs`
