# Redesign plan template

Write this as `.ui-audit/<surface>/PLAN.md` (see harness.md). Fill every section that applies to the mode; in FOCUSED mode, sections for categories outside the scope are replaced by one line: "Out of scope (FOCUSED)". Delete hints in *italics*. Keep it scannable: the user approves from this.

**Required slot:** every finding ID from `03-findings.md` must appear in exactly one slice in §13, or under "Deferred" with a reason. Gate G2 fails otherwise.

## Contents
1. Summary · 2. Design language · 3. Declutter / cognitive chunking · 4. Wireframes · 5. Findings by category · 6. Structure & layout mechanics · 7. Copy changes · 8. Consistency · 9. Pagination contract · 10. Loading & pending · 11. Mutations & forms · 12. Proposed tokens & components · 13. Slices & rollout · 14. Out of scope & questions

~~~~markdown
# Redesign plan: <Page / feature name>

Status: DRAFT - waiting for approval
Route: /<route>     Date: <date>
Mode: FULL | FOCUSED (<named issues 1…n>)
Request (verbatim): "<user's words>"
Findings: <n> total - P0 <n> · P1 <n> · P2 <n> · P3 <n> (ledger: 03-findings.md)

## Approval
<empty until the user approves - then quote their words and the date>

## 1. Summary
<3–5 lines: what's wrong today, what the redesign does, what stays the same.>

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

## 5. Findings
*Summary by category with IDs; the full evidence lives in 03-findings.md. In FULL mode, all 25 catalog categories and every rule ID have been individually audited in 04-coverage.md (Gate G1). In FOCUSED mode, list only in-scope categories, plus a "Noticed, out of scope" list (not fixed).*
### Breaks DESIGN.md rules
- [P2] file:line - <what> - breaks <rule, §section> → <fix>
### Hierarchy & clutter
- [P2] file:line - <what> → <fix>
- [P2] HIE-09 dashboard.tsx:45 - flat visual weight across 4 identical stat cards → establish primary metric anchor with tonal contrast
- [P2] HIE-10 header.tsx:18 - badge, icon, and colored chip all competing with title → demote badge, remove redundant icon
- [P2] HIE-11 article.tsx:22 - arbitrary 29px heading with loose leading → map to theme font-2xl with tight leading and text-wrap: balance
- [P2] HIE-12 panel.tsx:60 - heavy dark drop shadow (shadow-xl) → replace with subtle background tier and crisp hairline border
- [P1] HIE-08 invoice-card.tsx:32 - duplicate Save buttons visible in card header and footer → remove header duplicate, unify on single footer action
### Responsive & fluid
- [P1] file:line - page overflows 34px at 375 (from audit) → <fix>
- [P2] RSP-14 floating-bar.tsx:18 - floating action bar touches home indicator on mobile → add `pb-[max(1rem,env(safe-area-inset-bottom))]`
- [P2] RSP-15 filter-chip.tsx:22 - fast tap chip triggers 300ms double-tap zoom delay → add `touch-manipulation`
- [P2] DLG-10 sheet-drawer.tsx:45 - scrollable sheet chains scroll to outer body → add `overscroll-contain`
### Visual slop & layout containment
- [P1] LAY-11 table-actions.tsx:88 - `sr-only` description in table row has unpositioned parent, leaking phantom scroll height → add `relative` to parent cell wrapper
- [P1] LAY-12 panel-view.tsx:34 - inner scroller nested inside shell scroller without max-height bounds → delegate scroll ownership to shell
- …
### Copy
- …
### Consistency & component sharing
- [P2] 3 spinner kinds (Loader2, CSS ring, "Loading..." text) → one `Spinner`
- [P1] CON-06 invoices/new/page.tsx:40 & invoices/[id]/edit/page.tsx:42 - separate copy-pasted create and edit forms → extract shared `<InvoiceForm mode="create" | "edit" />` (FRM-14)
- [P1] CON-08 document-view.tsx:285 - version selector switches canvas but header and facts panel remain statically bound to currentVersion → dynamically bind activeVersion across all child panels and workflows
### Motion & micro-interactions
- [P2] MOT-06 invoice-form.tsx:110 - buttons lack active/press micro-feedback → add `active:scale-[0.98]` and 100ms transition
- [P2] MOT-07 filter-bar.tsx:65 - collapsible panel snaps open abruptly → smooth CSS grid row transition (motion.md §2D)
### Human cognitive & emotional experience
- [P1] HUM-01 settings-form.tsx:30 - 18 unchunked settings fields dumped in single card → split into 4 thematic cards with progressive disclosure
- [P2] HUM-02 audit-log.tsx:44 - clickable table row looks like static text (no cursor, no hover affordance) → add hover background and subtle row link signifier
- [P1] HUM-03 filter-dropdown.tsx:20 - selecting tag updates count 800ms later with no immediate visual receipt → add instant local state feedback (<100ms)
- [P2] HUM-04 profile-view.tsx:55 - label is closer to previous field than its own input → adjust Gestalt proximity spacing (gap-1.5 label-to-input, gap-6 between fields)
- [P1] HUM-06 document-form.tsx:80 - requires user to manually type department ID from memory → replace with auto-complete department combobox
- [P2] HUM-07 sync-panel.tsx:12 - routine background sync pops full modal interrupting user input → move to calm peripheral status indicator in footer
- [P1] HUM-08 upload-wizard.tsx:110 - completion abruptly vanishes leaving user on empty dashboard → add affirmative completion card with view and share next actions
### Soulful design, craft & tactile finish
- [P2] SOUL-01 buttons.tsx:40 - dead controls lack active/press physical depression → add `active:scale-[0.98]` and 100ms ease-out
- [P2] SOUL-02 card-wrapper.tsx:18 - nested card has clashing border radius (p-4 with rounded-2xl outer and rounded-2xl inner) → apply concentric radius R_inner = R_outer - P (rounded-lg)
- [P2] SOUL-03 play-control.tsx:25 - triangle play icon geometrically centered appears off-balance → add `translate-x-[1px]` optical compensation
- [P2] SOUL-04 data-view.tsx:50 - content pops in abruptly when data loads → add smooth 200ms fade-in crossfade
- [P2] SOUL-06 surface.tsx:32 - muddy drop shadow (shadow-xl) → replace with tonal luminance tier and crisp hairline border
### Pagination
- [P1] server/invoices.ts:12 - query has no limit; page slices on the client → backend pagination
- [P1] PAG-14 get-documents.ts:92 - archive query retains is_current: true filter, excluding all soft-deleted records → remove active-only filters from archive queries
### Tables & data grids (TAB)
- [P2] TAB-01 documents-table.tsx:42 - Amount column header is left-aligned while currency cells are right-aligned → align header right with `text-right`
- [P1] TAB-02 equipment-table.tsx:18 - sticky table header lacks background, letting scrolled rows bleed through text → add `bg-background border-b border-border`
- [P1] TAB-03 user-table.tsx:30 - select-all checkbox ambiguously selects only current page without declaring scope or offering dataset selection → add scope label and dataset banner
- [P2] TAB-04 invoice-table.tsx:88 - row Edit and Delete buttons hidden behind `group-hover:opacity-100`, unreachable on touch → replace with persistent kebab menu button
- [P2] TAB-05 asset-table.tsx:15 - wide table scrolls horizontally with no shadow affordance or frozen key column → add scroll shadow cues and freeze Asset ID column (`sticky left-0`)
- [P2] TAB-06 log-table.tsx:64 - UUIDs truncated with ellipsis without tooltip or inspection affordance → add tooltip and one-click copy button
- [P2] TAB-07 sort-header.tsx:22 - sortable column lacks ascending/descending chevron when sorted → add explicit chevron indicator and `aria-sort`
### File uploads & drag-and-drop (UPL)
- [P0] UPL-01 document-uploader.tsx:35 - missing window `dragover`/`drop` `preventDefault`, so dropping file outside zone navigates tab away and erases form → add window drop containment effect
- [P1] UPL-02 avatar-picker.tsx:50 - `<input type="file">` does not reset `e.target.value = ''`, so re-selecting same file fails to fire `onChange` → reset value after selection
- [P1] UPL-03 certificate-preview.tsx:28 - `URL.createObjectURL` generated for preview without `URL.revokeObjectURL` cleanup on unmount → revoke URL in effect destructor
- [P2] UPL-04 dropzone.tsx:14 - upload area gives no indication of accepted file formats or size limits → add upfront subtitle "PDF, PNG, JPG up to 25 MB"
- [P1] UPL-05 batch-uploader.tsx:80 - single file error aborts entire 10-file upload batch without retry → isolate failed file with retry action and preserve successful uploads
- [P2] UPL-06 large-upload.tsx:44 - 100 MB video upload shows indeterminate spinner without progress bar or cancel button → add percentage/byte progress and AbortController button
### Toasts, notifications & alerts (NOT)
- [P1] NOT-01 payment-form.tsx:90 - critical transaction error code auto-dismisses after 3 seconds → render as persistent inline `<Alert variant="destructive">`
- [P2] NOT-02 undo-toast.tsx:25 - "Undo" toast auto-dismisses while user moves pointer toward it → pause timer on `:hover` and `:focus-within` with minimum 8s duration
- [P2] NOT-03 bulk-delete.tsx:60 - deleting 15 items fires 15 separate toasts filling the screen → combine into single summary toast "15 items deleted"
- [P2] NOT-04 notification-host.tsx:18 - toasts anchored top-right cover primary Save and Publish buttons → anchor to bottom-right (desktop) / bottom-center (mobile)
- [P2] NOT-05 bell-icon.tsx:20 - notification count badge does not decrement when notifications are read → synchronize badge count state on read
### Loading & pending
- [P2] app/invoices/page.tsx:3 - `if (isLoading) return null` → table skeleton
- [P1] LDG-11 invoices-table.tsx:24 - legacy 3-column skeleton reused for new 5-column layout → redesign InvoiceTableSkeleton to match new table
- [P2] invoice-dialog.tsx:88 - Save spinner oval (no shrink-0), button shrinks 40px → Button `loading`
### Mutations, forms & errors
- F-012 [P1] MUT-04 invoice-dialog.tsx:120 - after Save the table isn't invalidated → stale list
- F-013 [P1] FRM-06 invoice-form.tsx:64 - server field errors only shown as a toast
- F-014 [P1] FRM-14 invoice-form.tsx - create and edit forms maintained separately → unified polymorphic form
- F-015 [P1] FRM-15 auth-code.tsx:20 - `onPaste` blocks pasting verification code → remove `e.preventDefault()`
- F-016 [P2] FRM-16 terms-checkbox.tsx:15 - checkbox and label have unclickable dead zone between them → wrap in unified `<label className="cursor-pointer">`
- F-017 [P2] FRM-17 search-input.tsx:10 - unconditional `autoFocus` triggers abrupt mobile keyboard pop and screen zoom → restrict to desktop or user-intent click
- F-018 [P1] FRM-18 file-preview.tsx:46 - preview toggle button inside form lacks type="button", causing accidental submit on click/Enter → add explicit type="button" and suppress input Enter submission
- F-019 [P1] MUT-13 use-mutations.ts:75 - mutation invalidation refreshes parent document but omits audit-log query → add complete child telemetry invalidation
- F-020 [P2] HOOK-03 customer-search.tsx:31 - fetch in effect without abort → out-of-order results
- F-021 [P2] FRM-19 quantity-input.tsx:18 - mouse wheel while hovering number input changes quantity accidentally → add `onWheel={(e) => e.currentTarget.blur()}`
- F-022 [P2] FRM-20 mobile-form.tsx:95 - virtual keyboard covers active form input on mobile viewports → add smooth `scrollIntoView` on focus
- F-023 [P1] FRM-21 date-picker.tsx:40 - date picker converts local date to UTC midnight ISO string, shifting date back 1 day in Americas → store local `YYYY-MM-DD` string
- F-024 [P2] FRM-22 bio-textarea.tsx:30 - input with maxLength=200 silently drops typed characters without counter → add visible `{count}/200` counter
- F-025 [P2] FRM-23 password-input.tsx:25 - password field lacks show/hide toggle → add toggle button with `aria-label`
- F-026 [P1] FRM-24 onboarding-wizard.tsx:55 - reloading step 3 resets wizard back to step 1 losing all inputs → persist step state in sessionStorage with draft recovery
- F-027 [P2] DLG-11 modal.tsx:40 - opening dialog removes scrollbar causing 15px layout lurch → apply `scrollbar-gutter: stable`
- F-028 [P2] DLG-12 popover.tsx:18 - popover menu rendered inside `overflow-hidden` card is clipped at border → render menu via Radix Portal
- F-029 [P3] DLG-14 save-button.tsx:12 - "Save" button has redundant tooltip "Save" with no added info → remove redundant tooltip
- F-030 [P1] NAV-06 search-bar.tsx:34 - async search does not abort stale in-flight query, displaying outdated results → attach AbortController to search queries
- F-031 [P2] NAV-07 search-bar.tsx:28 - search input lacks instant clear (`x`) button → add clear button that resets query and preserves focus
- F-032 [P2] NAV-08 combobox.tsx:75 - keyboard arrow navigation does not scroll highlighted option into view → add `scrollIntoView({ block: 'nearest' })`
- F-033 [P1] ERR-08 submit-handler.ts:45 - 401 response hard-redirects to login losing completed form → preserve form inputs in sessionStorage and prompt with in-place modal
### Accessibility (A11Y)
- [P1] A11Y-01 actions.tsx:14 - `<div onClick={onDelete}>` used as button → replace with native `<button type="button">`
- [P1] A11Y-02 toolbar.tsx:28 - icon-only button lacks accessible name → add `aria-label="Filter documents"` and `aria-hidden="true"` on SVG
- [P1] A11Y-03 inputs.tsx:55 - `outline-none` removes focus ring without replacement → add `focus-visible:ring-2 focus-visible:ring-ring`
- [P1] A11Y-04 badge.tsx:19 - muted grey text on dark background has 2.4:1 contrast → update to token with ≥ 4.5:1 ratio
- [P2] A11Y-05 table-actions.tsx:40 - icon button hit target is 18×18px → expand hit target to minimum 24×24px with `p-1.5`
- [P1] A11Y-12 sticky-bar.tsx:10 - sticky header obscures top of focused form inputs when tabbing → add `scroll-margin-top: 5rem`
- [P1] A11Y-18 form.tsx:82 - validation error not associated with input → link with `aria-describedby` and `aria-invalid="true"`
### Navigation & other
- …
### Noticed, out of scope (FOCUSED only - not fixed)
- …
Baseline audit: overflow at <widths>; wrapped labels <n>; small targets <n>; bad spinners <n>; loading state <skeleton/blank/spinner>; pending buttons OK <n>/<n>; CLS <n>; console errors <n>. Scan: unbounded queries <n>, spinner kinds <n>, pagination impls <n>. Runtime numbers only if the app ran (optional).

## 5b. Declutter decisions
*Required when layout changes. Every visible element of the page and its dialogs (hierarchy-declutter.md).*
| Element | Task it serves | Decision (Keep/Remove/Merge/Demote/Defer/Move) | Where it goes |
|---|---|---|---|

## 6. Proposed structure
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
- Commands: <typecheck / lint / test scripts from package.json>
- Optional scan: `node <skill>/scripts/scan_patterns.mjs --path … --out .ui-audit/scan-after.md`
- Optional runtime audit (if the app runs): `node <skill>/scripts/ui_audit.mjs --url … --out .ui-audit/after --loading-shot --press … [--open …]`
- Manual: screenshots at 320/390/768/1280/1920; each dialog; empty/loading/error; pagination edge cases

## 15. Risks & open questions
- <question for the user>
~~~~
