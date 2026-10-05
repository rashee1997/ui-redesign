# Consistency across components

> **Defaults only.** The canonical version of each pattern comes from DESIGN.md first, then the app's existing primitives, then the best existing usage. Never invent a new canonical version when the project already has one.

A screen feels "off" when the same thing looks or behaves differently in different places: three button heights, two date formats, a pagination bar that differs on every table, empty states written five ways. Redesigning one page without fixing this makes it a fourth variant.

## 1. Inventory the variants

For each pattern below, list every variant found in the surface (and, for shared patterns, how other pages do it). Build this from reading the inventory files; the optional `scripts/scan_patterns.mjs` counts can help you spot variants you missed.

| Pattern | What varies |
|---|---|
| Page header | title size, description, where the primary action sits, breadcrumbs |
| Buttons | variants, sizes, icon placement, label casing, pending state |
| Inputs & forms | label position, help/error text style, required marker, field width, spacing |
| Tables & lists | row height, header style, cell padding, alignment of numbers, row actions, selection |
| Pagination | component used, placement, page size, summary text |
| Loading | skeleton vs spinner vs text; spinner component and size |
| Empty states | layout, illustration/icon, copy formula, action |
| Errors | inline vs toast vs alert, wording |
| Dialogs & sheets | width, header/footer layout, button order, close button |
| Badges / status | colors per status, shape, casing |
| Cards / panels | radius, border vs shadow, padding |
| Icons | library, size per context, stroke width |
| Dates, numbers, currency | format, locale, relative vs absolute |
| Spacing | gaps between the same kinds of things |
| Toasts | position, duration, wording |
| Terminology | the same thing named differently ("project"/"workspace", "remove"/"delete") |
| Forms & entity views | copy-pasted create vs edit forms; diverging fields/validation across pages |
| Cards & widgets | parallel duplicate implementations across different routes |

## 2. Choose the canonical version

For each pattern with more than one variant:
1. If DESIGN.md defines it → that's canonical.
2. Else if a shared primitive exists (`components/ui/*`) → canonical is the primitive used properly.
3. Else → the variant used most on the app's best pages.
4. If a pattern changes and a shared primitive (`components/ui/*`) or a better existing usage already implements it, reuse/extend that canonical version instead of restyling a one-off (CON-07); cite it by file:line.

Record it in the plan's consistency table: pattern → canonical → where it's defined → variants found (file:line) → action.

## 3. Fix by sharing, not by copying

- Prefer **using or extending the shared component** (add a `loading` prop to Button, a `Pagination` component, an `EmptyState`, a `PageHeader`, a `formatDate` helper) over styling each instance to look the same.
- If a needed shared component doesn't exist, propose creating it in the plan, put it with the other primitives, and use it everywhere in the surface.
- Replace one-off variants in the surface with the shared version. For the same pattern outside the surface: list them in the report as follow-ups; don't change them unless the plan included it and the user approved.
- Keep public props/APIs of shared components backward compatible; if you must change one, list every call site in the plan.

### Unifying repeated components & forms across pages (CON-06, FRM-14)

A common source of drift is copy-pasting an entire form between a "Create" page and an "Edit" page, or between an in-page view and a modal dialog:
- **The problem**: Field validation, layout styling, error handling, and helper text are maintained in two places. Bug fixes or field additions applied to the create form are forgotten on the edit page.
- **The shared form pattern**:
  1. **One schema**: Define the validation schema once (`entity-schema.ts`) using Zod or Valibot. Derive `EntityFormValues` from `z.infer<typeof schema>`.
  2. **One polymorphic form component**: Extract `<EntityForm mode="create" | "edit" initialData={entity} onSubmit={handleSubmit} onCancel={handleCancel} layout="page" | "dialog" />`.
  3. **Mode-driven differences**:
     - Mode toggles button copy: "Create invoice" vs "Save changes".
     - Edit-only fields (e.g., status override, revision notes) or create-only fields (e.g., initial upload) render conditionally via `mode === 'edit'`.
     - Route containers (`/invoices/new/page.tsx`, `/invoices/[id]/edit/page.tsx`, `<InvoiceSheet>`) orchestrate data fetching and submit mutations, delegating form rendering to the shared component.
  4. **When NOT to share**: If two forms share less than ~50% of their fields, have distinct lifecycles, or serve different user personas, keep them separate rather than creating an unreadable tangle of `if (mode === ...)` conditions.

## 4. Behaviour consistency (not just looks)

- Same action, same result: delete always confirms (or always offers undo); Esc always closes; Enter always submits forms.
- Same keyboard and focus behaviour across dialogs and menus.
- Same pending behaviour on every action button (loading-states.md §4).
- Same pagination behaviour on every list (pagination.md).
- Same feedback: success always toasts (or always inline), errors always appear in the same place.
- Micro-interactions follow uniform duration and easing curves across all components (motion.md).

## 5. Checklist

- [ ] Each pattern in the surface has exactly one variant, matching the canonical version.
- [ ] Shared components used instead of one-off styling.
- [ ] Changed patterns reuse the shared primitive or the best existing usage (CON-07), not a one-off restyle.
- [ ] Repeated forms and components across routes/dialogs extracted into a unified single source of truth (CON-06, FRM-14).
- [ ] Dates/numbers/currency formatted through one helper.
- [ ] Terminology consistent with DESIGN.md / the app.
- [ ] Out-of-scope inconsistencies listed as follow-ups.
