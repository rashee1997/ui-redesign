# Scroll containment - one scrollbar, no blank space at the bottom

> **Defaults only.** If DESIGN.md or the app shell already defines who scrolls (page, shell content area, panel), keep that owner. These rules explain how to find and fix a screen that breaks it.

**Symptoms:** two vertical scrollbars side by side (one for the content area, one for the whole page); empty space below the last block that you can scroll into; the page scrolls a little even though everything fits; the extra space appears only on some tabs/screens, or only when the window is short or narrow.

## Contents
1. Who owns the scroll
2. Cause 1: absolutely positioned elements that escape the scroller
3. Cause 2: nested scroll containers
4. Cause 3: height mismatches (`100vh`, stacked `h-screen`, siblings after the shell)
5. Cause 4: other leaks
6. How to find the culprit in the browser
7. Checklist

## 1. Who owns the scroll

Every screen has exactly one vertical scroll owner. Two common shapes:

| Shape | Owner | Rules |
|---|---|---|
| App shell (sidebar + header + content) | One content wrapper (`flex-1 overflow-y-auto`) inside a `h-dvh overflow-hidden` shell | The document must never scroll. Nothing in the content may be taller than the shell's scroller can contain. |
| Plain page | The document | No inner `overflow-y: auto` wrappers around the whole page content. |

Name the owner in the plan. Anything else that scrolls vertically (dialog body, table body, code block, dropdown list) must be a bounded region with a `max-height`, not a full-page container.

## 2. Cause 1: absolutely positioned elements that escape the scroller (LAY-11)

`overflow: hidden/auto` on an ancestor only clips descendants whose **containing block is inside it**. An `position: absolute` element with no positioned ancestor is placed relative to the initial containing block (`<body>`/`<html>`). It is not clipped by the shell's `overflow-hidden` or by the scroller, but it still counts toward the document's scrollable height.

Result: an invisible 1px absolute element deep inside a long, scrolled panel sits at its in-flow position, hundreds of pixels below the viewport. The document grows to reach it. You get the outer scrollbar and blank space equal to the overshoot.

Usual suspects: Tailwind `sr-only` (absolute, 1px) in list rows, status labels and icon buttons; badges and dots with `absolute` but a non-positioned parent; visually hidden inputs (`checkbox`/`radio` overlays); tooltips rendered inline; `absolute inset-0` overlays on a non-`relative` card.

Fix, in order of preference:
1. Put `relative` on the nearest wrapper of the absolute element (the row, the card, the label). This is the right fix for a one-off.
2. Put `relative` on the scroll container itself (`relative flex-1 overflow-y-auto`) so every absolute descendant is contained and clipped. Do this once in the shell and it covers all views. Check the shell does not rely on absolutes positioned against the page.
3. Do not "fix" it with `overflow: hidden` on `body`: that hides the symptom, breaks keyboard focus scrolling, and leaves the cause.

Applies to a "screen-reader-only" helper like `<span class="sr-only">set</span>` as much as to visible badges.

## 3. Cause 2: nested scroll containers (LAY-12)

A scroller inside another scroller shows two scrollbars. Look for:
- A view root with `h-full overflow-y-auto` rendered inside the shell's scroller.
- A tab panel, card or section with `max-h-*` + `overflow-y-auto` that holds most of the page.
- `h-screen`/`h-dvh`/`min-h-screen` on a view rendered inside a shell that is already viewport-high. The view becomes taller than the shell's content area (viewport minus header and padding), so the scroller scrolls by the header height, producing a pointless scroll range.
- Sticky sidebars (`sticky top-* h-screen`) inside a scroller.

Fix: remove the inner scroller from the view; let content grow and the shell scroll. Keep inner scrollers only for bounded regions (lists with a `max-h`, tables with `overflow-x-auto`, code blocks) and give each a clear height limit. Views never set their own viewport height; they use `min-h-0` and flex growth inside a shell, or natural height.

## 4. Cause 3: height mismatches

- `100vh` on mobile is the largest viewport (browser bars hidden), so the layout is taller than what is visible. Use `dvh` (or `svh`) for full-height layouts.
- Stacked wrappers each at `h-dvh` / `min-h-screen` (root layout + shell + page).
- An in-flow element after the shell in the root layout (a footer, a hidden live region, a cookie banner without `position: fixed`) adds height to a document that was meant to be exactly one viewport. The shell is `h-dvh`, the sibling pushes the document past it.
- Flex children inside the shell without `min-h-0`: the content wrapper cannot shrink below its content, so `flex-1 overflow-y-auto` never scrolls and the shell overflows instead. Every flex/grid ancestor between the shell and the scroller needs `min-h-0`.
- Extra bottom space inside the scroller: padding on both the scroller and the last child, an empty `min-h-*` wrapper, `pb-[100vh]`-style hacks, or a `mb-*` on the last section. Padding belongs to one owner (the scroller).
- Sticky/fixed bottom bars with the page padding not increased to match, or increased twice.

## 5. Cause 4: other leaks

- Negative margins or `translate-*` pushing an element outside the scroller (`-mb-*`, `translate-y-*` on a hover card).
- `transform` on an ancestor changes the containing block for `position: fixed` descendants, so a "fixed" toast/bar scrolls with the content or sits outside the viewport.
- Portalled popovers/sheets left mounted (`forceMount`, closed but not `display: none`) after a route change.
- Third-party widgets (chat bubbles, dev overlays) injecting in-flow nodes into `<body>`. Check they are `position: fixed`.
- Horizontal equivalent: the same absolute-escape trick causes page-level horizontal overflow (`pageOverflow` in the audit).

## 6. How to find the culprit in the browser

Run in the page (or via the browser tool) on the broken screen at a short viewport, e.g. 1361×700:

```js
// 1. Is the document itself taller than the window?
[document.scrollingElement.scrollHeight, innerHeight]

// 2. Which elements scroll vertically (should be exactly the owner)?
[...document.querySelectorAll('*')].filter(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 1)
  .map(e => e.tagName + '.' + String(e.className).slice(0, 60) + ' ' + e.scrollHeight + '/' + e.clientHeight)

// 3. Absolute/fixed elements below the viewport bottom: the usual leak
[...document.body.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(), p = getComputedStyle(e).position;
  return r.bottom > innerHeight + 1 && r.height > 0 && (p === 'absolute' || p === 'fixed'); })
  .map(e => e.tagName + '.' + String(e.className).slice(0, 60) + ' ' + e.textContent.slice(0, 30) + ' offsetParent=' + (e.offsetParent && e.offsetParent.tagName))
```

If #3 returns elements whose `offsetParent` is `BODY`, you found Cause 1. Read the parent chain to choose where `relative` goes. Re-run after the fix; `scrollHeight` must equal `innerHeight`.

`scripts/ui_audit.mjs` reports the same as `leakedAbsolute`, `nestedScrollers` and "Page taller than the window" at each audited width. The audit's tall default viewport can hide it, since a long page still scrolls. Pass a short height too (for example `--height 700`) and a narrow width so the content is longer than the viewport.

`scripts/scan_patterns.mjs` lists viewport-height containers, vertical scroll containers and every `sr-only`/`absolute` line in scope. Those are hints for who owns the scroll and which absolutes need a positioned parent.

## 7. Checklist

- [ ] The screen has one named scroll owner; the document does not scroll when the shell owns scrolling.
- [ ] `document.scrollingElement.scrollHeight === innerHeight` on shell screens at 320, 768, 1361×700 and 1920.
- [ ] No vertical scroller inside another one; inner scrollers are bounded regions with a max height.
- [ ] Every `absolute` element (including `sr-only`) inside a scrolling region has a positioned ancestor inside that region.
- [ ] No view sets its own `h-screen`/`h-dvh`/`100vh`; no `vh` where `dvh` is meant.
- [ ] Flex ancestors between the shell and the scroller carry `min-h-0`.
- [ ] No in-flow siblings after the shell in the root layout; overlays and banners are `fixed`.
- [ ] No blank band below the last block beyond the scroller's own padding; padding has one owner.
- [ ] Checked on every tab/state of the screen (empty, loaded, error, dialog open, accordion expanded), not just the first one.
