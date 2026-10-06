---
name: ui-redesign
description: Use whenever performing ANY UI/UX work - designing new UI/UX features, building views, modals, forms, or screens, or redesigning, decluttering, auditing, and fixing existing UI. Enforces human design theory (for humans not robots), cognitive load, Gestalt, calm technology, soulful craft, accessibility (WCAG AA), motion, loading/skeletons, forms, scroll containment, and UX copy. Applies whenever authoring, updating, or fixing any frontend user-facing code. Also use when updating this skill.
---

# UI Redesign

Redesign or fix an existing UI so it is decluttered, clear, consistent, fully responsive and bug-free, following the project's own DESIGN.md.

**Updating the skill itself?** If the user asks to change this skill (add rules for issues found, new features or categories, fix guidance), don't redesign anything: follow `references/updating-skill.md` and skip everything below.

**This skill is enforced by a ledger and gates. Read `references/harness.md` before doing anything else.** Each phase writes a file; a phase may not start until the previous gate passes. Skipping a step, or claiming one without its file entry, counts as not doing it.

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
| 1 | Research | DESIGN.md → digest. Trace the surface and **read every file in full**. Static audit against **every rule ID in the catalog**. Optional runtime check. Falsify pass. | `01-design.md` `02-inventory.md` `03-findings.md` `04-coverage.md` (FULL) | G1 |
| 2 | Plan | Plan from the template. Every finding ID in a slice or Deferred. Layout changes: declutter table + wireframes at phone/tablet/desktop. | `PLAN.md` | G2 |
| 3 | Approval | Short summary, ask Approve / Change / Reject. **No source edits before approval.** Silence is not approval. | `PLAN.md` § Approval | G3 |
| 4 | Implement | Slice by slice. Tokens and shared primitives only. Only ledger findings get fixed; new ones go into the ledger first. | `05-progress.md`, statuses in `03-findings.md` | G4 |
| 5 | Verify | Typecheck/lint/tests run now; re-read every changed location; re-run checks; evidence per finding. | `06-verify.md` | G5: zero `open` findings |

Step-by-step detail for each phase: `references/phases.md`.

**Static analysis is the primary audit** (`references/static-audit.md`): read code file by file against every rule in `references/rule-catalog.md`. Every rule ID must be accounted for **in strict sequential order** in `04-coverage.md` (`VIOLATION` with finding, `PASS` with code proof, or justified `N/A`). Grep and the bundled scripts only produce candidates or runtime evidence; they never replace reading, and a script passing never proves a category clean.

## Which reference, when

Read only what the current step needs.

| When | Read |
|---|---|
| Start (always) | `harness.md` - ledger, gates, finding format, red flags |
| Running each phase | `phases.md` |
| Reading DESIGN.md | `design-md.md` |
| Auditing | `static-audit.md` + `rule-catalog.md` |
| LAY, HIE - layout, hierarchy, declutter | `hierarchy-declutter.md`, `scroll-containment.md` |
| RSP, DLG - responsive, wrapping, dialogs, scroll containment | `responsive-fluid.md`, `scroll-containment.md` |
| LDG, STA - loading, skeletons, pending buttons, states | `loading-states.md` |
| PAG - lists, pagination | `pagination.md` |
| TAB - tables, data grids | `tables-data-grids.md` |
| MUT, FRM, ERR - mutations, forms, errors | `mutations-forms.md` |
| UPL - file uploads, drag-and-drop | `file-uploads.md` |
| NOT - toasts, notifications, alerts | `notifications-toasts.md` |
| HOOK - React hooks | `react-hooks.md` |
| A11Y - accessibility, keyboard, contrast, ARIA | `accessibility.md` |
| CON - consistency | `consistency.md` |
| SLOP, CPY - visual slop, copy | `anti-slop.md`, `ux-copy.md` |
| MOT - motion, micro-interactions | `motion.md` |
| SOUL - soulful design, craft, tactile finish | `soulful-design.md` |
| HUM - human design theory (for humans, not robots) | `human-design-theory.md` |
| Writing the plan | `plan-template.md` |
| Updating this skill (not a UI) | `updating-skill.md` |
| Optional runtime evidence & plan evaluation | `scripts/ui_audit.mjs`, `scripts/scan_patterns.mjs`, `scripts/evaluate_audit.py` |

## Non-negotiables

- **Scope is respected.** FOCUSED touches only the named problems; FULL leaves no catalog category or individual rule ID unchecked.
- **Every rule ID is audited in strict sequential order.** In FULL mode, `04-coverage.md` must account for every rule ID individually in exact numerical sequence (`LAY-01` to `THM-03`, including `TAB-01` to `TAB-07`, `UPL-01` to `UPL-06`, `NOT-01` to `NOT-05`, and `HUM-01` to `HUM-08`) with concrete line-referenced proof or finding IDs. Blanket category-level skips, out-of-order evaluations, or unverified "clean" claims fail Gate G1.
- **Every file in the surface is read in full** - child components, dialogs, hooks, and the API/server code behind lists and mutations.
- **Every finding has a rule, quoted evidence, one fix, a severity and a status.** No finding without proof; no fix without a finding.
- **Declutter before restructure.** A layout redesign decides Keep / Remove / Merge / Demote / Defer / Move for every visible element.
- **Skeletons match redesigned UI.** When layout or components change, skeletons are redesigned in tandem to match the new UI - never reuse legacy skeletons.
- **Behaviour is preserved.** Handlers, data hooks, routes, test ids and accessible names keep working. Backend changes (e.g. pagination) only as planned and approved, with every caller updated.
- **Out-of-surface or risky problems** (auth, data integrity, other features) are logged and deferred, not fixed silently.
- **Evidence before claims.** Never write "done", "fixed" or "works" without the command output, re-read line or screenshot that proves it, produced in this message.

## Final report (after G5)

Short: mode and scope → what changed (by region/component) → findings by status (fixed / deferred with reasons / rejected) → check results (typecheck, lint, tests; runtime numbers before → after if run) → "Noticed, out of scope" (FOCUSED) → proposed DESIGN.md additions.
