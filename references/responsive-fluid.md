# Responsive, fluid and no-bad-wrapping

> **Defaults only.** Everything here is a fallback for what the project's own DESIGN.md and existing code don't decide. If DESIGN.md sets a value or rule for the same thing (breakpoints, spacing, sizes, component choices, banned or required styles, voice), follow DESIGN.md and use its names. See `design-md.md`.

## Contents
1. Widths to design for
2. Page layout vs component layout
3. Fluid type and spacing with clamp()
4. Text wrapping rules (the "no ugly wraps" part)
5. Flex and grid rules that prevent overflow
6. Responsive dialogs, sheets and popovers
7. Touch, viewport and safe-area details
8. Tailwind snippets
9. Scroll containment (one scrollbar)

## 1. Widths to design for

Design for a continuous range, and check these widths: **320, 375, 390, 412, 768, 1024, 1280, 1920**. 320 is the WCAG reflow width (1.4.10): content must work there without two-way scrolling (data tables and maps are the allowed exceptions).

Use the project's breakpoints. If none are defined, Tailwind defaults (sm 640, md 768, lg 1024, xl 1280, 2xl 1536) are fine. Don't invent a breakpoint for one component - use a container query instead.

## 2. Page layout vs component layout

- **Media queries** → page-level: shell, nav, sidebar show/hide, main grid, header layout.
- **Container queries** → components that can appear in different widths: cards, list items, forms, widgets, dialog bodies, sidebar panels. They adapt to the space they're given, so the same card works in a 3-column grid and in a narrow sidebar.

```css
.panel { container-type: inline-size; container-name: panel; }
@container panel (min-width: 36rem) { .panel-body { grid-template-columns: 1fr 1fr; } }
```

Pitfalls: a container can't query itself (add a wrapper); use `inline-size`, not `size` (`size` collapses height to 0 without an explicit height); breakpoints in `@container` can't be CSS variables.

Intrinsic layouts need no breakpoints at all - prefer them:

```css
.grid-auto { display: grid; gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); }
.switcher { display: flex; flex-wrap: wrap; gap: var(--space-3); }
.switcher > * { flex: 1 1 14rem; min-width: 0; }
```

The `min(100%, 16rem)` stops the minimum from overflowing on very narrow screens.

## 3. Fluid type and spacing with clamp()

Fluid sizes grow smoothly between a min viewport and a max viewport instead of jumping at breakpoints.

```
font-size: clamp(MIN, INTERCEPT + SLOPE·vw, MAX)
slope     = (maxPx − minPx) / (maxVw − minVw)
intercept = minPx − slope × minVw        (write it in rem: px / 16)
SLOPE·vw  = slope × 100 vw
```

Example - section title from 24px at 320px to 36px at 1280px:
slope = 12/960 = 0.0125 → 1.25vw; intercept = 24 − 4 = 20px = 1.25rem →
`clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem)`.

Accessibility rules (WCAG 1.4.4 resize text):
- Always include a **rem** part. Pure `vw` doesn't grow with browser zoom or the user's font-size setting.
- Keep **max ≤ 2.5 × min**. Above that, 200% zoom can fail at some widths.
- Body text barely needs to be fluid (e.g. 16 → 18px). Fluid matters most for page titles, section titles and large spacing.
- Never below 12px for any readable text; 16px for form inputs on iOS (smaller zooms the page on focus).

Put fluid values into tokens (CSS variables or Tailwind theme) once, e.g. `--text-title`, `--space-section`, and use them everywhere - don't scatter clamp() through components. If the project has a fixed scale and no fluid tokens, propose them in the plan rather than inventing them silently. If the design system deliberately uses fixed sizes with breakpoint steps, follow it.

Fluid spacing works the same way: `--space-section: clamp(2rem, 1.5rem + 2vw, 4rem)`.

## 4. Text wrapping rules

The goal: **short UI text never wraps or breaks badly; long text wraps nicely.**

| Text type | Rule |
|---|---|
| Buttons, badges, tabs, chips, nav items, table headers, menu items | one line: `white-space: nowrap`. Make room (shorter copy, flex-wrap on the parent, icon-only at small widths with `aria-label`) rather than squeezing. |
| Names, titles, emails in rows/cards | one line + `text-overflow: ellipsis` (`truncate`) + full value in `title` or tooltip. Or clamp to 2 lines (`line-clamp-2`) for titles. |
| Headings | `text-wrap: balance` - even line lengths, no one-word last line |
| Paragraphs, descriptions | `text-wrap: pretty`; max width 60–75ch |
| URLs, IDs, hashes, file paths, user content | `overflow-wrap: anywhere` (works correctly inside flex/grid) |
| Machine strings in code blocks | `white-space: pre-wrap; overflow-wrap: anywhere` or horizontal scroll inside the block |
| Numbers with units | keep together: `white-space: nowrap` or `&nbsp;` between value and unit |

`truncate` only works when the element has a width limit - inside flex, its parent chain needs `min-width: 0` (see next section). Never truncate the only place a critical value appears without a way to see it all.

Also check: translated/long content. Test by mentally doubling the length of labels (German is ~30% longer); layouts must not break.

## 5. Flex and grid rules that prevent overflow

Most horizontal overflow comes from five things:

1. **Flex/grid children default to `min-width: auto`** → a long word or a `nowrap` child pushes the parent wider than the screen. Fix: `min-width: 0` (`min-w-0`) on the flex child that holds text, and on grid tracks use `minmax(0, 1fr)` instead of `1fr`.
2. **Rows that don't wrap** → toolbars, button groups, chip lists. Fix: `flex-wrap: wrap` with `gap`, or collapse into a menu at small widths.
3. **Fixed widths** → `w-[480px]`, `min-width: 600px`, fixed sidebars. Fix: `width: min(100%, 30rem)`, `max-width`, or a container-query change.
4. **Media without limits** → `img, video, svg, canvas, iframe { max-width: 100%; height: auto; }`; always set `width`/`height` or `aspect-ratio` to avoid layout shift.
5. **Wide tables / pre blocks** → wrap in `overflow-x: auto` container.

`100vw` includes the scrollbar and causes overflow on desktop - use `100%` or `100dvw` carefully. Don't hide overflow on `body` to "fix" it; find the element (the audit script lists it).

## 6. Responsive dialogs, sheets and popovers

Pick the container by the task:

| Need | Container |
|---|---|
| Blocking decision, short form, confirm | Dialog (centered). On phones: bottom drawer or full-screen |
| Detail view next to a list, longer edit form | Side sheet on desktop; full-screen or bottom drawer on phones |
| Non-blocking extra info, small picker | Popover. If it needs a submit button, it should be a dialog |
| Page-sized content | A route, not a dialog |

If the project already has a responsive dialog pattern (e.g. shadcn `Dialog` + `Drawer` switched by `useMediaQuery`), use it everywhere in this surface. If it doesn't, propose one in the plan.

Dialog layout rules:
- Width: `width: min(100% - 2rem, 32rem)` (size by content: confirm ~28rem, form ~32–40rem, complex ~48–56rem).
- Height: `max-height: min(90dvh, 48rem)`; header and footer fixed, body scrolls (`overflow-y: auto`). Use `dvh`, not `vh` (mobile browser bars).
- Footer actions: sticky at the bottom; on phones full-width stacked, primary last (closest to thumb) - or follow the project's existing order.
- Accessibility: focus moves in on open, Tab stays inside, Esc closes, focus returns to the trigger, background inert.
- **Prevent modal scroll-lock layout shift (DLG-11)**: When a dialog or sheet opens and locks body scroll (`overflow: hidden` on `body`), removing the native vertical scrollbar causes the background page to lurch horizontally by 15px. Prevent this using `html { scrollbar-gutter: stable; }` or dynamic scrollbar-width compensation padding on `body`.
- **Z-index layering & overlay containment (DLG-12)**: Maintain an explicit, unified z-index scale (e.g. sticky navigation `z-10` < dropdown/popover `z-30` < dialog modal `z-50` < toast alerts `z-[60]`). Avoid arbitrary `z-[9999]` hacks, and ensure popovers and submenus are not clipped by parent containers with `overflow: hidden` (render popovers via Radix/floating-ui portals).
- **Tooltip hover traps & mobile access (DLG-13)**: Tooltips MUST NOT render directly beneath the cursor (blocking clicks on the trigger), MUST NOT dismiss immediately when moving pointer into interactive tooltip content, and MUST NOT be the only access to essential info on mobile devices (provide tap-to-inspect or inline help).
- **Tooltip tautology (DLG-14)**: Never attach a tooltip that merely echoes the exact text of a visible button or link (e.g. a "Save" button with a tooltip saying "Save"). Tooltips are strictly reserved for explaining icon-only buttons, keyboard shortcuts, or truncated text.
- Prevent scroll chaining: Dialog and sheet bodies, side panels, and scrolling drawers must set `overscroll-behavior: contain` (`overscroll-contain`) so scrolling inside does not chain to the document behind (`DLG-10`).
- Forms in dialogs: don't close on backdrop click if there are unsaved changes; confirm discard (`DLG-06`).
- Dialog body content follows the same wrapping and `min-w-0` rules.

### Search, filter & combobox interaction rules
- **Search query race conditions (NAV-06)**: When debouncing search or firing async queries on filter changes, abort in-flight requests (`abortController.abort()` or TanStack Query automatic cancellation). An earlier, slow query (e.g. "ca") resolving after a fast subsequent query (e.g. "car") must never overwrite the newer result set.
- **Search input clear affordance (NAV-07)**: Every search input MUST provide an instant clear (`x`) button when a query is present. Clicking clear must wipe the input, reset search parameters, trigger re-fetch, and retain keyboard focus on the input.
- **Combobox listbox scroll into view (NAV-08)**: When navigating a combobox, command palette, or autocomplete menu with ArrowUp/ArrowDown keys, the highlighted option (`aria-selected="true"`) MUST automatically scroll into the visible viewport of the listbox (`element.scrollIntoView({ block: 'nearest' })`).
- **Post-creation back button history replacement (NAV-09)**: Navigating away after successful entity creation MUST use `router.replace()` rather than `router.push()`. Using `push` leaves the completed creation route in browser history; clicking "Back" navigates users back to the empty or completed creation form, risking duplicate submissions and user confusion.
- **Debounce flush on submit (NAV-10)**: Pressing Enter or clicking a submit button on debounced inputs MUST immediately flush any pending debounce timer and execute with the live, current input value. Failing to flush submits the stale, pre-debounce state and drops the user's latest keystrokes.
## 7. Touch, viewport and safe-area details

- Tap targets ≥ 24×24 CSS px (WCAG 2.5.8), or spaced so a 24px circle around each doesn't overlap another. Aim for 40–44px for primary touch controls.
- Hover-only affordances (actions that appear on hover) need a visible alternative on touch: `@media (hover: none)` → always show, or a `…` menu.
- Sticky bottom bars, floating action bars, and bottom sheets: require `padding-bottom: max(1rem, env(safe-area-inset-bottom))` (`pb-[env(safe-area-inset-bottom)]`) to prevent home bar collision on iOS/Android gesture navigation (`RSP-14`).
- Custom touch targets and quick-interaction buttons: set `touch-action: manipulation` (`touch-manipulation`) on tap targets and segmented controls to eliminate the 300ms double-tap zoom delay on mobile touchscreens (`RSP-15`).
- Use `dvh`/`svh` for full-height layouts; `100vh` jumps on mobile (`RSP-08`).
- Inputs: correct `type`/`inputmode`/`autocomplete`; 16px font on mobile (`RSP-13`).
- Respect `prefers-reduced-motion` for any animation you add (`MOT-01`).
## 8. Tailwind snippets

```html
<!-- Page header: title + action, wraps cleanly -->
<header class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
  <div class="min-w-0">
    <h1 class="text-balance text-2xl font-semibold">Invoices</h1>
    <p class="text-pretty text-sm text-muted-foreground">Sent and draft invoices for this workspace.</p>
  </div>
  <Button class="shrink-0 whitespace-nowrap">New invoice</Button>
</header>

<!-- Row with truncating name and fixed meta -->
<li class="flex items-center gap-3">
  <Avatar class="shrink-0" />
  <div class="min-w-0 flex-1">
    <p class="truncate font-medium" title="{name}">{name}</p>
    <p class="truncate text-sm text-muted-foreground" title="{email}">{email}</p>
  </div>
  <span class="shrink-0 whitespace-nowrap tabular-nums">{amount}</span>
</li>

<!-- Auto grid without orphan columns -->
<div class="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))]">…</div>

<!-- Container-query card (Tailwind v4 built-in; v3 needs @tailwindcss/container-queries) -->
<div class="@container">
  <div class="flex flex-col gap-3 @md:flex-row @md:items-center">…</div>
</div>

<!-- Dialog body that scrolls, footer that stays -->
<DialogContent className="flex max-h-[min(90dvh,48rem)] w-[min(100%-2rem,36rem)] flex-col p-0">
  <DialogHeader className="px-6 pt-6">…</DialogHeader>
  <div className="min-h-0 flex-1 overflow-y-auto px-6">…</div>
  <DialogFooter className="border-t px-6 py-4 max-sm:flex-col-reverse max-sm:[&>*]:w-full">…</DialogFooter>
</DialogContent>
```

## 9. Scroll containment (one scrollbar)

Every screen has exactly one vertical scroll owner. Name it in the plan.

| Shape | Owner | Rules |
|---|---|---|
| App shell (sidebar + header + content) | One content wrapper (`flex-1 overflow-y-auto`) inside a `h-dvh overflow-hidden` shell | The document must never scroll. Nothing in the content may be taller than the scroller can contain. |
| Plain page | The document | No inner `overflow-y: auto` around whole page content. |

Anything else that scrolls (dialog body, table body, dropdown list) is a bounded region with a `max-height`. Views never set their own viewport height; flex ancestors between shell and scroller carry `min-h-0`; use `dvh`, never `100vh`.

**Leak causes (LAY-11, LAY-12):** absolute/`sr-only` elements with no positioned ancestor escape the scroller and grow the document (fix: `relative` on the nearest wrapper, or on the scroll container once in the shell); nested full-page scrollers (fix: remove the inner one, keep bounded regions only); in-flow siblings after the shell; negative margins/translates; portalled popovers left mounted. Never "fix" with `overflow: hidden` on `body` — it hides the symptom and breaks keyboard focus scrolling.

**Find the culprit** (short viewport, e.g. 1361×700):
```js
[document.scrollingElement.scrollHeight, innerHeight]  // equal on shell screens?
[...document.querySelectorAll('*')].filter(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 1)  // the owner, exactly one
```
Elements below the viewport with `position: absolute|fixed` and `offsetParent === BODY` are Cause 1. `scripts/ui_audit.mjs` reports the same as `leakedAbsolute`/`nestedScrollers`; `scripts/scan_patterns.mjs` lists viewport-height containers and `sr-only` lines.

**Checklist:** one named owner; `scrollHeight === innerHeight` at 320/768/1361×700/1920; no nested full scrollers; every `absolute` (incl. `sr-only`) has a positioned ancestor; no view-level `h-screen`/`100vh`; `min-h-0` on flex ancestors; no in-flow siblings after the shell; padding has one owner; checked on every tab/state, not just the first.

Use the project's own class names and tokens; these show structure only.
