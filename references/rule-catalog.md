# Rule catalog

Every finding cites one rule ID from here (or a DESIGN.md rule). In FULL mode every category below gets a row in `04-coverage.md`. In FOCUSED mode, only the categories mapped from the user's request are audited - completely.

These are defaults: when DESIGN.md or the codebase's own primitives decide something differently, they win (design-md.md). Details and fixes live in the linked guides.

Sources: this skill's own guides, Vercel Web Interface Guidelines, Christopher Alexander (A Pattern Language), Don Norman (The Design of Everyday Things, Emotional Design), Rauno Freiberg (Invisible Details), Emil Kowalski (Animations on the Web), impeccable (harden/distill/layout/audit), WCAG 2.2, TanStack Query and React docs, Front-End Checklist (thedaviddias), Jef Raskin (The Humane Interface), John Sweller (Cognitive Load Theory), Mark Weiser (Calm Technology), Daniel Kahneman (Peak-End Rule), Editorial Web Typography & Visual Hierarchy Research.

## Contents
LAY · HIE · RSP · DLG · STA · LDG · PAG · MUT · FRM · ERR · HOOK · A11Y · NAV · CON · CPY · SLOP · MOT · SOUL · HUM · PERF · I18N · THM

---

## LAY - Layout & declutter → hierarchy-declutter.md, scroll-containment.md
- LAY-01 Elements that serve no task in the task list (duplicate titles, decorative icons, welcome banners, stats nobody acts on, helper text repeating the label)
- LAY-02 Things that should be merged (two toolbars, search + filter rows, label/value/unit split across lines)
- LAY-03 Rarely used actions/info shown at full weight instead of in a menu, disclosure or detail view
- LAY-04 Cards in cards; cards used for plain grouping; whole page wrapped in a card
- LAY-05 One uniform gap everywhere; group spacing not tighter than section spacing; margins and gaps stacked
- LAY-06 Holes: `justify-between` gaps, empty grid columns, orphan last-row items, equal-height rows with empty space
- LAY-07 Content stretched on wide screens (no max container width; text > ~75ch; form inputs full-width at desktop)
- LAY-08 Wrapper elements with no purpose (extra divs carrying padding/borders)
- LAY-09 Visual order ≠ DOM/focus order
- LAY-10 Fixed heights on content containers (clips text when content grows)
- LAY-11 Absolute or `sr-only` descendants lack positioned ancestor inside scroller, leaking phantom scroll height and outer scrollbars (see scroll-containment.md)
- LAY-12 Nested scroller inside an existing scrolling container without explicit bounded height or scroll owner delegation

## HIE - Hierarchy → hierarchy-declutter.md
- HIE-01 No single clear primary element/action on the view
- HIE-02 More than one primary-styled button per view/dialog
- HIE-03 More than ~4 text sizes or ~3 weights on screen; weights under 400
- HIE-04 Labels heavier than values; labels used where format makes them obvious
- HIE-05 Grey text on colored backgrounds; secondary text not muted
- HIE-06 Numbers not right-aligned / not `tabular-nums` in tables and stats
- HIE-07 Destructive action styled loud when it's not the point of the view
- HIE-08 Duplicate/redundant buttons triggering the same action visible in the same view (e.g. dual Save buttons at top and bottom of a short card/form, duplicate Create CTAs competing in header and body, uncoordinated action bars)
- HIE-09 Monotone visual weight (flat hierarchy where every card/container has identical contrast, padding, and prominence with no focal entry point or rhythm)
- HIE-10 Competing secondary anchors (eyebrow badges, decorative icons, chips, and colored accents scattered indiscriminately, diluting the primary focal point)
- HIE-11 Unscaled typographic jumps (arbitrary font sizes without modular ratio scale; headings without tight line-heights or balanced wrapping)
- HIE-12 Depth through shadow soup instead of surface luminance (heavy blurry drop shadows instead of calibrated tonal background tiers and crisp hairline borders)

## RSP - Responsive, fluid, wrapping → responsive-fluid.md
- RSP-01 Horizontal page overflow at any width 320–1920
- RSP-02 Flex/grid child holding text without `min-w-0` / `minmax(0,1fr)`
- RSP-03 Short labels (buttons, tabs, badges, th, nav) can wrap; no `whitespace-nowrap` or room made
- RSP-04 Long values (names, emails, IDs, URLs) without truncate+title / `overflow-wrap:anywhere`
- RSP-05 Headings without `text-wrap: balance`; paragraphs without `pretty` (when supported by project)
- RSP-06 Fixed widths (`w-[480px]`, `min-width` px) that exceed small screens
- RSP-07 Rows that don't wrap or collapse (toolbars, button groups, chips)
- RSP-08 `100vh`/`h-screen` instead of `dvh`; sticky bars without safe-area insets
- RSP-09 Pure `vw` font sizes, or fluid max > 2.5× min (zoom failure)
- RSP-10 Reusable component adapts to viewport (media query) where it should adapt to its container
- RSP-11 Tables with no plan below md (no scroll wrapper, no reflow to list)
- RSP-12 Hover-only affordances with no touch alternative
- RSP-13 Mobile input font < 16px
- RSP-14 Sticky / fixed bars, floating sheets, or bottom drawers lack `env(safe-area-inset-*)` padding for mobile notches and home indicators
- RSP-15 Custom touch targets lack `touch-action: manipulation`, causing 300ms double-tap zoom delay on mobile browsers

## DLG - Dialogs, sheets, popovers, menus → responsive-fluid.md §6
- DLG-01 Wrong container for the task (popover with a submit; dialog for page-sized content; modal where inline works)
- DLG-02 Taller than viewport with no internal scroll; footer actions unreachable
- DLG-03 Wider than 320px screens; no phone variant (bottom sheet/full-screen) where the project has one
- DLG-04 Focus not moved in, not trapped, not returned; Esc doesn't close
- DLG-05 Background scrolls behind; layout jumps when scrollbar removed; no `overscroll-behavior: contain`
- DLG-06 Form dialog closes on backdrop/Esc with unsaved changes
- DLG-07 Dialog can close while its mutation is pending (or the request isn't cancelled)
- DLG-08 Menus/popovers clipped by `overflow:hidden` parent or off-screen on phones
- DLG-09 Native `alert()` / `confirm()` / `prompt()` used for UI
- DLG-10 Scrollable panels, sheets, or sidebar drawers lack `overscroll-behavior: contain`, allowing scroll chaining to outer document

## STA - States & edge content → loading-states.md, ux-copy.md
- STA-01 No empty state, or empty state with no next action
- STA-02 "No results for filter/search" not distinguished from "nothing yet"
- STA-03 No error state for a data region; error replaces data that was already shown
- STA-04 No permission/read-only state (buttons shown that will fail)
- STA-05 Breaks with long/very short/emoji/RTL content, 0/1/1000 items, huge numbers
- STA-06 Disabled controls with no reason given
- STA-07 Dead ends: no recovery or next step after an error/empty/success
- STA-08 One component error blanks the whole page (no local error boundary/fallback)

## LDG - Loading & pending → loading-states.md
- LDG-01 Data region with no loading UI (`return null`, blank, bare "Loading...")
- LDG-02 Whole page replaced by a spinner for a partial load
- LDG-03 Skeleton doesn't match final layout (layout shift when data lands)
- LDG-04 Skeleton count/shape wrong; static parts (titles, headers) skeletoned instead of rendered
- LDG-05 Action button with no pending state (not disabled, no spinner, no `aria-busy`)
- LDG-06 Spinner not round / wobbles (shrinks in flex, one dimension set, spin on wrapper)
- LDG-07 Button changes size when entering pending state
- LDG-08 List flashes empty between pages/filters (previous data not kept)
- LDG-09 Infinite skeleton on error (error branch missing)
- LDG-10 Multiple spinner/skeleton styles in the surface
- LDG-11 Legacy skeleton reused for redesigned UI (skeleton retains old layout, dimensions, or elements instead of mirroring the new design)

## PAG - Pagination & lists → pagination.md
- PAG-01 Unbounded query for a list that can grow
- PAG-02 Client-side slicing of a full fetch
- PAG-03 Page params not validated; no server max page size; sort not allow-listed
- PAG-04 Unstable order (no unique tie-breaker)
- PAG-05 Count and page queries use different filters
- PAG-06 Page/size/sort/filters not in URL; filters don't reset page to 1
- PAG-07 Out-of-range page / deleting last row on a page not handled
- PAG-08 Pagination UI: no summary, not fixed-size buttons, no `aria-current`, no phone layout, wraps at 320px
- PAG-09 Different pagination implementations across lists
- PAG-10 Large rendered lists (> ~100 rows) without pagination or virtualization
- PAG-11 Summary aggregate uses different filters than the list it summarizes (tombstone/soft-deleted rows counted in one, excluded in the other)
- PAG-12 Entity status/enum value missing from a breakdown split, count, or filter option (parts don't cover all states)
- PAG-13 Breakdown parts don't sum to the stated total (no "other" bucket for the remainder)
- PAG-14 Soft-delete / archive queries retain active-only filters (e.g. is_current, is_active, archived_at null), causing soft-deleted or obsolete records to return zero rows and vanish from the archive view

## MUT - Mutations → mutations-forms.md §1
- MUT-01 Double submit possible (no pending guard on button and handler)
- MUT-02 No user-visible error when the write fails (swallowed, console only)
- MUT-03 No success feedback, or feedback that doesn't say what happened
- MUT-04 Stale UI after success (list/detail/counts not invalidated or revalidated)
- MUT-05 Optimistic update without rollback on error; no `cancelQueries` before it
- MUT-06 Concurrent mutations overwrite each other / over-invalidation flicker
- MUT-07 Destructive write with no confirm or undo
- MUT-08 Response not checked (`fetch` without `res.ok`; server action result ignored)
- MUT-09 Mutation state leaks: dialog closes/navigates before success; form reset before success
- MUT-10 Request not cancelled/ignored when the component unmounts or inputs change (race)
- MUT-11 Same mutation implemented differently in different places (direct fetch here, hook there)
- MUT-12 Server-side cache holding derived counts/summaries not invalidated on mutation (client queries refreshed, cached aggregate stays stale)
- MUT-13 Cache invalidation on mutation misses child/telemetry queries (primary entity query refreshed, but audit logs, approval histories, activity feeds, or related sub-resources stay stale)

## FRM - Forms & validation → mutations-forms.md §2
- FRM-01 Field without a visible label (placeholder used as label); label not linked (`htmlFor`)
- FRM-02 Wrong `type`/`inputmode`/`autocomplete`/`name`; spellcheck on emails/codes
- FRM-03 Errors not inline next to the field; not linked (`aria-describedby`, `aria-invalid`)
- FRM-04 Focus not moved to first error (or error summary) on submit
- FRM-05 Validation timing hostile: errors while typing the first time; blocks typing; submit disabled until valid with no reason
- FRM-06 Server/validation errors not mapped back to fields (only a generic toast)
- FRM-07 User input lost on error, or form reset before the server confirmed
- FRM-08 No unsaved-changes warning on navigation/close for long forms
- FRM-09 Enter doesn't submit / submits wrong form; textarea ⌘/Ctrl+Enter missing where expected
- FRM-10 Paste blocked; values not trimmed
- FRM-11 Client-only validation (server doesn't validate the same rules)
- FRM-12 Required/optional marking unclear or inconsistent
- FRM-13 Controlled input with `value` but no `onChange` (or expensive per keystroke)
- FRM-14 Separate create/edit form implementations diverging in schema, validation, or layout instead of a unified polymorphic form component (e.g. `<EntityForm mode="create" | "edit" />`)
- FRM-15 Paste blocked on input (`onPaste` with `preventDefault`) on verification codes, passwords, or IDs
- FRM-16 Checkbox or radio control and its label render separate disjoint hit targets with dead zone in between
- FRM-17 `autoFocus` applied unconditionally on mobile / initial load, causing viewport shift and keyboard layout jump
- FRM-18 Non-submitting buttons inside forms lack explicit `type="button"` (utility buttons like file pickers, preview toggles, clear buttons default to `type="submit"`, causing premature submission on click or input Enter keypress; multi-field modal forms lack Enter key suppression on inputs)

## ERR - Error handling → mutations-forms.md §3
- ERR-01 Raw error messages/codes/stack shown to users
- ERR-02 Generic "Something went wrong" with no cause or next step
- ERR-03 Status codes not distinguished (401 → sign in, 403 → no permission, 404 → not found, 409 → conflict, 422 → field errors, 429 → retry later, 5xx → retry)
- ERR-04 No retry action for retryable failures
- ERR-05 Errors not announced (`role="alert"` / `aria-live`)
- ERR-06 Route-level `error.tsx`/error boundary missing or unhelpful
- ERR-07 Network offline/timeout not handled (spinner forever)

## HOOK - React hooks → react-hooks.md
- HOOK-01 Missing/wrong dependency arrays; `exhaustive-deps` disabled
- HOOK-02 Effect used for derived state or event logic (should be render logic or the event handler)
- HOOK-03 Fetch in effect without abort/ignore flag (race, set state after unmount)
- HOOK-04 Missing cleanup (listeners, timers, subscriptions, observers)
- HOOK-05 Stale closure (interval/handler reads old state; missing functional update)
- HOOK-06 State initialised from props and never synced (or synced via effect causing double render)
- HOOK-07 Hooks called conditionally / in loops / after early return
- HOOK-08 Effect loops (sets state it depends on; object/array deps recreated each render)
- HOOK-09 `useMemo`/`useCallback` with wrong deps, or used where it adds nothing
- HOOK-10 Unstable keys (`key={index}` on reorderable/filterable lists; random keys)
- HOOK-11 Hydration mismatch sources (Date/random/`window` in render; `suppressHydrationWarning` overuse)
- HOOK-12 Context value recreated each render causing app-wide re-renders
- HOOK-13 `useLayoutEffect` on the server / layout reads in render
- HOOK-14 Request path, cache key, `href` or required id built from a value that can be missing, so it requests a literal `undefined`/`null`; or an asynchronously loaded component rendered against a changed key while its state still belongs to the previous one (stale async component)

## A11Y - Accessibility → accessibility.md
- A11Y-01 Clickable `div`/`span`; `onClick` navigation instead of `a`/`Link`
- A11Y-02 Icon-only buttons without accessible name; decorative icons not `aria-hidden`
- A11Y-03 Focus not visible (`outline-none` without replacement); focus hidden under sticky elements
- A11Y-04 Contrast below 4.5:1 text / 3:1 large text & UI parts
- A11Y-05 Targets below 24×24 without spacing (or the project's minimum)
- A11Y-06 Color as the only status signal
- A11Y-07 Heading levels skipped / no `h1`; landmarks missing
- A11Y-08 Images without `alt`
- A11Y-09 Dynamic updates (toasts, validation, results count) not announced
- A11Y-10 Zoom disabled (`user-scalable=no`, `maximum-scale=1`)
- A11Y-11 Custom widgets without keyboard support/roles (use the project's Radix/React Aria primitives)
- A11Y-12 Focus obscured by sticky headers/footers/overlays (no `scroll-margin`/`scroll-padding`)
- A11Y-13 Dragging-only or gesture-only interactions without single-pointer/keyboard alternative
- A11Y-14 Keyboard trap (focus cannot exit component or overlay using Tab or Esc)
- A11Y-15 Positive `tabIndex` (`tabIndex > 0`) disrupting natural reading and focus order
- A11Y-16 ARIA misuse: `aria-hidden="true"` on focusable element or container with focusable elements; invalid or conflicting roles
- A11Y-17 Nested interactive elements (button inside button, link inside link, button inside link)
- A11Y-18 Form inputs missing accessible description for error/help text (broken or missing `aria-describedby`)
- A11Y-19 Redundant data entry in multi-step flows without auto-population or selection
- A11Y-20 Cognitive test required for authentication without an accessible alternative (copy-paste blocked, memory-only puzzle)

## NAV - Navigation & URL state
- NAV-01 Filters/tabs/page/sort/open item not in the URL (no deep link, refresh loses it)
- NAV-02 Back/forward doesn't restore state or scroll
- NAV-03 `<title>` doesn't match the view
- NAV-04 Links can't be opened in a new tab (button/onClick navigation)
- NAV-05 Redirects/guards that flash protected content before redirecting

## CON - Consistency → consistency.md
- CON-01 More than one variant of a pattern in the surface (buttons, tables, empty states, dialogs, badges, page headers)
- CON-02 One-off styling instead of the shared primitive
- CON-03 Dates/numbers/currency formatted in more than one way
- CON-04 Terminology differs ("delete"/"remove", "workspace"/"project")
- CON-05 Same action behaves differently (confirm here, not there; toast here, inline there)
- CON-06 Duplicate component or form implementations across routes/pages instead of a shared component (e.g. copy-pasted create vs edit forms, duplicate modal vs page form implementations causing schema/behavior drift)
- CON-07 Patterns reinvented instead of reusing or extending canonical shared primitives or best existing usage
- CON-08 Static/hardcoded item props across workbench views (orchestrating view provides a selector/picker, but child components remain bound to root/default/current items like items[0] or currentVersion instead of dynamically reacting to the active selected variant)

## CPY - Copy → ux-copy.md
- CPY-01 Buttons without verb + object ("Submit", "OK", "Yes")
- CPY-02 Errors without cause + fix
- CPY-03 Empty states without what + action
- CPY-04 Confirmations not naming the consequence
- CPY-05 Banned AI-tell words/patterns, emoji, exclamation marks, Title Case against project style
- CPY-06 Helper text repeating the label; placeholder as label
- CPY-07 `...` instead of `…` in loading/menu labels (if project style uses it); "Loading…" without what
- CPY-08 Straight quotes (`"`, `'`) used in editorial or marketing copy instead of typographic curly quotes (`“`, `”`, `‘`, `’`)
- CPY-09 Missing non-breaking space (`&nbsp;` / `\u00A0`) between numbers and units or key shortcuts (e.g. `10 MB`, `⌘ K`), causing orphan wrapping

## SLOP - Visual slop → anti-slop.md
- SLOP-01 Values outside tokens (hex, arbitrary sizes, new fonts)
- SLOP-02 Decorative gradients, glows, colored left borders, glass effects
- SLOP-03 Template structures (icon-card rows, stat banners, eyebrow labels, badge above title, the generic SaaS page template: hero → features grid → social-proof stats → testimonials → FAQ)
- SLOP-04 More than one place competing for boldness
- SLOP-05 Emoji as icons; mixed icon sets; icons on every label
- SLOP-06 Typography slop: defaulting to one font (e.g. Inter) with no deliberate type pairing/hierarchy, or one type scale with no modular rhythm
- SLOP-07 AI/placeholder people as content: generated avatars (e.g. dicebear/multiavatar), anime/3D mascots, stock faces; content images lacking a real or meaningful `alt`

## MOT - Motion & micro-interactions → motion.md
- MOT-01 No `prefers-reduced-motion` handling
- MOT-02 `transition: all`; animating layout properties (width/height/top/left)
- MOT-03 Same entrance animation on every section; hover lift on non-interactive cards; bounce/fade animations on every hover and scroll entry with no functional intent
- MOT-04 Feedback animations over ~200–300ms; bounce/elastic easing
- MOT-05 Wrong `transform-origin` (popovers growing from the wrong corner, spinner wobble)
- MOT-06 Interactive elements lack micro-interaction feedback on press/active, hover, or focus-visible (dead-feeling controls)
- MOT-07 State transitions (expand/collapse, toggle switches, tab switches, dropdown reveals) jump abruptly or snap without smooth, hardware-accelerated transitions
- MOT-08 Animating layout properties (margin, padding, top/left, height) causing layout thrash instead of composited transform/opacity or CSS grid transitions
- MOT-09 Sluggish micro-interactions exceeding 250ms or multi-stage loops delaying user tasks
- MOT-10 Skeleton-to-content transition flashes or pops without crossfade or smooth settling

## SOUL - Soulful design, craft & tactile finish → soulful-design.md
- SOUL-01 Flat/dead interactive controls with zero active press depression, haptic feedback, or immediate (<100ms) tactile response
- SOUL-02 Non-concentric nested border radii (inner radius doesn't match outer radius minus padding: R_inner ≠ R_outer - P)
- SOUL-03 Uncompensated optical misalignment (geometric centering of triangles, play icons, badges, or mixed-height icon-label locks that look off-center)
- SOUL-04 Jarring, non-continuous state transitions (abrupt snapping between skeleton and content; layout jumps during async data arrival; non-interruptible animations)
- SOUL-05 Monotone cookie-cutter layout devoid of spatial rhythm or focal entry point (every section identical 3-box bento grid without breathing room or asymmetric anchor)
- SOUL-06 Heavy muddy drop shadows or fake gradient glows used in place of calibrated tonal luminance and crisp hairline borders
- SOUL-07 Disconnected spatial provenance (dialogs, popovers, or floating sheets appearing from arbitrary screen coordinates instead of their trigger origin)
- SOUL-08 Artificial, patronizing, or robotic voice (condescending "Oopsie!", fake celebratory emoji confetti, or corporate marketing jargon on operational screens)
- SOUL-09 Lack of fidgetable/satisfying mechanical tactile feedback on toggles, segment controls, sliders, and interactive primitives
- SOUL-10 Fragile edge handling: UI breaks or looks neglected with 0 items, 1 item, 10,000 items, ultra-long strings, or unexpected network latency
## HUM - Human cognitive & emotional experience → human-design-theory.md
- HUM-01 Extraneous cognitive overload: >7 unchunked competing options, form fields, or navigation links presented without grouping or progressive disclosure (Sweller / Miller / Hick)
- HUM-02 Wide Gulf of Execution: Action controls lack visible signifiers or intuitive affordance, requiring mental guesswork or manual documentation (Norman)
- HUM-03 Wide Gulf of Evaluation: System state change after user action is ambiguous, delayed (>100ms), or hidden away from focal gaze (Norman)
- HUM-04 Gestalt proximity violation: Related controls or label-value pairs spaced farther from each other than from adjacent unrelated containers (Gestalt)
- HUM-05 Modality trap: Hidden system mode where identical user actions produce conflicting results without clear persistent ambient state indicators (Raskin)
- HUM-06 Recall over recognition: Forcing users to memorize IDs, codes, or prior screen context instead of pre-populating or providing contextual pickers (Nielsen)
- HUM-07 Attention hijacking: Non-urgent system status, background events, or AI telemetry using high-alert focal interrupts (modal popups, shrill banners, flashing badges) instead of calm peripheral indicators (Weiser / Brown)
- HUM-08 Hostile peak-end resolution: Cold, dead-end error or completion states leaving users feeling abandoned or blamed rather than guided to affirmative recovery (Kahneman)

## PERF - UI performance
- PERF-01 Layout reads in render (`getBoundingClientRect`, `offsetWidth`) / layout thrash
- PERF-02 Images without width/height (CLS); no lazy loading below the fold
- PERF-03 Heavy work on every keystroke (no debounce on search, expensive controlled inputs)
- PERF-04 Whole lists re-render on one row change (unstable props/keys)
- PERF-05 Big blur/backdrop-filter surfaces; `will-change` left on
- PERF-06 Large selectable lists, dropdown menus, or combobox options (>100 items) rendered into DOM without virtualization or pagination

## I18N - Locale & formatting
- I18N-01 Hard-coded date/number/currency formats instead of `Intl` or the project's helper
- I18N-02 Naive pluralization (`item${n!==1?'s':''}`) in an i18n'd app
- I18N-03 Hard-coded strings in an i18n'd app
- I18N-04 Physical CSS (`ml-`, `left-`) in an app that supports RTL
- I18N-05 Fixed-width text containers that break with 30–40% longer translations
- I18N-06 Brand names, asset IDs, code tokens, and system identifiers lack `translate="no"` (or `notranslate`), causing garbled auto-translation

## THM - Theming & dark mode
- THM-01 Colors that don't switch in dark mode (hard-coded)
- THM-02 Contrast fails in one theme only
- THM-03 `color-scheme` not set; native controls unreadable in dark mode
