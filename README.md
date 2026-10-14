<div align="center">
  <img src="assets/cover/ui-redesign-cover.png" alt="UI Redesign Cover" width="100%" />

# UI Redesign

<p>
    <a href="./README.md"><img src="https://img.shields.io/badge/version-7.0.0-indigo.svg" alt="Version 7.0.0" /></a>
    <a href="#usage"><img src="https://img.shields.io/badge/install-npx%20skills%20add-171717.svg" alt="Install with npx skills add" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
    <a href="./references/rule-catalog.md"><img src="https://img.shields.io/badge/rules-322%20cataloged-emerald.svg" alt="322 Rules" /></a>
    <a href="./phases.md"><img src="https://img.shields.io/badge/gates-G0..G5-purple.svg" alt="Gates G0..G5" /></a>
    <a href="./references/accessibility.md"><img src="https://img.shields.io/badge/WCAG-2.2%20AA-sky.svg" alt="WCAG 2.2 AA" /></a>
    <a href="./references/taste-engineering.md"><img src="https://img.shields.io/badge/taste-Three%20Dials-amber.svg" alt="Three Dials" /></a>
  </p>
</div>

A skill for auditing, decluttering, and redesigning frontend user interfaces. Enforces project `DESIGN.md` tokens, human cognitive laws, WCAG 2.2 AA accessibility, responsive layout stability, and state integrity through a gate-enforced ledger. Always integrates the `antislop` skills family (`antislop`, `antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, `antislop-code`) when available in the environment.

## What It Does

1. **Reads Project Specifications**: Extracts semantic tokens and conventions from the repository's `DESIGN.md`.
2. **Discovers Archetype & Domain**: Classifies the product (B2B SaaS, internal operations cockpit, high-density workbench) and conducts mandatory external research (`search_web`, docs) to identify market standards before designing.
3. **Audits File-by-File**: Evaluates every component against 322 concrete rules across 27 categories. `scripts/verify_ledger.mjs` generates the coverage ledger and re-checks every `PASS` quote, `N/A` claim and finding against the real source files, so a hallucinated or rubber-stamped audit fails.
4. **Calibrates Aesthetics**: Sets density, motion, and layout variance using the Three Dials framework.
5. **Declutters Before Restructure**: Runs a Keep/Remove/Merge/Demote/Defer/Move pass on all visible elements.
6. **Builds One Interactive Concept, Tweaked With You**: Picks the best direction from the archetype and research (three one-line directions are compared in text), builds a single clickable HTML prototype with working dialogs, toasts, dark mode and phone/tablet/desktop views, then edits that same concept and the plan in place for every tweak you ask for, logging each in a Revision log. Nothing is built in code until you approve a specific revision.
7. **Verifies Every Step**: Enforces a 6-gate ledger in `.ui-audit/<slug>/` where code edits require user approval and verified test output.

## See It Work

One checkout screen, fixed live. `/ui-redesign` audits the default AI output, pins every violation to its rule ID, then morphs each element into the fixed version while the gate ledger ticks from G0 to G5.

<div align="center">
  <img src="assets/showcase/ui-redesign-demo.gif" alt="Animated demo: an AI-slop checkout screen is audited, 10 findings are pinned to rule IDs, then every element morphs into the fixed UI until zero findings remain" width="100%" />
</div>

| Slop (before)                         | Fixed (after)                          | Rule                |
| ------------------------------------- | -------------------------------------- | ------------------- |
| Emoji hype badge                      | Removed                                | `CPY-05`, `LAY-01`  |
| Gradient headline                     | Plain "Payment details"                | `SLOP-02`           |
| 1.9:1 grey subtitle                   | AA contrast, plain words               | `A11Y-04`           |
| Icon feature-card row                 | One line of text                       | `SLOP-03`, `LAY-02` |
| Placeholder-only fields               | Visible, linked labels                 | `FRM-01`            |
| "Error: Invalid input!" banner        | Inline error with cause and fix        | `CPY-02`, `FRM-03`  |
| Two glowing primary buttons, "Submit" | One primary "Pay $72.36", quiet "Back" | `HIE-02`, `CPY-01`  |
| Mixed money formats, glow total       | Right-aligned tabular amounts          | `CON-03`, `HIE-06`  |

## The Three Dials

Interface density, motion, and layout variance are calibrated using three numerical parameters (1 to 10) documented in [`references/taste-engineering.md`](./references/taste-engineering.md):

| Dial               | Range   | Calibration                                                                                                                                                                   |
| ------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DESIGN_VARIANCE`  | 1 to 10 | 1-3: Strict 12-column grid.<br>4-7: Asymmetric white-space and offset columns.<br>8-10: Expressive grid with masonry and fractional tracks.                                   |
| `MOTION_INTENSITY` | 1 to 10 | 1-3: Static layouts with 100ms press micro-feedback only.<br>4-7: Fluid state transitions (150-200ms cubic-bezier).<br>8-10: Pinned sticky stacks and scroll choreography.    |
| `VISUAL_DENSITY`   | 1 to 10 | 1-3: Airy gallery layout with wide padding.<br>4-7: Standard SaaS spacing (`py-12` to `py-20`).<br>8-10: High-density data cockpit with tight hairlines and tabular numerals. |

### Presets

- **Internal Tools / Dashboards**: `VARIANCE` 3-4, `MOTION` 2-3, `DENSITY` 8-9
- **B2B SaaS Views**: `VARIANCE` 6-7, `MOTION` 5-6, `DENSITY` 4-5
- **Editorial / Documentation**: `VARIANCE` 4-5, `MOTION` 2-3, `DENSITY` 5-6

## The 6-Gate Pipeline

All audit work is recorded in `.ui-audit/<surface-slug>/`. A phase cannot begin until the preceding gate passes.

| Phase            | Output File                                                           | Gate Requirement                                                                                                         |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **0. Scope**     | `00-scope.md`                                                         | Gate G0: Verbatim user request and mode (FULL or FOCUSED) recorded.                                                      |
| **1. Research**  | `01-design.md`, `02-inventory.md`, `03-findings.md`, `04-coverage/`  | Gate G1: 100% of surface files read in full; archetype & external domain research documented; the G1 script passes (every rule row, every quote found in the source). |
| **2. Plan**      | `PLAN.md`, `concepts/`                                                | Gate G2: the G2 script passes (one concept, no unlisted colours, verbatim copy, traced blocks), flow tables, all findings assigned to slices.              |
| **3. Approval**  | `PLAN.md` (§ Approval)                                                | Gate G3: Explicit user approval of a specific concept revision (`Approved rev N`). No code edits before this gate. |
| **4. Implement** | `05-progress.md`, `03-findings.md`                                    | Gate G4: Slice-by-slice implementation with verified test outputs and commit hashes.                                     |
| **5. Verify**    | `06-verify.md`                                                        | Gate G5: the G5 script passes (zero open, fixed findings verified in source, commit SHAs real), typecheck clean, tests pass.                                                                |

## Rule Catalog Summary (322 Rules · 27 Categories)

Rules are detailed with pass/fail criteria and grep recipes in [`references/rule-catalog.md`](./references/rule-catalog.md):

| Domain                 | Category                                                        | Core Checks                                                                                                                                                                                                      |
| ---------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout & Hierarchy** | `LAY`, `HIE`, `RSP`, `DLG`, `FLW`                                | Headline wrap caps, hero viewport stability, single primary focal anchor, surface luminance depth tiers, zero horizontal overflow (320-1920px), scroll containment, safe-area insets, flow-table per-step validation gates & fail-path landing. |
| **States & Data**      | `STA`, `LDG`, `PAG`, `TAB`                                      | Redesigned skeletons matching new UI layout 1:1, empty states with recovery actions, backend pagination contracts, right-aligned tabular numerals, opaque sticky table headers.                                  |
| **Forms & Actions**    | `MUT`, `FRM`, `UPL`, `ERR`, `NOT`                               | Double-submit guards, optimistic rollback, paste preservation, submit button safety, window drop containment, persistent error codes, hover-paused alert timers.                                                 |
| **Engineering & A11y** | `HOOK`, `A11Y`, `NAV`, `PERF`                                   | React 19 hook dependency safety, no stale closures, WCAG 2.2 AA contrast (4.5:1), visible focus rings, native buttons, command palette states, search request cancellation.                                      |
| **Craft & Copy**       | `CON`, `CPY`, `SLOP`, `MOT`, `SOUL`, `HUM`, `I18N`, `THM`, `AI` | Page Theme Lock, Color Consistency Lock, Doppelrand concentric radius math, absolute zero em-dash ban, middle-dot rationing, eyebrow pill caps, motivated motion (<=250ms), cognitive load limits (max 7 items). |

## File Reference Map

```
.agents/skills/ui-redesign/
├── SKILL.md                          # Primary agent entrypoint and router (<= 100 lines)
├── README.md                         # Technical overview and quick reference
├── CHANGELOG.md                      # Release ledger and provenance
├── LICENSE                           # MIT License
├── assets/
│   ├── cover/                        # Top cover banner
│   ├── logo/                         # Brand identity and marks
│   └── showcase/                     # Animated slop-to-fixed demo GIF
├── references/
│   ├── taste-engineering.md          # Three Dials, brief inference, GSAP motion patterns
│   ├── rule-catalog.md               # 322 auditable rule IDs with exact failure conditions
│   ├── harness.md                    # Ledger protocol, gate criteria G0-G5, proof rules
│   ├── static-audit.md               # File-by-file audit questions and grep candidate finders
│   ├── plan-template.md              # PLAN.md template with declutter tables and wireframes
│   ├── interactive-prototypes.md     # One concept, direction choice, fidelity rules, tweak loop
│   ├── platform-quality.md           # PERF, I18N, THM guide and newer platform rules (forced-colors, :user-invalid, View Transitions, LCP, 403, 429)
│   ├── phases.md                     # Step-by-step instructions for Phases 0 through 5
│   ├── craft.md                      # Anti-slop rules, cognitive load laws, and tactile craft
│   ├── hierarchy-declutter.md        # Focal hierarchy, whitespace pacing, and layout rhythm
│   ├── responsive-fluid.md           # Breakpoints, typography fluid scaling, scroll containment
│   ├── motion.md                     # Micro-feedback, state transitions, and GSAP hygiene
│   ├── ux-copy.md                    # Voice, microcopy, punctuation, and middle-dot rules
│   ├── consistency.md                # System-wide reuse and theme/color locks
│   ├── loading-states.md             # Skeletons, empty states, and first-run checklists
│   ├── mutations-forms.md            # Write mechanics, form safety, and error handling
│   ├── tables-data-grids.md          # Data table alignment, sticky headers, row actions
│   ├── file-uploads.md               # Drop containment, previews, and batch progress
│   ├── notifications-toasts.md       # Alert permanence, pause triggers, and batching
│   ├── react-hooks.md                # Hook dependency hygiene and race condition guards
│   ├── accessibility.md              # WCAG 2.2 AA checklists, keyboard traversal, ARIA
│   ├── ai-ux.md                      # Streaming UX, citations, and uncertainty indicators
│   ├── design-md.md                  # Reading and digesting project design specifications
│   ├── pagination.md                 # Pagination contracts, URL state, cursor mechanics
│   └── updating-skill.md             # Self-maintenance guidelines and verification tests
└── scripts/
    ├── verify_ledger.mjs             # Gate checker: init + check G1/G2/G5 against the real source
    ├── scan_patterns.mjs             # Candidate discovery scanner
    └── ui_audit.mjs                  # Playwright runtime audit engine
```

## Usage

```bash
# Install as an agent skill (Claude Code, Codex, Cursor, OpenCode, …)
npx skills add rashee1997/ui-redesign

# Full view redesign
/ui-redesign Redesign the invoices page to match our updated DESIGN.md

# Focused fix
/ui-redesign Fix mobile sheet overflow and missing pending states on checkout
```

## License

MIT. See [LICENSE](./LICENSE).
