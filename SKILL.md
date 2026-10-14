---
name: ui-redesign
description: Use whenever performing ANY UI/UX work - designing new UI/UX features, building views, modals, forms, screens, or user flows/steps, or redesigning, decluttering, auditing, and fixing existing UI. Enforces human design theory (for humans not robots), cognitive load, Gestalt, calm technology, soulful craft, accessibility (WCAG AA), motion, loading/skeletons, forms, flow transitions, scroll containment, and UX copy. Applies whenever authoring, updating, or fixing any frontend user-facing code. Also use when updating this skill.
license: MIT
---

# UI Redesign

Redesign or fix an existing UI so it is decluttered, clear, consistent, fully responsive and bug-free, following the project's own DESIGN.md.

**Updating the skill itself?** If the user asks to change this skill (add rules for issues found, new features or categories, fix guidance), don't redesign anything: follow `references/updating-skill.md` and skip everything below.

**This skill is enforced by a ledger, gates and a script.** Read `references/harness.md` before doing anything else. Each phase writes a file; a phase may not start until the previous gate passes, and a gate counts only when `scripts/verify_ledger.mjs` prints PASS for it (it re-opens the source and rejects claims it cannot find). Always load the `antislop` skills (`antislop`, `antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, `antislop-code`) if available; otherwise skip. A step without its file entry, or a gate without the script's output, counts as not done.

## Phase 0 - Scope (always first)

Copy the user's request verbatim into `.ui-audit/<surface>/00-scope.md` and choose the mode:

| The request… | Mode | What gets audited and changed |
|---|---|---|
| asks to design, build or implement a new UI feature/screen/flow | **FULL** | All categories in `references/rule-catalog.md` apply to the new surface. Follow the 7 Human Design Laws to prevent robotic UI before writing code. |
| names specific problems ("fix the pagination", "the save spinner is oval", "dialog overflows on mobile") | **FOCUSED** | Only the named problems - but each one completely, across the whole surface (all rules of its catalog categories). Anything else noticed is logged under "Noticed, out of scope" and **not** touched. |
| asks for a redesign, cleanup, audit or "fix the UI" without naming specific problems | **FULL** | Every category in `references/rule-catalog.md`, every file in the surface. A redesign always includes the declutter pass. |
| names specific problems **and** asks for a redesign | **FULL** | Named problems become at least P1. |

If it's truly unclear, ask one question; otherwise pick and state the mode in one line.

## Order of authority

1. The user's instructions in this conversation
2. The project's DESIGN.md, whatever format the user wrote it in (`references/design-md.md`)
3. The existing code's conventions - tokens, primitives, the app's best pages
4. This skill's references - fallback defaults only

## Phases

| # | Phase | Do | Writes | Gate |
|---|---|---|---|---|
| 1 | Research | DESIGN.md, app archetype & external research → digest. Trace surface, **read every file in full**. Audit every catalog rule via the generated `04-coverage/` ledger. Falsify pass. | `01-design.md` `02-inventory.md` `03-findings.md` `04-coverage/` | G1 (script) |
| 2 | Plan | Plan from template: **flow tables + friction line before wireframes**, three one-line directions in text, **one** traced interactive concept (ledger tokens, verbatim copy, dark mode). | `PLAN.md`, `concepts/` | G2 (script) |
| 3 | Approval | Short summary, ask Approve / Change / Reject. **Change = tweak loop**: edit the one concept and plan in place, log it in the Revision log. **No source edits before approval** of a specific revision. | `PLAN.md` § Approval, Revision log | G3 |
| 4 | Implement | Slice by slice. Tokens and shared primitives only. Only ledger findings get fixed; new ones go into the ledger first. | `05-progress.md`, statuses in `03-findings.md` | G4 |
| 5 | Verify | Typecheck/lint/tests run now; re-read every changed location; evidence per finding; independent verifier on the diff. | `06-verify.md` | G5 (script): zero `open` |

Step-by-step detail for each phase: `references/phases.md`.

**Static analysis is the primary audit** (`references/static-audit.md`): read code file by file against every rule in `references/rule-catalog.md`. `verify_ledger.mjs init` generates the coverage files with every rule ID in order; each row is `PASS path:line "quote"`, `VIOLATION F-xxx` or `N/A grep:/regex/ reason`, and `check` fails any quote it cannot find, any false `N/A`, any omission. Grep and the other scripts only produce candidates or runtime evidence.

## Which reference, when

Read only what the current step needs.

| When | Read |
|---|---|
| Start (always) | `harness.md` - ledger, gates, finding format, red flags |
| Running each phase | `phases.md` |
| Reading DESIGN.md | `design-md.md` |
| Auditing | `static-audit.md` + `rule-catalog.md` |
| LAY, HIE - layout, hierarchy, declutter | `hierarchy-declutter.md`, `responsive-fluid.md` §9 (scroll) |
| RSP, DLG - responsive, wrapping, dialogs, scroll containment | `responsive-fluid.md` (incl. §9 scroll) |
| FLW - user flow, steps, transitions, friction | `user-flow.md` |
| LDG, STA - loading, skeletons, pending buttons, states | `loading-states.md` |
| PAG - lists, pagination | `pagination.md` |
| TAB - tables, data grids | `tables-data-grids.md` |
| MUT, FRM, ERR - mutations, forms, errors | `mutations-forms.md` |
| UPL - file uploads, drag-and-drop | `file-uploads.md` |
| NOT - toasts, notifications, alerts | `notifications-toasts.md` |
| HOOK - React hooks | `react-hooks.md` |
| NAV - command palette, shortcuts | `responsive-fluid.md` §6 |
| AI - AI chat, streaming, generated answers | `ai-ux.md` |
| A11Y - accessibility, keyboard, contrast, ARIA | `accessibility.md` |
| CON - consistency | `consistency.md` |
| SLOP, CPY - visual slop, copy | `craft.md` §1 + §4 checklists, `ux-copy.md` |
| MOT - motion, micro-interactions | `motion.md` |
| SOUL, HUM - soulful craft, human laws | `craft.md` §§2–3 + §4 checklists |
| Taste engineering & dials | `taste-engineering.md` - Three Dials, brief inference, archetypes |
| The interactive concept and the tweak loop | `interactive-prototypes.md` - one concept, direction choice, fidelity rules, tweak loop |
| PERF, I18N, THM and newer platform rules (FRM-25, A11Y-21, MOT-15, PERF-08, STA-12, ERR-11) | `platform-quality.md` |
| Writing the plan | `plan-template.md` |
| Updating this skill (not a UI) | `updating-skill.md` |
| Gate checks (required) and runtime evidence (optional) | `scripts/verify_ledger.mjs` (gates); `scripts/ui_audit.mjs`, `scripts/scan_patterns.mjs` (candidates, never verdicts) |

## Non-negotiables

- **Scope is respected.** FOCUSED touches only the named problems; FULL leaves no catalog category or individual rule ID unchecked.
- **Every rule is accounted for, and the script says so.** FULL mode: every catalog rule has a row in `04-coverage/` and `verify_ledger.mjs check --gate g1` passes; FOCUSED: the same for the mapped categories (`--categories`). Lumped passes, unquoted `PASS`, unverifiable `N/A` and a hand-written "G1: PASS" fail the gate.
- **Every state-changing flow gets a flow table before wireframes** (Gate G2): per step the entry, user action, validation `file:line`, pass → and fail → landing, plus the friction line; no step advances on invalid input and every failure names where the user lands (`references/user-flow.md`). `N/A: single-screen, no state change` allowed.
- **App archetype & audience discovery precedes design.** Classify product archetype (SaaS / internal tool / consumer) and complete external domain research in `01-design.md`; never plan or prototype blindly.
- **Every file in the surface is read in full** - child components, dialogs, hooks, and the API/server code behind lists and mutations.
- **Every finding has a rule, quoted evidence, one fix, a severity and a status.** No finding without proof; no fix without a finding.
- **Declutter before restructure.** A layout redesign decides Keep / Remove / Merge / Demote / Defer / Move for every visible element.
- **Skeletons match redesigned UI.** When layout or components change, skeletons are redesigned in tandem to match the new UI - never reuse legacy skeletons.
- **One concept, traced, tweaked in place.** Every colour cites the token ledger (`PLAN.md`), every block has `data-trace` to an inventory `file:line`, every feedback string `data-copy` from the codebase; the G2 script rejects the rest. User tweaks edit the same concept and the plan together.
- **Behaviour is preserved.** Handlers, data hooks, routes, test ids and accessible names keep working. Backend changes (e.g. pagination) only as planned and approved, with every caller updated.
- **Out-of-surface or risky problems** (auth, data integrity, other features) are logged and deferred, not fixed silently.
- **Evidence before claims.** Never write "done", "fixed", "checked" or "works" without the command output, re-read line or script PASS line produced in this message. A second reader (harness.md §6) re-reads the script's spot-check rows at G1 and the diff at G5.

## Final report (after G5)

Short: mode and scope → what changed (by region/component) → findings by status (fixed / deferred with reasons / rejected) → check results (typecheck, lint, tests; runtime numbers before → after if run) → "Noticed, out of scope" (FOCUSED) → proposed DESIGN.md additions.
