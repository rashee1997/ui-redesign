# Changelog

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
