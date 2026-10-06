# Harness - how this skill is enforced

This skill is long because UI work has many ways to go wrong. Agents skip steps when a task "looks simple": they read one file, fix what they noticed, and call it done. The harness below stops that by making every step leave a file behind, and by not letting the next step start until the previous file is complete. **The files are the proof of work. No file, no step.**

**Violating the letter of these rules is violating the spirit of them.** "I did it in my head" or "I checked, there was nothing" without the file entry counts as not done.

## Contents
1. The ledger folder
2. Gates
3. Finding format and the proof rule
4. Coverage matrix (full audit)
5. Red flags and rationalizations
6. Context resets and long runs

## 1. The ledger folder

Create `.ui-audit/<surface-slug>/` at the start (add `.ui-audit/` to `.gitignore` if the user doesn't want it committed - ask once). Files, in the order they're written:

| File | Written in | Must contain (required slots) |
|---|---|---|
| `00-scope.md` | Phase 0 | the user's request **verbatim**; mode (FOCUSED / FULL); the target surface (route + entry file); for FOCUSED: the named issues as a numbered list, and which catalog categories they map to |
| `01-design.md` | Phase 1 | DESIGN.md path(s) or "none"; the digest table; Gaps list; conflicts |
| `02-inventory.md` | Phase 1 | every file in the surface with: role, states it handles, **Read: ✔** (each file must be read in full - not grepped) |
| `03-findings.md` | Phase 1 | the findings ledger (§3). Every finding has an ID |
| `04-coverage.md` | Phase 1 (FULL only) | the rule-by-rule coverage ledger (§4) - every individual rule ID in `rule-catalog.md` accounted for with finding IDs or concrete verified pass evidence |
| `PLAN.md` | Phase 2 | the plan (plan-template.md); every finding ID appears in exactly one slice or in "Deferred" with a reason |
| `05-progress.md` | Phase 4 | per slice: files changed, finding IDs closed, deviations, checks run with their output |
| `06-verify.md` | Phase 5 | per finding ID: how it was verified (command output, file:line re-read, screenshot); final checklist results |

Write the files as you go, not at the end. Update the finding status in `03-findings.md` the moment a fix lands.

## 2. Gates

Before starting each phase, open the previous files and check the gate. If a gate fails, go back; do not "carry on and fill it in later".

| Gate | Condition to pass |
|---|---|
| G0 → Research | `00-scope.md` has the verbatim request, a mode, and a target surface |
| G1 → Plan | every file in `02-inventory.md` is marked Read ✔; `01-design.md` has a digest or "none, derived from code"; FULL: every single rule ID from `rule-catalog.md` in `04-coverage.md` is accounted for **in exact sequential catalog order** (with finding IDs or concrete code file:line pass evidence - no blank cells, no unevidenced "clean", no lump category skips, no jumping or omitting IDs); FOCUSED: every named issue has ≥1 finding or a "could not reproduce - evidence" line, and every rule in its mapped categories is fully checked in catalog order |
| G2 → Approval | `PLAN.md` exists; every finding ID is assigned to a slice or Deferred with a reason; wireframes present if layout changes |
| G3 → Implement | the user approved in this conversation (quote their words in `PLAN.md` under "Approval") |
| G4 → Verify | every slice in `05-progress.md` has its checks run with output pasted |
| G5 → Done | `03-findings.md` has **zero rows with status `open`**; every row is `fixed` (with verification in `06-verify.md`), `deferred` (with reason, approved or out of scope) or `rejected` (failed the proof rule); typecheck/lint/tests ran in this message and passed or pre-existing failures are named |

State the gate result in one line when crossing it: `Gate G1: PASS - 14 files read, 22 categories audited, 133/133 rules individually accounted for in 04-coverage.md in strict catalog order, 23 findings.`

## 3. Finding format and the proof rule

`03-findings.md` is one table:

```markdown
| ID | Rule | Where | Problem (evidence) | Fix | Sev | Status |
|---|---|---|---|---|---|---|
| F-001 | MUT-03 | components/invoice-form.tsx:88 | `onSubmit` has no pending guard; `mutate()` can fire twice (no `disabled`, no `isPending` check) | Button `loading={isPending}` + early return | P1 | open |
```

- **ID**: `F-001`… never reused.
- **Rule**: the ID from `rule-catalog.md` (or `DM-<n>` for a DESIGN.md rule, cited by section).
- **Where**: file:line. One finding = one root cause (list extra locations in the same row).
- **Severity**: P0 blocks a task / loses data · P1 broken or WCAG A/AA failure · P2 wrong or confusing · P3 polish.
- **Status**: `open` → `fixed` | `deferred` | `rejected`.

**The proof rule.** A candidate becomes a finding only when it has:
1. **Rule** - a catalog rule or DESIGN.md rule it breaks (not taste).
2. **Evidence** - the exact code (quote it) or rendered result showing the problem in *this* surface. Grep hits are candidates, not findings: open the file and read the context.
3. **Fix** - one concrete correction using existing tokens/components.

Before the plan, run a **falsify pass**: re-open each finding's file and try to prove it wrong (is it handled elsewhere? a wrapper? the primitive already does it? deliberate per DESIGN.md?). If it's wrong, set `rejected` with the reason. Never delete rows.

## 4. Coverage ledger (FULL mode - strict rule-by-rule audit)

A full audit must prove it examined **every individual rule in `rule-catalog.md` in strict sequential order from first to last**, not just high-level categories. Hand-waving ("checked all files, no issues"), blanket category passes, out-of-order evaluations, and lump reviews fail Gate G1 immediately.

`04-coverage.md` must list every category in catalog order, and under each category, account for **every individual rule ID in exact numerical sequence**:

```markdown
### LAY - Layout & declutter
| Rule ID | Rule Summary | Status | Findings / Evidence (file:line) |
|---|---|---|---|
| LAY-01 | No task-less elements | VIOLATION | F-001 (welcome banner in page.tsx:14) |
| LAY-02 | Merge related controls | PASS | page.tsx:45 filter + search already unified in single toolbar |
| LAY-03 | Demote rare actions | PASS | table-row.tsx:82 delete action already in row dropdown menu |
| LAY-04 | No cards in cards | VIOLATION | F-004 (stat card nested inside summary card in page.tsx:88) |
| ... | ... | ... | ... |
```

Status values:
- `VIOLATION`: cites one or more finding IDs (`F-xxx`) in `03-findings.md`.
- `PASS`: quotes the specific file:line or implementation detail proving why this rule is satisfied.
- `N/A`: only permitted when the concept does not exist in the surface (e.g. `MUT-*` or `FRM-*` on a strictly read-only surface with zero forms/writes, `DLG-*` when no dialogs exist). The `N/A` justification must explicitly state why the entire mechanism is absent.

**Gate G1 failure conditions for coverage:**
1. Any rule ID from `rule-catalog.md` omitted or checked out of sequence.
2. Any `PASS` row lacking concrete `file:line` proof or specific implementation evidence.
3. Lump reviews (e.g. `HOOK: all 14 files clean`) without walking each hook rule individually (`HOOK-01` through `HOOK-13`).
4. Claiming `N/A` when the relevant element exists in the surface.

In FOCUSED mode, `00-scope.md` maps each named issue to its categories, and every single rule ID within those mapped categories must be audited with this exact rule-by-rule sequence and rigor.
## 5. Red flags and rationalizations

If you catch yourself thinking one of these, stop and do the step.

| Thought | Reality |
|---|---|
| "It's a small page, I'll skip the ledger" | Small pages still have dialogs, states and mutations. The ledger takes minutes. |
| "I read the main file, I get the idea" | Gate G1 needs every inventory file read. Bugs live in the child components and dialogs. |
| "Grep found nothing, so the category is clean" | Grep finds candidates. Clean needs evidence of what you read. |
| "Checked category at high level, no obvious bugs" | Gate G1 strictly requires every single rule ID evaluated with file:line evidence in `04-coverage.md`. Lump passes fail the gate. |
| "The category doesn't have many bugs, so I'll lump it" | Every rule ID must be listed with `PASS` (citing code proof), `VIOLATION` (citing finding ID), or justified `N/A`. |
| "I will audit rules in my head and write findings only" | If a rule is not documented in `04-coverage.md`, it counts as skipped. |
| "The user asked for a redesign, not bug fixes" | In FULL mode the audit covers everything; bugs found go in the ledger. In FOCUSED mode they go in "Noticed, out of scope". Either way they're written down. |
| "The user asked for X only, but Y is also bad, I'll fix it too" | FOCUSED means focused. Log Y under "Noticed, out of scope", don't touch it. |
| "This is obviously fine, no need to verify" | Every `fixed` row needs a verification line in `06-verify.md`. |
| "The script passed, so it's done" | Scripts are a secondary runtime check. Static review of every file is the primary audit. |
| "Approval is implied, they asked me to do it" | G3 needs explicit approval in this conversation, unless the user said up front not to wait (quote it). |
| "The existing skeleton is fine, no need to touch it" | When UI layout or card structure changes, the old skeleton mismatches the new layout and causes layout shift (CLS). Skeletons must be redesigned to match the new UI. |
| "The UI library handles all accessibility" | Component libraries only supply primitives; omitting labels, killing focus rings, or failing color contrast breaks accessibility in user code. |
| "outline-none looks cleaner" | Invisible focus leaves keyboard users stranded; always provide an explicit, high-contrast `:focus-visible` indicator (A11Y-03). |
| "Removing slop makes it finished" | Stripping gradients and badges prevents bad UI, but without soulful craft (concentric geometry, tactile depression, optical alignment, calm crossfades) the screen remains a sterile, lifeless void (soulful-design.md). |
| "Accessibility is a polish pass for later" | Accessibility is structural (DOM order, semantic elements, labels); bolting it on later forces painful rewrites. |
| "The data model is the UI" | Exposing raw DB columns, unchunked forms, and robotic status strings ignores human cognitive limits; interfaces must be designed for human psychology (human-design-theory.md). |
| "I'll update the ledger at the end" | Update as you go; end-of-task reconstruction is where steps get faked. |
| "Typecheck probably passes" | Run it in this message and paste the result. |
| "Should work now" / "Looks good" | Evidence before claims. Say what you ran and what it returned. |
| "The id is always there by the time the effect runs" | It is not: a URL change or a stale async component renders the effect with `undefined` first (a request to `…/undefined`). Guard the id and gate the component on the key it loaded for (HOOK-14). |
| "The checklists passed once, so it's done" | The audit is a loop, not a one-shot pass: re-audit each changed surface against the SLOP and MOT rules its slices touched and fix any regression before G5. |
| "The child component can just read the root/default item" | It cannot: when the user selects a revision/item in a picker, hardcoded props leave headers, badges, facts, and approval panels frozen on the old item (CON-08). |
| "Buttons without type default to standard buttons" | In HTML forms, `<button>` without type defaults to `type="submit"`, causing utility buttons (file pickers, preview toggles) to fire premature form submissions on click or input Enter (FRM-18). |

## 6. Context resets and long runs

- After a context reset or `/compact`, re-read `00-scope.md`, `03-findings.md` and `05-progress.md` before doing anything else, and continue from the first unfinished slice.
- For big surfaces (> ~15 files), use read-only subagents to read groups of files against specific catalog categories; each must return findings in the §3 format with file:line evidence. You still own the ledger, the falsify pass and the gates. Don't trust a subagent's "no issues" without its evidence column.
- For high-stakes runs, finish with a fresh subagent that reads only `PLAN.md`, `03-findings.md` and the diff, and reports any finding marked `fixed` that the diff doesn't actually fix.
