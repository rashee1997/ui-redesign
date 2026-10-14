# Redesign plan template

Write this as `.ui-audit/<surface>/PLAN.md` (see harness.md). Fill every section that applies to the mode; in FOCUSED mode, sections for categories outside the scope are replaced by one line: "Out of scope (FOCUSED)". Delete hints in *italics*. Keep it scannable: the user approves from this.

**Required slot:** every finding ID from `03-findings.md` must appear in exactly one slice in §13, or under "Deferred" with a reason. Gate G2 fails otherwise.

## Contents
1. Summary · 2. Design language · 3. Declutter / cognitive chunking · 4. Task priority · 4b. User flow · 5. Findings by category · 6. Structure & layout mechanics · 7. Copy changes · 8. Consistency · 9. Pagination contract · 10. Loading & pending · 11. Mutations & forms · 12. Proposed tokens & components · 13. Slices & rollout · 14. Out of scope & questions

~~~~markdown
# Redesign plan: <Page / feature name>

Status: DRAFT - waiting for approval
Route: /<route>     Date: <date>
Mode: FULL | FOCUSED (<named issues 1…n>)
Request (verbatim): "<user's words>"
Findings: <n> total - P0 <n> · P1 <n> · P2 <n> · P3 <n> (ledger: 03-findings.md)

## Approval
Chosen direction: <Structured | Balanced | Contextual | custom> - <one-sentence reason tied to the audience>
Approved: <empty until the user approves - then `Approved rev N` and their verbatim words with date>

## 1. Summary
<3-5 lines: what's wrong today, what the redesign does, what stays the same.>

### App archetype, target audience & domain research
- **Archetype**: <B2B SaaS | Internal Tool / Operations Cockpit | High-Density Workbench | Developer Tool | Consumer>
- **Target Audience Persona**: <who uses this, cognitive environment, daily scan volume, time pressure, density tolerance>
- **External Domain Benchmarks**: <market leaders and reference standards researched via search_web / docs (e.g. Stripe, Linear, Retool, Veeva)>
- **Domain Interaction Conventions**: <table ergonomics, filter models, density, and workflow conventions identified from research>

## 2. Design language (project DESIGN.md)
Source: <path to the project's DESIGN.md + linked files> | none, derived from code (<files>)

### Digest - rules that apply to this screen
*Grouped by topic, in the project's own words and token names, each with where it came from.*
| Topic | Rule (project's wording) | From | Code name |
|---|---|---|---|
| Color | accent only for the primary action | DESIGN.md §Color | `bg-accent` |
| Layout | content max width 1200px | §Layout | `max-w-content` |
| Copy | say "workspace", never "project" | §Voice | - |

### Gaps and the defaults used to fill them
*Only topics DESIGN.md doesn't cover. The user can overrule any line.*
- Dialog sizes: not specified → skill default (form dialog ~36rem, full-screen under sm)
- …

### Conflicts / questions
- <DESIGN.md says X, code does Y - which wins?> | none

## 3. Surface inventory
| File | What it is | States (loading/empty/error/…) | Touched? |
|---|---|---|---|
| app/(app)/invoices/page.tsx | page | loading, empty, error | yes |
| components/invoices/invoice-dialog.tsx | create/edit dialog | validation, pending | yes |

## 4. Task priority
1. <most important task> ← primary action: "<label>"
2. …
Legacy structure: <one line naming the current layout, e.g. "stacked cards with a stat row on top">

## 4b. User flow
*Required when the surface has multi-step or state-changing flows (user-flow.md; Gate G2). One table per flow, before the wireframes. `N/A: single-screen, no state change` allowed.*

### F-01 <flow name> (closes <finding IDs>)
| Step | Entry | User action | Validation (file:line) | Pass → | Fail → (code, where it lands) |
|---|---|---|---|---|---|
| S1 | list view | click "New invoice" | - (navigation) | dialog opens | - |
| S2 | dialog open | submit form | invoice-schema.ts:22 `safeParse` | POST → row in list, dialog closes | 409 `INVOICE_EXISTS` → inline FieldError under "Client" |

Friction: path ok | next visible | back safe | interruption ok — or fix: <change to the table>

## 5. Findings
*Summary by category with IDs; the full evidence lives in 03-findings.md. In FULL mode every catalog rule has a verified row in 04-coverage/ (Gate G1 script PASS). In FOCUSED mode, list only in-scope categories, plus a "Noticed, out of scope" list (not fixed). Severity is rated in the second pass (harness.md §3): record rows severity-free during the audit, P-rate the complete list after.*

Row format: `- [Pn] <rule> <file:line> - <what> → <fix>` (ledger findings: `- F-0xx [Pn] <rule> …`). Shape of a good section — one or two rows per category, concrete file:line and fix in each:
### Breaks DESIGN.md rules
- [P2] file:line - <what> - breaks <rule, §section> → <fix>
### Hierarchy, responsive & layout
- [P1] FLW-02 invoice-wizard.tsx:64 - `handleNext()` sets step 2 without `safeParse` → gate on schema, block with inline error
- [P1] HIE-08 invoice-card.tsx:32 - duplicate Save in header and footer → single footer action
- [P2] RSP-14 floating-bar.tsx:18 - bar touches home indicator → `pb-[max(1rem,env(safe-area-inset-bottom))]`
- [P1] LAY-11 table-actions.tsx:88 - `sr-only` has unpositioned parent, phantom scroll → `relative` on cell wrapper
- [P2] LAY-14 hero.tsx:12 - hero overflows initial viewport with pt-32 → `min-h-[100dvh] pt-24 pb-12`
### Consistency, motion, human & craft
- [P1] CON-08 document-view.tsx:285 - header frozen on currentVersion while viewing another revision → bind activeVersion to all panels
- [P2] MOT-06 invoice-form.tsx:110 - buttons lack press feedback → `active:scale-[0.98]`, 100ms
- [P1] HUM-01 settings-form.tsx:30 - 18 unchunked fields → 4 thematic cards + disclosure
- [P2] SOUL-02 card-wrapper.tsx:18 - clashing nested radii → concentric R_inner = R_outer - P
- [P2] SOUL-11 hero-cta.tsx:45 - primary button wraps on desktop → `whitespace-nowrap px-6`
### Anti-slop & copy hygiene
- [P2] CPY-10 feature-card.tsx:14 - em-dash used in subhead → clean period / comma
- [P3] SLOP-08 section-header.tsx:22 - uppercase tracked eyebrow on 4 consecutive sections → ration to max 1 per 3 sections
- [P2] CPY-11 process-step.tsx:10 - artificial "STEP 01" meta-numbering filler → semantic heading
### Data, tables, uploads, toasts, loading, mutations
- [P1] PAG-14 get-documents.ts:92 - archive query keeps `is_current: true` → drop active-only filter
- [P2] TAB-02 equipment-table.tsx:18 - sticky header has no background → `bg-background border-b`
- [P0] UPL-01 document-uploader.tsx:35 - missed drop navigates tab away → window drop containment
- [P1] NOT-01 payment-form.tsx:90 - error code auto-dismisses in 3s → persistent inline Alert
- [P1] LDG-11 invoices-table.tsx:24 - legacy 3-col skeleton on new 5-col table → redesign skeleton
- F-012 [P1] MUT-04 invoice-dialog.tsx:120 - table not invalidated after Save → invalidate on onSuccess
- F-015 [P1] FRM-15 auth-code.tsx:20 - `onPaste` blocked → remove `preventDefault`
### Accessibility & navigation
- [P1] A11Y-01 actions.tsx:14 - div-as-button → native `<button type="button">`
- F-030 [P1] NAV-06 search-bar.tsx:34 - stale queries not aborted → AbortController
- [P2] NAV-11 palette.tsx:41 - empty query blank, no recents → 4-6 recents + suggestions
### AI answers (if in scope)
- [P1] AI-02 qa-panel.tsx:88 - claims with no source links → cite document chunks with count
### Navigation & other
- …
### Noticed, out of scope (FOCUSED only - not fixed)
- …
Baseline audit: overflow at <widths>; wrapped labels <n>; small targets <n>; bad spinners <n>; loading state <skeleton/blank/spinner>; pending buttons OK <n>/<n>; CLS <n>; console errors <n>. Scan: unbounded queries <n>, spinner kinds <n>, pagination impls <n>. Runtime numbers only if the app ran (optional).

## 5b. Declutter decisions
*Required when layout changes. Every visible element of the page and its dialogs (hierarchy-declutter.md).*
| Element | Task it serves | Decision (Keep/Remove/Merge/Demote/Defer/Move) | Where it goes |
|---|---|---|---|

## 6. Proposed structure & the interactive concept
*One interactive HTML concept in `.ui-audit/<surface>/concepts/index.html`, tweaked in place (interactive-prototypes.md). Directions are compared here in text, not in code.*

### Directions considered
| Direction | One-line model | Why chosen / not chosen (audience, density, time pressure) |
|---|---|---|
| Structured | … | … |
| Balanced | … | **chosen** - … |
| Contextual | … | … |

- **[Concept](./concepts/index.html)** - current revision: <N>

### Revision log
*One row per user tweak; the user's words verbatim. Rows are never deleted.*
| Rev | User words | What changed (concept + plan sections) | Files | G2 script |
|---|---|---|---|---|
| 1 | initial build | - | concepts/index.html | PASS |

### Concept fidelity (the G2 script checks this)
*The token ledger lives in §2. In the concept: every colour literal is in the ledger, every block has `data-trace="file:line"`, every feedback string has `data-copy="file:line"` (interactive-prototypes.md §4).*
| Concept block | `data-trace` source (file:line) | Tokens used (ledger names) | `data-copy` source (file:line or §7 row) |
|---|---|---|---|
| … | … | … | … |

*Use the project's breakpoints if DESIGN.md defines them; otherwise phone ≈375, tablet ≈768, desktop ≥1280.*
### Phone (≈375px)
```
┌──────────────────────┐
│ Invoices             │
│ [search……………] [⚙]    │
│ ┌ row ─────────────┐ │
│ │ Acme Ltd   $1,200 │ │
│ │ Due 3 Oct · Draft │ │
│ └───────────────────┘ │
│ [   New invoice    ]  │ ← sticky bottom
└──────────────────────┘
```
### Tablet (≈768px)
```
…
```
### Desktop (≥1280px)
```
…
```
### Dialogs
<Each dialog at phone and desktop: container type, width, scroll area, footer.>

### Layout mechanics
| Region | Mechanism | Changes at |
|---|---|---|
| Page shell | CSS grid, media query | lg: sidebar appears |
| Invoice card | container query | @md: horizontal |
| Toolbar | flex-wrap | <sm: filters → sheet |

### Type & spacing
- Scale ratio: <e.g. Minor Third 1.200 / Major Third 1.250> (HIE-11)
- Page title / Focal anchor: <token> (tight leading, tracking-tight, text-wrap: balance)
- Section gap: <token>; group gap: <token>; inside group: <token> (pacing tiers)
- Surface elevation tiers: canvas <token> → well <token> → sheet <token> → overlay <token> (HIE-12)
- Max widths: content <…>, text <…>, forms <…>

## 7. Copy changes
| Where | Current | New |
|---|---|---|
| header button | "Add New" | "New invoice" |
| empty state | "Nothing here!" | "No invoices yet. Create one to bill a client." |

## 8. Consistency
| Pattern | Canonical (from) | Variants found | Action |
|---|---|---|---|
| Spinner | new `components/ui/spinner.tsx` (no existing one) | Loader2 ×4, CSS ring ×2 | replace in surface; 6 other pages listed as follow-up |
| Pagination | `components/ui/pagination.tsx` (shadcn) | custom pager in reports | use shared one |
| Date format | `lib/format.ts formatDate` | toLocaleDateString ×3 | use helper |
| Form & component reuse | `components/invoices/invoice-form.tsx` | separate `/new` and `/[id]/edit` forms | extract shared `<InvoiceForm mode="create" | "edit" />` (CON-06, FRM-14) |

## 9. Pagination
| List | Today | Decision | Style |
|---|---|---|---|
| Invoices table | full fetch, client slice | move to backend | numbered pages |
| Activity feed | unbounded | add backend + UI | load more (cursor) |

- API contract: `GET /api/invoices?page=&pageSize=&sort=&q=` → `{ items, page, pageSize, total, totalPages }` (reuses existing envelope? yes/no)
- Validation: page ≥ 1, pageSize default <20>, max <100>, sort allow-list <[…]>
- Order: `createdAt desc, id desc`. Index: <proposed migration or none needed>
- Callers of changed endpoints: <file:line list> - all updated in slice <n>
- URL state: `?page&pageSize&sort&q`; filters reset page to 1
- Loading between pages: keep previous data (dimmed, aria-busy); prefetch next
- UI: shared `Pagination` - summary "21–40 of 312 invoices", page numbers, size select; phone: "‹ Page 5 of 16 ›"
- Edge cases: out-of-range page → last page; deleting last row → previous page

## 10. Loading & pending
*Rule: When redesigning UI (pages, cards, tables, panels), plan redesigned skeletons that mirror the new layout and dimensions. Never reuse legacy skeletons that reflect the old UI (LDG-11).*

| Where | Today | Planned | Skeleton status |
|---|---|---|---|
| Invoices table | `return null` (or old card skeleton) | `InvoiceTableSkeleton`, 20 rows, real header | Redesigned to match new 5-column table |
| Invoice dialog (edit) | spinner over dialog | skeleton fields | Redesigned to match new field structure |
| Save button | oval spinner, width jumps | Button `loading` (grid stack), disabled, aria-busy | - |
| Delete confirm | no pending state | Button `loading`; dialog can't close while pending | - |

## 10b. Mutations, forms & errors
| Mutation / form | Gaps (from the audit block) | Planned fix |
|---|---|---|
| Save invoice | no invalidation of list; dialog closes before success | invalidate ['invoices'], close in onSuccess |

## 11. Proposed new tokens / shared components / DESIGN.md changes
<none | name, value or API, why - needs approval>

## 12. Not changing
- Data fetching, mutations, routes, component props API, test ids - except what sections 9 and 10 list
- <other>

## 13. Implementation slices
1. Page shell & structure - files: … - done when: no overflow 320–1920, wireframe matches
2. Hierarchy & spacing - files: … - done when: …
3. Shared pieces (Spinner, Button loading, Skeleton, Pagination) - files: … - done when: one version each, used in surface
4. Pagination backend + callers - files: … - done when: params validated, max enforced, typecheck passes, callers updated
5. Pagination URL state + UI - files: … - done when: back button works, ?page=9999 handled, bar fits at 320px
6. Skeletons & pending buttons - files: … - done when: redesigned skeletons match new wireframe layout (no legacy skeletons reused); `--loading-shot` = skeleton, CLS ≤ 0.1; `--press` all OK
7. Dialogs - files: … - done when: each opens at phone & desktop, scrolls, footer reachable
8. Mutations, forms & errors - files: … - closes F-… - done when: every mutation audit block is all ✔
9. React hooks - files: … - closes F-… - done when: lint (react-hooks) clean on touched files, no disabled exhaustive-deps without reason
10. Other states & copy - …
11. Remaining bug fixes - …
*Each slice lists the finding IDs it closes.*

### Deferred
- F-0xx - <reason: out of scope / needs product decision / risky backend change>

## 14. Verification
- Every finding ID gets a line in 06-verify.md (how it was verified)
- Gate scripts: `node <skill>/scripts/verify_ledger.mjs check .ui-audit/<slug> --gate g1|g2|g5` (paste each last line)
- Commands: <typecheck / lint / test scripts from package.json>
- Optional scan: `node <skill>/scripts/scan_patterns.mjs --path … --out .ui-audit/scan-after.md`
- Optional runtime audit (if the app runs): `node <skill>/scripts/ui_audit.mjs --url … --out .ui-audit/after --loading-shot --press … [--open …]`
- Manual: screenshots at 320/390/768/1280/1920; each dialog; empty/loading/error; pagination edge cases

## 15. Risks & open questions
- <question for the user>
~~~~
