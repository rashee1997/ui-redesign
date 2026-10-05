# Updating this skill

Use this when the user asks to change **the skill itself**: add rules for issues they found, add a new feature area, fix wrong guidance, or change the workflow. It is maintenance of the skill's files, **not** a redesign:

- Do **not** run the redesign phases, create `.ui-audit/` ledgers, or touch any app code.
- Do **not** rewrite or restyle files that the change doesn't affect.
- Do update **every file the change cascades to**, so the skill stays consistent with itself.

## Contents
1. Steps
2. Cascade map
3. Writing rules
4. Verification
5. Changelog
6. Version control
7. Versioning

## 1. Steps

1. **Capture** the request verbatim and split it into separate change items (one per issue/feature).
2. **Classify** each item with the cascade map (§2): new rule · new category · new feature area/guide · workflow or gate change · correction · script change.
3. **Read before writing**: SKILL.md, `harness.md`, `rule-catalog.md`, `phases.md`, and every reference the item touches - in full. Grep the whole skill for the topic to find existing coverage:
   ```bash
   grep -rn -i "<keyword>" <skill-dir>/SKILL.md <skill-dir>/references
   ```
   If it's already covered, strengthen or correct the existing text instead of adding a duplicate.
4. **Research** when the item is about practice (a bug class, an API, a pattern): check current docs or trusted sources so the rule and fix are correct. Note the source in the reference's Sources line.
5. **Write an update plan** (in the reply, short): each item → files to change → what changes → new files (if any). For a single small rule, proceed directly; for new categories, new guides or workflow changes, show the plan and wait for approval.
6. **Apply** the changes to every file in the item's cascade row.
7. **Verify** (§4), **log** the change (§5), and **commit and tag** (§6).
8. **Package** the skill again if the environment supports it, and report: what changed, per file, in a short list.

## 2. Cascade map

| Change type | Must update | Maybe update |
|---|---|---|
| **New rule in an existing category** (e.g. a new form bug) | `rule-catalog.md` (next free ID in that category); the category's guide (what it is, why, the fix, an example) | `static-audit.md` (per-file question and/or grep recipe if it's detectable in code); the guide's checklist; `phases.md` §6 if it's a key rule |
| **New category** (e.g. "File uploads", "Charts", "Auth screens") | `rule-catalog.md` (new prefix, Contents line, section); a new reference file if the detail is more than ~30 lines; SKILL.md "Which reference, when" row; `static-audit.md` per-file pass + grep recipes; `plan-template.md` findings subsection (and a table if the plan needs decisions for it); `phases.md` (implement slice order, verify step) | `harness.md` red flags if agents are likely to skip it; SKILL.md description (if it adds a new trigger area) |
| **New feature area / stack support** (e.g. Vue, React Native, Svelte) | new reference file; SKILL.md router row; `static-audit.md` (tracing + recipes for that stack); affected rules in `rule-catalog.md` (mark stack-specific rules) | category guides that need a stack-specific note |
| **Workflow or gate change** (new phase step, new ledger file, new gate condition) | `harness.md` (ledger table, gates, red flags); SKILL.md phases table; `phases.md`; `plan-template.md` | final report section in SKILL.md |
| **Scope/mode change** (FOCUSED/FULL behaviour) | SKILL.md Phase 0 table; `harness.md` (coverage, gates); `phases.md` | `plan-template.md` |
| **Correction** (guidance was wrong or outdated) | every place the wrong statement appears (grep for it - code snippets, checklists, quick references) | |
| **DESIGN.md handling** | `design-md.md`; SKILL.md "Order of authority" only if precedence changes | `plan-template.md` §2 |
| **Script change** (only when the user asks) | the script; its usage lines in `static-audit.md` §6 and `phases.md` | test the script on a sample before packaging |

When in doubt whether a file is affected, grep for the category prefix (e.g. `FRM-`) and the topic keywords across the whole skill.

## 3. Writing rules

- **SKILL.md stays short** (aim ≤ ~100 lines): scope modes, authority order, phases table, router, non-negotiables, final report. All detail goes in `references/`. Add only a router row or a one-line non-negotiable there.
- **Strict rule enforceability**: Every new rule must be deterministic, falsifiable, and auditable against concrete code constructs. Avoid subjective or vague rules. If a rule cannot be audited with clear `PASS` vs `VIOLATION` criteria in static code review, refine it until it can.
- **Gate & coverage integrity**: Never loosen Gate G1–G5 conditions or allow lumped/blanket exemptions. Every rule added to `rule-catalog.md` automatically becomes a mandatory item in `04-coverage.md` for FULL audits.
- **New reference files**: start with the "Defaults only" note (DESIGN.md wins), add a Contents list if over ~100 lines, split if over ~300 lines. Name by topic in kebab-case. Link them from SKILL.md's router and from related guides.
- **Rule IDs are permanent**: append new IDs; never renumber or reuse. To remove a rule, keep the line and mark it `(retired - reason)`. Findings in old ledgers must still resolve.
- **Every rule** has: a short statement of the problem, how to detect it (code signal), and the fix - the fix lives in the guide, the one-liner in the catalog.
- **Match the existing style**: plain imperative sentences, explain why, concrete code examples using the project's tokens/primitives, tables for decisions.
- **Keep precedence**: user → project DESIGN.md → codebase conventions → skill defaults. Don't write rules that override DESIGN.md.
- **Static analysis stays primary**: new checks are written as things to read for and grep recipes. Don't make a script the only way to find something. Don't add or change scripts unless the user asks.
- **Description stays triggers-only** ("Use when…"): no workflow summary. Keep it under 1024 characters.
- **No Claude Code hooks** in the skill frontmatter.
## 4. Verification

Run all of these and fix any failure before reporting:

```bash
D=<skill-dir>
# 1. Every reference mentioned exists, and every reference file is reachable from SKILL.md or another reference
for f in $(grep -oh '`[a-z0-9-]*\.md`' $D/SKILL.md $D/references/*.md | tr -d '`' | sort -u); do [ -f $D/references/$f ] || echo "MISSING: $f"; done
for f in $D/references/*.md; do b=$(basename $f); grep -q "$b" $D/SKILL.md $D/references/*.md --exclude=$b || echo "ORPHAN: $b"; done
# 2. Rule IDs unique
grep -oh '^- [A-Z0-9]*-[0-9][0-9]' $D/references/rule-catalog.md | sort | uniq -d
# 3. IDs cited in guides exist in the catalog
for id in $(grep -oh '\b[A-Z0-9]\{2,5\}-[0-9][0-9]\b' $D/references/*.md | sort -u); do grep -q -- "- $id " $D/references/rule-catalog.md || echo "UNKNOWN ID: $id"; done
# 4. Sizes
wc -l $D/SKILL.md $D/references/*.md
# 5. Stale terms from the change (old names, removed files)
grep -rn "<old term>" $D
```
Expected false positives: "MISSING" for ledger file names (`00-scope.md` … `06-verify.md`) and project file names (`design-system.md`, `style-guide.md`); "UNKNOWN ID" for examples like `F-001` or `DM-1`. Anything else is a real problem.

Then re-read SKILL.md top to bottom once, as an agent seeing it for the first time: is the new thing reachable from the router, and does nothing contradict it?

## 5. Changelog

Append to `CHANGELOG.md` at the skill root, newest first, one entry per version. With the skill-creator skill available, `python <skill-creator>/scripts/changelog.py <skill-dir> --bump major|minor|patch --summary "…" --added … --changed … --reason … --sources …` computes the version and writes the entry. Otherwise write it by hand:

```markdown
## <MAJOR.MINOR.PATCH> (<YYYY-MM-DD>): <one-line summary>
- Added: <rules/IDs, files>
- Changed: <files and what>
- Retired: <IDs and why>
- Reason: <the user's request or the issue found>
- Sources: <links, if research was done>
```

## 6. Version control

Every skill is a self-contained git repository. Commit every change; tag every version.

- If `<skill-dir>/.git` is missing, initialize it.
- One version (one changelog entry) = one commit and one annotated tag `v<MAJOR.MINOR.PATCH>`. The tag mirrors the newest `CHANGELOG.md` heading; never tag without a changelog entry.
- Commit message: `<type>: <summary> (v<version>)` (imperative: feat, fix, docs, chore, refactor).
- Commit only the skill's own files; never caches, build output or the `.skill` package.
- The changelog is the single source of truth for the version; the git tag is derived from it.

With the skill-creator skill available, `python <skill-creator>/scripts/version_control.py <skill-dir>` initializes the repo if needed, commits, and tags `v<version>` from the newest changelog heading (`--dry-run` previews). By hand:

```bash
git -C <skill-dir> init
git -C <skill-dir> add -A
git -C <skill-dir> commit -m "<type>: <summary> (v<version>)"
git -C <skill-dir> tag -a v<version> -m "<summary>"
```

## 7. Versioning

Semantic versions `MAJOR.MINOR.PATCH`; the source of truth is the newest heading in `CHANGELOG.md` (stored nowhere else, so it cannot drift).

- MAJOR: a workflow step, gate or mode is added, removed, renamed or renumbered, or a check now rejects output the previous version accepted.
- MINOR: new behaviour that leaves earlier work valid (new rules, references, scenarios).
- PATCH: corrections only (wording, links, sources, line numbers).
- Numbers only go up; never reuse or edit a packaged version. Fix a mistake with a new PATCH entry.
- One version per update request; the highest bump among its items wins.
- A bump resets the lower parts: `2.1.3` -> `3.0.0` (MAJOR), `2.2.0` (MINOR), `2.1.4` (PATCH).
- When unsure between two levels, take the higher one.
