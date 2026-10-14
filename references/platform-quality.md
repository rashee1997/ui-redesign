# Platform quality: performance, i18n, theming and newer web-platform rules

Defaults only: DESIGN.md and the project's own primitives win. This guide gives the detect and fix text for categories that had no guide (PERF, I18N, THM) and for six rules that rest on current web-platform features.

## Contents
1. PERF
2. I18N
3. THM
4. Newer platform rules (FRM-25, A11Y-21, MOT-15, PERF-08, STA-12, ERR-11)
5. Sources

## 1. PERF - UI performance

| Rule | Detect (code signal) | Fix |
|---|---|---|
| PERF-01 | `getBoundingClientRect` / `offsetWidth` in render or in a loop with writes | read in an effect or `ResizeObserver`; batch reads before writes |
| PERF-02 | `<img>` without `width`/`height` (or `aspect-ratio`); no `loading="lazy"` below the fold | set dimensions; lazy-load only below the fold (see PERF-08 for the opposite case) |
| PERF-03 | `onChange` firing a request or heavy computation per keystroke | debounce 150-250 ms, abort the stale request, defer non-urgent state with `useDeferredValue` |
| PERF-04 | row components re-render on any row change: inline object/array props, index keys | stable props and keys, `memo` the row only after measuring |
| PERF-05 | large `backdrop-filter` / blur surfaces; permanent `will-change` | limit blur to small overlays; set `will-change` only during the animation |
| PERF-06 / 07 | >100 options or >200 rows rendered at once; keystroke-to-paint over 200 ms (INP "good" threshold); heavy `setState` in an input handler with no `startTransition` | virtualize or paginate; debounce and abort the async source; `startTransition` / `scheduler.yield()` (react-hooks.md §5) |
| PERF-09 | `"use client"` first line of `page.tsx` / `layout.tsx` / a large container that has no hooks, state or handlers | move the directive down to the smallest interactive leaf; keep the static subtree on the server |

## 2. I18N - locale and formatting

| Rule | Detect | Fix |
|---|---|---|
| I18N-01 | `toLocaleDateString()` with literals, template-string money/dates | the project's formatter or `Intl.DateTimeFormat` / `NumberFormat` / `RelativeTimeFormat` |
| I18N-02 | `item${n !== 1 ? 's' : ''}` | `Intl.PluralRules` or the i18n library's plural message |
| I18N-03 | literal strings in JSX of an app that has a message catalog | move to the catalog |
| I18N-04 | `ml-`, `pr-`, `left-`, `text-left`, `rounded-l-` in an RTL-capable app | logical utilities (`ms-`, `pe-`, `start-`, `text-start`, `rounded-s-`) / CSS logical properties; mirror directional icons |
| I18N-05 | fixed widths around text | let text size the box; test with 40% longer strings |
| I18N-06 | brand names, IDs and code tokens in translated pages | `translate="no"` |

## 3. THM - theming and dark mode

| Rule | Detect | Fix |
|---|---|---|
| THM-01 | hex/rgb in components; `dark:` overrides duplicating tokens | semantic tokens that switch at the root |
| THM-02 | contrast measured in one theme only | measure text 4.5:1 and UI parts 3:1 in both |
| THM-03 | no `color-scheme: light dark` | set on `:root` (and per-theme class) so native controls and scrollbars follow |
| THM-04 | dark overlay not lighter than the page; hints illegible | raise elevation by luminance tier, not shadow |

## 4. Newer platform rules

**FRM-25 `:invalid` styling on untouched fields.** Detect: `input:invalid`, `:invalid` or `invalid:` utilities that paint error colour; a pristine required field renders red on load. Fix: `:user-invalid` (Baseline since Nov 2023: matches only after the user interacted or tried to submit) or the form library's touched/dirty flag; keep the inline message wired by `aria-describedby` (FRM-03). `:user-invalid` is styling only and never replaces server-side validation (FRM-11).

**A11Y-21 Meaning lost in forced-colors mode (Windows High Contrast).** In `forced-colors: active` the browser overrides `color`, `background-color`, `border-color`, `outline-color` and SVG fill/stroke, and forces `box-shadow`, `text-shadow` and non-URL `background-image` to `none`. Detect: focus rings, card edges, button boundaries or selected states drawn only with `box-shadow`/`ring-*`/gradients; icons with hard-coded `fill`; custom checkboxes drawn with backgrounds. Fix: give such elements a real or transparent `border`/`outline` (it turns into a visible system colour), use `currentColor` and system colours (`ButtonText`, `Highlight`, `CanvasText`) inside `@media (forced-colors: active)`; make only small targeted tweaks, never a separate design.

**MOT-15 View Transitions without reduced-motion or fallback.** Detect: `document.startViewTransition(...)` called unguarded, or `view-transition-name` / `::view-transition-*` animations with no `prefers-reduced-motion` branch. Fix: feature-detect (`if (!document.startViewTransition) { update(); return; }`), skip the animation for `prefers-reduced-motion: reduce` (run the DOM update directly, or `transition.skipTransition()`), keep the callback pure so the state still updates when skipped. Same-document transitions are Baseline newly available since 2025-10-14.

**PERF-08 LCP image lazy-loaded or de-prioritised.** Detect: the above-the-fold hero/product image with `loading="lazy"`, a framework image component without its priority prop (`priority` in `next/image`) on the first image, or the LCP image set as a CSS `background-image` (not discoverable early). Fix: `<img>` with `fetchpriority="high"`, no lazy attribute, explicit `width`/`height`/`sizes`; lazy-load only below the fold.

**STA-12 Permission denial dead end.** Detect: a role-gated region or a 403 response that renders a blank area, a generic error or a redirect loop; permission checks only in the client (button hidden) with no handling when the server answers 403. Fix: a state that names what is missing ("You need the Auditor role to view this report"), who can grant it (role or owner, from the codebase) and one way forward (request access, back to the list); keep the server as the authority (see FRM-11). Hide an action when the user can never have it; show it disabled with a reason when they could (STA-06).

**ERR-11 429 treated as an ordinary failure.** Detect: rate-limit responses fall into a generic error toast; automatic retry without backoff; a retry button that is active immediately although `Retry-After` was sent. Fix: read `Retry-After` (seconds or HTTP date), show "Too many requests. Try again in 30 seconds.", disable retry until then, and apply exponential backoff with jitter to automatic retries (MUT-17 still applies to writes).

## 5. Sources

MDN `:user-invalid` (Baseline Nov 2023; read 2026-10-14); MDN `forced-colors` (forced property list, `box-shadow` forced to none, tweak-not-redesign guidance; read 2026-10-14); web.dev "Optimize Largest Contentful Paint" and "Fetch Priority API" (never lazy-load the LCP image, `fetchpriority="high"`); web.dev "Same-document view transitions have become Baseline Newly available" (2025-10-16); MDN `Document.startViewTransition()` and `prefers-reduced-motion`; MDN `Retry-After`; web.dev "Interaction to Next Paint" (good ≤ 200 ms) and React docs `startTransition` / `"use client"` (read 2026-10-14).
