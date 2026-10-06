# Tables & Data Grids

Defaults only: when the project's `DESIGN.md` or existing table primitives decide something differently, they win (`design-md.md`).

A data table is a high-density, structured surface designed for scanning, comparing, and acting across records. Every rule here is a strict law of the book: deterministic, falsifiable, and auditable against concrete code signals.

## Contents
1. Core table anatomy & layout
2. Alignment & tabular figures (TAB-01)
3. Sticky headers & frozen columns (TAB-02, TAB-05)
4. Selection models & bulk actions (TAB-03)
5. Row action discoverability (TAB-04)
6. Truncation, inspection & tooltips (TAB-06)
7. Sorting indicators & states (TAB-07)
8. Audit checklist

---

## 1. Core table anatomy & layout

A production table consists of:
- **Toolbar**: search, filters, density toggles, primary creation action, and contextual bulk actions.
- **Header (`<thead>`)**: semantic column headers (`<th scope="col">`), sort triggers, select-all checkbox.
- **Body (`<tbody>`)**: data rows (`<tr>`) and cells (`<td>`).
- **Footer (`<tfoot>`)**: summary totals, pagination controls, and row counts.

Native HTML elements (`table`, `thead`, `tbody`, `tr`, `th`, `td`) are mandatory. ARIA grid roles (`role="grid"`) are reserved only for fully virtualized, custom keyboard-navigated spreadsheets.

---

## 2. Alignment & tabular figures (TAB-01)

### The Law
- **Text & labels** MUST align left in both header (`th`) and cell (`td`).
- **Numbers, currencies, percentages, and metrics** MUST align right in both header (`th`) and cell (`td`), so decimal places and magnitudes align vertically.
- **Dates & timestamps** MUST maintain identical alignment between `th` and `td` (consistently left-aligned or right-aligned across the whole view).
- Numbers compared vertically MUST use `tabular-nums` (`font-variant-numeric: tabular-nums`).

### Code signal & violation
```tsx
// VIOLATION: Header is left-aligned while cell is right-aligned; tabular-nums missing
<th className="text-left font-medium">Amount</th>
<td className="text-right">{formatCurrency(item.amount)}</td>

// PASS: Header and cell alignment match; numbers aligned right with tabular figures
<th scope="col" className="text-right font-medium">Amount</th>
<td className="text-right tabular-nums">{formatCurrency(item.amount)}</td>
```

---

## 3. Sticky headers & frozen columns (TAB-02, TAB-05)

### Sticky Header Background Bleed (TAB-02)
Sticky table headers (`sticky top-0`) MUST define an opaque background (`bg-background` or token equivalent) and a hairline bottom border or shadow. Transparent or semi-transparent sticky headers that allow scrolling rows to bleed through text are a strict VIOLATION.

```tsx
// VIOLATION: Transparent sticky header allows table rows to bleed through
<th className="sticky top-0 z-10 p-3">Status</th>

// PASS: Opaque background with border and stacking layer
<th scope="col" className="sticky top-0 z-10 bg-background border-b border-border p-3">Status</th>
```

### Horizontal Scroll Affordances & Frozen Key Columns (TAB-05)
Tables that exceed the viewport width MUST:
1. Provide a scroll container with visual scroll cues (shadow or gradient edge fade when scrolled).
2. Freeze the primary identifier column (`sticky left-0 bg-background z-20`) so row identity remains visible while scrolling horizontally.

```tsx
// PASS: Frozen first column with hairline divider
<th scope="col" className="sticky left-0 z-20 bg-background border-r border-border shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
  Asset ID
</th>
```

---

## 4. Selection models & bulk actions (TAB-03)

### The Law
- A header checkbox MUST explicitly declare its selection scope: "Select page ($N$ items)" vs "Select all ($M$ items)".
- If dataset spans multiple pages, checking the header checkbox MUST show a banner: *"All 25 items on this page are selected. Select all 1,420 items matching this filter."*
- Paginating to another page MUST NOT silently wipe active selections without user confirmation or a persistent selection model.

### Code signal & violation
```tsx
// VIOLATION: Selection array wiped silently on page change
useEffect(() => {
  setSelectedIds([]); // Wipes selections when user navigates page!
}, [page]);

// PASS: Selection persists across pages with running counter in bulk bar
<BulkActionsBar selectedCount={selectedIds.length} onClear={() => setSelectedIds([])} />
```

---

## 5. Row action discoverability (TAB-04)

### The Law
Row-level actions (Edit, Delete, Copy, More options) MUST NOT be hidden behind mouse-hover-only classes (`opacity-0 group-hover:opacity-100`, `hidden group-hover:flex`). 

Hover-only actions are completely inaccessible to touchscreen devices (phones, tablets, kiosk displays) and screen magnifiers, and are invisible to keyboard tab navigation.

### The Fix
Keep action buttons visible at normal or subtle contrast, or provide an always-visible kebab action menu button (`<Button variant="ghost" size="icon" aria-label="Actions for Item 123">`).

---

## 6. Truncation, inspection & tooltips (TAB-06)

### The Law
Data cells that truncate content (`truncate`, `text-ellipsis`, `overflow-hidden`) for long strings (UUIDs, commit hashes, email addresses, file names, descriptions) MUST provide an accessible mechanism to view the full string:
1. An accessible tooltip/popover on hover and focus (`<TooltipContent>{fullText}</TooltipContent>`).
2. An inline copy button for technical IDs/hashes (`<CopyButton value={fullText} />`).

Truncating without an inspection affordance traps information from users.

---

## 7. Sorting indicators & states (TAB-07)

### The Law
- Every sortable column header MUST indicate sortability on hover and focus.
- The active sorted column MUST display a clear direction indicator (chevron up for ascending, chevron down for descending).
- Unsorted headers MUST NOT display a permanent static double arrow that implies the column is currently sorted.
- Sort state MUST be communicated to assistive technology via `aria-sort="ascending" | "descending" | "none"`.

```tsx
// PASS: Accessible sort header with direction indicator
<button
  type="button"
  onClick={() => toggleSort('created_at')}
  aria-sort={currentSort === 'created_at' ? sortDirection : 'none'}
  className="inline-flex items-center gap-1.5 font-medium hover:text-foreground"
>
  Created
  {currentSort === 'created_at' ? (
    sortDirection === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />
  ) : (
    <ArrowUpDown className="size-3.5 opacity-40" />
  )}
</button>
```

---

## 8. Audit checklist

- [ ] `TAB-01`: Text aligned left, numbers/currency right-aligned with `tabular-nums`, headers match cells.
- [ ] `TAB-02`: Sticky headers have opaque `bg-background` and border; no transparent bleed.
- [ ] `TAB-03`: Header select-all clarifies page vs dataset scope; page change does not wipe selection silently.
- [ ] `TAB-04`: No hover-only row action buttons; controls operable on touch and keyboard.
- [ ] `TAB-05`: Horizontal scroll has shadow/fade affordance; primary key column frozen on wide tables.
- [ ] `TAB-06`: Truncated cells have tooltip or copy affordance for full content inspection.
- [ ] `TAB-07`: Sortable headers show explicit direction arrows and `aria-sort`.
