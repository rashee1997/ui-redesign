# Pagination - backend and UI

> **Defaults only.** If DESIGN.md or the existing code already defines a pagination component, API shape, page size or URL convention, use that. These rules fill gaps.

## Contents
1. Find out what exists
2. Decide what's needed
3. Backend: the API contract
4. Backend: queries (offset and cursor)
5. Frontend: data fetching and URL state
6. Frontend: the pagination UI
7. States: loading, empty, out of range, errors
8. Checklist

## 1. Find out what exists

For every list, table or grid in the surface, answer:

| Question | How to check |
|---|---|
| Does the backend limit results? | Read the query/handler: `limit`/`take`/`.limit(`/`range(`/`LIMIT`/`skip`/`offset`/`cursor`. No limit = unbounded list (P1 for any table that can grow). |
| Is it paginating on the client? | `data.slice(`, `getPaginationRowModel` over a full fetch, a `useState(page)` over an array that came whole from the API. This is fake pagination: every row is still downloaded. |
| Is there a pagination component already? | grep `Pagination`, `Pager`, `PageNav`, `usePagination`, `components/ui/pagination`. If several exist, that's a consistency finding (see consistency.md). |
| Which style is used elsewhere? | numbered pages, prev/next only, load more, infinite scroll. |
| Where does page state live? | URL (`searchParams`, `?page=`), component state, store. |
| What do other endpoints return? | Look for an existing envelope (`{ data, meta }`, `{ items, total }`, `{ rows, nextCursor }`) and reuse it. |

Answer these by reading the list's data path end to end (component → hook → API/query). `scripts/scan_patterns.mjs` can optionally list candidates, but every list must be traced by reading.

## 2. Decide what's needed

| Situation | Action |
|---|---|
| List can grow past ~50 rows and has no backend limit | **Add backend pagination + UI.** |
| Client-side slicing over a full fetch | **Move pagination to the backend**; keep the existing UI if it's good, otherwise redesign. |
| Backend pagination exists, UI is bad/inconsistent | **Redesign the UI only**, using the shared component. |
| List is small and bounded by nature (e.g. ≤ 30 settings, team of 5) | No pagination. Say why in the plan. |

Which style:

| Style | Use for |
|---|---|
| **Numbered pages** (offset) | Admin tables, records people refer back to ("it was on page 3"), when total count matters, when users jump around. Default for data tables. |
| **Prev / Next** (cursor) | Very large or fast-changing data where count is expensive or meaningless (logs, activity, audit trails). |
| **Load more** (cursor) | Feeds and card grids on mobile; keeps position, user stays in control. |
| **Infinite scroll** | Only for pure browsing feeds with no footer content and no need to return to an item. Rare in work apps. |

Backend changes are logic changes: they **must be listed in the plan** (files, new params, response shape, every caller) and approved like everything else. Follow the project's existing API style, validation library, ORM and error format.

## 3. Backend: the API contract

**Request params** (query string or function args, matching existing conventions):
- Offset: `page` (1-based) and `pageSize` - or `limit`/`offset` if that's what the codebase uses.
- Cursor: `cursor` (opaque string) and `limit`.
- Plus the list's existing `sort`, `order`, filters and search `q`.

**Validate everything** with the project's validator (zod, valibot, class-validator…):
- `page` integer ≥ 1, default 1. `pageSize` integer, default 20 (or DESIGN.md's), **clamped to a server max** (e.g. 100). Never trust the client's size.
- `sort` only from an allow-list of column names (never interpolate raw input into ORDER BY).
- Invalid values → clamp or 400 per project convention, never a 500.

**Response shape** (reuse the project's envelope if it has one):
```ts
// offset
{ items: T[], page: number, pageSize: number, total: number, totalPages: number }
// cursor
{ items: T[], nextCursor: string | null, hasNextPage: boolean }
```

**Backward compatibility:** find every caller of the endpoint/function before changing its return shape. Either update all callers in the same slice, or add pagination as optional params that keep the old behaviour when absent. List callers in the plan.

## 4. Backend: queries

Rules for both styles:
- **Stable order:** always end the ORDER BY with a unique column (usually `id`) as a tie-breaker. Without it, rows repeat or vanish between pages.
- **Index** the sort column(s) + tie-breaker for big tables (propose a migration in the plan; don't run migrations without approval).
- Run the page query and the count **in parallel** (`Promise.all`) or in one transaction.
- Filters apply to both the page query and the count.

**Summary aggregates must match the list (PAG-11).** Any KPI card, stat banner, department split, or "by status" breakdown that summarizes the same entity as a list must apply the list's exclusion filters — soft-delete flags, tombstone/archived statuses, tenant or visibility scopes. The classic failure: the total counts every row (`COUNT(*)` with no filter) while the list excludes inactive rows, so the header says "1" and the table shows "0". Compare the aggregate's `WHERE`/`FILTER` clause against the list query's `where` line by line; every exclusion in one must appear in the other. When the summary scope legitimately differs from the list scope (e.g. a global total vs a per-user permission-scoped list), label the scope in the UI ("across your team" vs "visible to you") instead of letting two numbers disagree silently.

**Breakdowns must cover every state (PAG-12, PAG-13).** Read the entity's status enum (or distinct column values) and check each value lands in exactly one breakdown bucket, count split, and filter dropdown option — or is explicitly documented as excluded. A value handled nowhere produces the tell-tale symptom: total = N while every visible part reads 0. Then check the arithmetic: the parts must sum to the stated total; if some states are intentionally grouped out, show an explicit "other" bucket holding the remainder rather than a gap.

**Offset (numbered pages)** - Drizzle example:
```ts
const where = and(eq(invoices.orgId, orgId), q ? ilike(invoices.title, `%${q}%`) : undefined);
const [items, [{ count }]] = await Promise.all([
  db.select().from(invoices).where(where)
    .orderBy(desc(invoices.createdAt), desc(invoices.id))
    .limit(pageSize).offset((page - 1) * pageSize),
  db.select({ count: sql<number>`count(*)::int` }).from(invoices).where(where),
]);
return { items, page, pageSize, total: count, totalPages: Math.max(1, Math.ceil(count / pageSize)) };
```
Prisma: `findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip, take })` + `count({ where })` in `$transaction`. Supabase: `.range(from, to)` with `{ count: 'exact' }`. Raw SQL: `LIMIT $1 OFFSET $2`.

Deep offsets get slow on very large tables; if pages past ~1,000 are realistic, use cursor.

**Cursor (prev/next, load more)** - keyset on (sortKey, id), fetch one extra row to know if there's more:
```ts
const after = cursor ? decodeCursor(cursor) : null; // { createdAt, id }
const rows = await db.select().from(events)
  .where(and(base, after ? or(lt(events.createdAt, after.createdAt),
    and(eq(events.createdAt, after.createdAt), lt(events.id, after.id))) : undefined))
  .orderBy(desc(events.createdAt), desc(events.id))
  .limit(limit + 1);
const hasNextPage = rows.length > limit;
const items = rows.slice(0, limit);
const last = items.at(-1);
return { items, hasNextPage, nextCursor: hasNextPage && last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null };
```
Cursor = base64url of a small JSON with a version field; treat it as opaque on the client; reject malformed cursors with a 400.

## 5. Frontend: data fetching and URL state

- **Page state lives in the URL** (`?page=3&pageSize=20&sort=…&q=…`) so refresh, back button and shared links work. Next.js App Router: read `searchParams` in the server page, or `useSearchParams` + `router.replace`/`<Link>` on the client. Use the project's existing helper if it has one (nuqs, a `useQueryState`, etc.).
- **Reset to page 1** when filters, search or sort change.
- **Debounce** search input (~300ms) before it changes the URL.
- **Keep previous data while the next page loads** so the table doesn't flash empty:
  - TanStack Query: `placeholderData: keepPreviousData`; dim the table (`opacity-60` + `aria-busy`) while `isPlaceholderData`.
  - SWR: `keepPreviousData: true`.
  - Server components: wrap the table in `<Suspense key={page+filters}>` with a skeleton fallback, or use `useTransition` around navigation and show a subtle pending state.
- **Prefetch the next page** when the current one loads (TanStack: `queryClient.prefetchQuery`; Next `<Link prefetch>`).
- **Scroll**: on page change, scroll the list's top into view (not the whole window if the list is lower down), and move focus to the list heading or the results summary for keyboard/screen-reader users.
- Disable "Next" while the next page's existence is unknown; never let a click fetch a page that doesn't exist.

## 6. Frontend: the pagination UI

Use or build **one shared component** (e.g. `components/ui/pagination.tsx` or the shadcn one if installed) and use it on every list. Anatomy, left to right on desktop:

```
Showing 21–40 of 312 invoices        Rows per page [20 ▾]   ‹ Prev  1 … 4 [5] 6 … 16  Next ›
```

- **Results summary**: "21–40 of 312 invoices" (range + total + noun). Tabular numbers. For cursor lists: "Showing 40 invoices" or nothing.
- **Page numbers**: first, last, current ±1, ellipsis for gaps; keep the item count constant (≈7 slots) so the control doesn't jump in width as you move:
  ```ts
  function pageItems(cur: number, total: number): (number | 'gap')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (cur <= 4) return [1, 2, 3, 4, 5, 'gap', total];
    if (cur >= total - 3) return [1, 'gap', total - 4, total - 3, total - 2, total - 1, total];
    return [1, 'gap', cur - 1, cur, cur + 1, 'gap', total];
  }
  ```
- **Current page**: clearly different (filled/primary-subtle background from tokens), `aria-current="page"`, not clickable.
- **Prev/Next**: text + chevron on desktop, icon-only with `aria-label` on phones; disabled (not hidden) at the ends so the layout doesn't shift.
- **Page size select**: optional, for data tables; values like 10/20/50/100 (within the server max); changing it resets to page 1.
- **Equal sizes**: every page button is the same fixed square size (≥ the project's min target, 32–40px), numbers centered, `tabular-nums`, `whitespace-nowrap`. Widths don't change between "9" and "10" because the box is fixed.
- **Markup**: `<nav aria-label="Pagination">` + list; page links are real `<a href="?page=n">` (or buttons if the project uses client state); visible focus ring.
- **Placement**: below the list, aligned with the list's edges; summary left, controls right. Add a top copy only for very long pages.
- **Responsive** (container query on the pagination wrapper):
  - wide: summary · page size · numbers
  - medium: summary · numbers (page size moves into a menu or hides)
  - narrow (< ~420px): `‹  Page 5 of 16  ›` - prev/next as large buttons with the compact label between, or a "Load more" button for card lists. No horizontal scrolling, no wrapping into two messy rows.
- Style from tokens only: ghost/outline buttons for numbers, primary-subtle for current. No pills with shadows or gradients.

Copy: "Previous", "Next", "Rows per page", "Page 5 of 16", "21–40 of 312 invoices". Use the project's terminology for the noun.

## 7. States

- **First load**: skeleton rows equal to the page size (see loading-states.md), pagination skeleton or hidden.
- **Changing page**: previous rows stay, dimmed, `aria-busy="true"`; the clicked page shows as current immediately (optimistic); a thin progress bar or the number button's own pending state is enough. No full-page spinner.
- **Empty**: no pagination at all; show the empty state (first-use vs no-results-for-filters are different messages).
- **One page only**: hide page numbers; the summary may stay ("12 invoices").
- **Out of range** (`?page=99` but only 16 pages, e.g. after deletes): redirect/replace to the last page; never show an empty table with "page 99".
- **Deleting the last row on a page**: go to the previous page.
- **Error**: keep the last good data if present, show an inline error with "Try again".

## 8. Checklist

- [ ] No list in the surface fetches unbounded data; no client-side slicing of a full fetch.
- [ ] Server validates page/pageSize/sort; pageSize has a server max; sort uses an allow-list.
- [ ] ORDER BY ends with a unique tie-breaker; count and page use the same filters.
- [ ] Every summary/KPI aggregate over the listed entity uses the list's exclusion filters (PAG-11); differing scopes are labelled in the UI.
- [ ] Every status/enum value appears in one breakdown bucket and one filter option, or is explicitly excluded (PAG-12); parts sum to the total or an "other" bucket holds the remainder (PAG-13).
- [ ] All callers of changed endpoints updated (listed in plan).
- [ ] Page, size, sort, filters in the URL; filters reset page to 1; back button works.
- [ ] Previous data kept while loading; no empty flash; next page prefetched.
- [ ] One shared Pagination component used by every list in the surface.
- [ ] Fixed-size page buttons, `aria-current`, `nav` with label, disabled ends, compact mode on phones, no wrap/overflow at 320px.
- [ ] Out-of-range page and last-row delete handled.
