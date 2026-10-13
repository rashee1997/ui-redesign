# Rule catalog

Every finding cites one rule ID from here (or a DESIGN.md rule). In FULL mode every category below gets a row in `04-coverage.md`. In FOCUSED mode, only the categories mapped from the user's request are audited - completely.

These are defaults: when DESIGN.md or the codebase's own primitives decide something differently, they win (design-md.md). Details and fixes live in the linked guides.

Sources: this skill's own guides, Vercel Web Interface Guidelines, Christopher Alexander (A Pattern Language), Don Norman (The Design of Everyday Things, Emotional Design), Rauno Freiberg (Invisible Details), Emil Kowalski (Animations on the Web), Leonxlnx/taste-skill (taste-skill v2 experimental, redesign-skill, soft-skill, minimalist-skill, brutalist-skill, gpt-tasteskill, output-skill), impeccable (harden/distill/layout/audit), WCAG 2.2, TanStack Query and React docs, Front-End Checklist (thedaviddias), Jef Raskin (The Humane Interface), John Sweller (Cognitive Load Theory), Mark Weiser (Calm Technology), Daniel Kahneman (Peak-End Rule), Roman Kamushken (Data Table UI Design), BuiltUX (Toast Notification Doctrine), NN/g "AI Hallucinations" (Laubheimer 2025), Setproduct "Command Palette UI Design" (Kamushken 2026), Editorial Web Typography & Visual Hierarchy Research.

## Contents
LAY · HIE · RSP · DLG · STA · LDG · PAG · TAB · MUT · FRM · UPL · ERR · NOT · HOOK · A11Y · NAV · CON · CPY · SLOP · MOT · SOUL · HUM · PERF · I18N · THM · AI

---

## LAY - Layout & declutter → hierarchy-declutter.md, responsive-fluid.md §9, taste-engineering.md
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
- LAY-11 Absolute or `sr-only` descendants lack positioned ancestor inside scroller, leaking phantom scroll height and outer scrollbars (see responsive-fluid.md §9)
- LAY-12 Nested scroller inside an existing scrolling container without explicit bounded height or scroll owner delegation
- LAY-13 Narrow display headline wrap (H1 forced into 4+ lines due to narrow container or oversized font; must use wide container max-w-5xl+ and cap at 2–3 lines)
- LAY-14 Hero viewport overflow & top padding leak (hero exceeds initial viewport or top padding > pt-24, floating hero halfway down screen; must use min-h-[100dvh] and fit headline, subtext <=20 words, and CTAs above fold)
- LAY-15 Hero stack overload (>4 text elements in hero; micro-taglines below CTAs, trust micro-strips, or pricing teasers stuffed into hero instead of dedicated sections below)
- LAY-16 Zigzag alternation fatigue (>2 consecutive sections using alternating left-image/right-text split; must break rhythm with bento, full-width, stack, or marquee)
- LAY-17 Bento grid voids & lack of visual variation (empty dead cells in CSS grid without grid-auto-flow: dense, or all cells identical flat text cards with zero image/gradient/tone variation)
- LAY-18 Split-header default pattern ("left big headline + right small body paragraph" as section header without visual justification; must stack vertically or carry real visual in column 2)

## HIE - Hierarchy → hierarchy-declutter.md, craft.md
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
- HIE-13 Duplicate CTA intent (multiple buttons on the same page with identical intent using conflicting labels like "Get in touch" vs "Let's talk" vs "Contact us"; pick one canonical label per intent)
- HIE-14 Multi-column card baseline misalignment (buttons or feature lists in adjacent cards/columns floating at random heights instead of pinned to bottom or aligned on identical baselines)
- HIE-15 Double-bezel / nested enclosure violation (outer shell and inner card container with mismatched radii or flat unrefined border-shadow soup instead of concentric machining R_inner = max(0, R_outer - P))

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
- DLG-11 Modal body scroll-lock (`overflow: hidden` on body) removes scrollbar, causing 15px horizontal layout shift (missing `scrollbar-gutter: stable` or scrollbar width compensation)
- DLG-12 Uncoordinated z-index layers or parent `overflow: hidden` clips popovers, menus, or renders toasts underneath dialogs
- DLG-13 Tooltip appears directly under mouse cursor blocking clicks on the trigger, closes when cursor moves to interactive tooltip content, or lacks mobile touch alternative
- DLG-14 Tooltip tautology: tooltip redundantly repeats the exact visible text of the button or label without adding context or shortcut

## STA - States & edge content → loading-states.md, ux-copy.md
- STA-01 No empty state, or empty state with no next action
- STA-02 "No results for filter/search" not distinguished from "nothing yet"
- STA-03 No error state for a data region; error replaces data that was already shown
- STA-04 No permission/read-only state (buttons shown that will fail)
- STA-05 Breaks with long/very short/emoji/RTL content, 0/1/1000 items, huge numbers
- STA-06 Disabled controls with no reason given
- STA-07 Dead ends: no recovery or next step after an error/empty/success
- STA-08 One component error blanks the whole page (no local error boundary/fallback)
- STA-09 Post-deletion navigation to deleted resource: deleting or archiving an entity leaves user on dead detail view or 404 route without redirecting to parent list with confirmation
- STA-10 Success modal without next action: mutation succeeds but modal offers no next steps ("View item", "Create another", "Return to list"), leaving user stranded on dirty form
- STA-11 First-run blocks or nags: blocking coachmark tour with no skip, or tips that reappear after dismissal, instead of a progressive checklist / contextual hint that persists dismissal

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

## TAB - Tables & data grids → tables-data-grids.md
- TAB-01 Header vs. cell data alignment mismatch (text columns left-aligned, numeric/currency columns right-aligned with `tabular-nums`, date columns consistent; header alignment must match cell alignment)
- TAB-02 Sticky table header has transparent or semi-transparent background, allowing scrolling table rows to bleed through header text
- TAB-03 Multi-select header checkbox scope ambiguous (page vs dataset); page navigation silently wipes selection without persistent state or confirmation
- TAB-04 Row-level actions hidden with mouse-hover-only visibility (`opacity-0 group-hover:opacity-100`, `hidden group-hover:flex`), making them unreachable on touch and invisible to keyboard navigation
- TAB-05 Horizontally scrolling table lacks scroll gradient/shadow edge affordance or lacks frozen key identifier column (`sticky left-0`)
- TAB-06 Truncated data cells (IDs, emails, hashes, error logs) lack tooltip, popover, or copy button for inspecting full content
- TAB-07 Clickable sortable headers lack clear active direction indicators (chevrons) or fail to communicate sort state to assistive tech (`aria-sort`)

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
- MUT-14 Event handler parameter leak: passing function accepting optional argument directly to `onClick` passes synthetic `MouseEvent` into domain argument (e.g. `(id?: string)` receives event object), causing circular JSON serialization failure or `"[object Object]"` request payload
- MUT-15 Un-awaited mutation promise: triggering async mutation without `await` inside handler allows spinner/dialog to dismiss prematurely while request is in flight and drops error handling
- MUT-16 Optimistic payload shape mismatch: optimistic update enriches cache with full nested relations, but server returns partial DTO, shallowly wiping local joined state upon settlement
- MUT-17 Non-idempotent mutation retry storm: automated network retries on POST/write requests omit client idempotency key (`Idempotency-Key` header), risking duplicate row creation or double charge on network drop

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
- FRM-19 Number input (`type="number"`) accidentally steps up/down when mouse wheel scrolls over it while focused or hovered
- FRM-20 Mobile virtual keyboard obscures active form input without automatic smooth `scrollIntoView`
- FRM-21 Date picker converts calendar date to UTC midnight ISO string, causing one-day shift backwards in negative GMT timezones
- FRM-22 Silent character limit truncation: input with `maxLength` lacks visible character count counter or boundary feedback
- FRM-23 Password field lacks accessible show/hide visibility toggle with descriptive `aria-label` and `type="button"`
- FRM-24 Multi-step wizard form loses entered draft state on page reload or back navigation without persistence or warning

## UPL - File uploads & drag-and-drop → file-uploads.md
- UPL-01 Uncontained file drop: missing `dragover`/`drop` `preventDefault` on window/document allows missed drop to navigate tab away to raw file, destroying form and session
- UPL-02 File input does not clear `e.target.value = ''` after selection/upload, preventing re-selecting the exact same file from firing `onChange`
- UPL-03 `URL.createObjectURL(file)` preview lacks `URL.revokeObjectURL(url)` cleanup on file change or component unmount (memory leak)
- UPL-04 Dropzone or file picker fails to state accepted formats (extensions/MIME types) and maximum file size upfront in resting UI
- UPL-05 Multi-file batch upload treats failures as all-or-nothing without per-file progress, error badge, or individual retry
- UPL-06 Large file upload (>1 MB) displays indeterminate spinner without percentage/byte progress or lacks Cancel/Abort button

## ERR - Error handling → mutations-forms.md §3
- ERR-01 Raw error messages/codes/stack shown to users
- ERR-02 Generic "Something went wrong" with no cause or next step
- ERR-03 Status codes not distinguished (401 → sign in, 403 → no permission, 404 → not found, 409 → conflict, 422 → field errors, 429 → retry later, 5xx → retry)
- ERR-04 No retry action for retryable failures
- ERR-05 Errors not announced (`role="alert"` / `aria-live`)
- ERR-06 Route-level `error.tsx`/error boundary missing or unhelpful
- ERR-07 Network offline/timeout not handled (spinner forever)
- ERR-08 Session expiry (401) on form submit redirects to login and permanently discards entered user form data without draft recovery
- ERR-09 Multi-tab authentication desync: session expiration or logout in another tab crashes current tab actions without in-place re-auth modal
- ERR-10 Offline with no banner or queued retry: network drop fails mutations silently with no offline indicator, and no queued resubmit when back online

## NOT - Toasts, notifications & alerts → notifications-toasts.md
- NOT-01 Auto-dismissing critical or actionable error messages on a short timer (<10s) before user can read, copy, or act
- NOT-02 Interactive toast ("Undo", "View", "Retry") fails to pause auto-dismiss timer on mouse hover and keyboard focus; duration <8s
- NOT-03 Batch mutation fires N individual floating toasts instead of single aggregated summary toast, or container exceeds 3 visible toasts
- NOT-04 Toast container occludes primary navigation bars, top-right header action buttons (Save/Publish), or mobile tab bars
- NOT-05 Notification badge count fails to decrement or clear synchronously when notification center is opened or items read

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
- HOOK-15 Uncontrolled-to-controlled input flash: form input binds `value={data?.field}`, which starts as `undefined` while loading, causing React uncontrolled-to-controlled warning and input caret jumping
- HOOK-16 Effect prop-to-state synchronization (`useEffect(() => setState(prop), [prop])`): causes double renders, 1-frame stale flashes, and concurrent rendering tear; must use derived render state or `key` reset
- HOOK-17 Object or array literal in hook dependency array (`[options || {}]`, `[{ filter: true }]`): creates fresh reference each render, causing infinite effect loops or continuous calculation thrashing
- HOOK-18 Stale closure in asynchronous callback or detached listener: interval, WebSocket listener, or async callback captures initial state snapshot instead of using functional state updater (`setState(prev => ...)`) or `useRef`

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
- NAV-06 Search/filter async query race condition: slow earlier request resolves after fast later request, displaying stale search results
- NAV-07 Search input lacks instant clear (`x`) button, or clearing fails to reset active results and focus
- NAV-08 Combobox or autocomplete dropdown navigating with Arrow keys fails to scroll active highlighted option into listbox view
- NAV-09 Post-submission back button trap: creation form redirects with `router.push` instead of `router.replace`, causing browser Back button to return to empty creation form rather than parent list
- NAV-10 Debounced input vs. submit race: pressing Enter or clicking Submit in a debounced field executes before debounce timer flushes, submitting stale pre-debounce query and dropping recent keystrokes
- NAV-11 Command palette missing production states: empty query shows blank instead of 4-6 recents; no-results is a dead end; async results jump without skeleton rows; offline kills local commands; nested page has no visible back (Backspace-only); disabled commands hidden instead of greyed with reason
- NAV-12 Shortcuts and palette undiscoverable: no visible trigger teaching the binding, binding dead inside text inputs, fuzzy matches without highlighted characters, result count not announced to screen readers

## CON - Consistency → consistency.md
- CON-01 More than one variant of a pattern in the surface (buttons, tables, empty states, dialogs, badges, page headers)
- CON-02 One-off styling instead of the shared primitive
- CON-03 Dates/numbers/currency formatted in more than one way
- CON-04 Terminology differs ("delete"/"remove", "workspace"/"project")
- CON-05 Same action behaves differently (confirm here, not there; toast here, inline there)
- CON-06 Duplicate component or form implementations across routes/pages instead of a shared component (e.g. copy-pasted create vs edit forms, duplicate modal vs page form implementations causing schema/behavior drift)
- CON-07 Patterns reinvented instead of reusing or extending canonical shared primitives or best existing usage
- CON-08 Static/hardcoded item props across workbench views (orchestrating view provides a selector/picker, but child components remain bound to root/default/current items like items[0] or currentVersion instead of dynamically reacting to the active selected variant)
- CON-09 Page theme flipping (random light-mode section in a dark-mode page or vice versa without intentional narrative color-block transition)
- CON-10 Color consistency drift (multiple competing accent colors or switching accent colors between sections on the same page; exactly one accent color locked per page)
- CON-11 Corner radius scale incoherence (mixing sharp, soft, and pill radii arbitrarily without a unified, documented radius hierarchy)

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
- CPY-10 Absolute Zero Em-Dash Ban (any em-dash "—" or en-dash "–" used as a design flourish or separator in UI copy, headlines, buttons, or quotes; must use hyphen "-" or restructure with colons/periods)
- CPY-11 Artificial metadata & meta-numbering filler (decorative pseudo-system labels like "SECTION 01", "001 · Capabilities", "QUESTION 05", "v0.6.2", or fake live-stock counters)
- CPY-12 Middle-dot (·) pollution (>1 middle dot per metadata line, or using middle-dots as lazy dividers everywhere)
- CPY-13 Performative craftsman copy register ("Quietly trusted by", "From the field", "On our benches", "We respect the French ones", or ungrounded fake-precise metrics like "99.99%")

## SLOP - Visual slop → craft.md §1
- SLOP-01 Values outside tokens (hex, arbitrary sizes, new fonts)
- SLOP-02 Decorative gradients, glows, colored left borders, glass effects
- SLOP-03 Template structures (icon-card rows, stat banners, eyebrow labels, badge above title, the generic SaaS page template: hero → features grid → social-proof stats → testimonials → FAQ)
- SLOP-04 More than one place competing for boldness
- SLOP-05 Emoji as icons; mixed icon sets; icons on every label
- SLOP-06 Typography slop: defaulting to one font (e.g. Inter) with no deliberate type pairing/hierarchy, or one type scale with no modular rhythm
- SLOP-07 AI/placeholder people as content: generated avatars (e.g. dicebear/multiavatar), anime/3D mascots, stock faces; content images lacking a real or meaningful `alt`
- SLOP-08 Eyebrow spam (>1 eyebrow per 3 sections, count > ceil(sectionCount / 3); small-caps mono labels above every single section header)
- SLOP-09 Div-based fake screenshot / UI mockup (hand-built <div> rectangles simulating software, terminals, or task lists; must use real screenshots, component previews, or imagery)
- SLOP-10 Lazy default "warm craft" palette (cliché bone/cream #f5f1ea + brass/oxblood #b08947 + espresso #1a1714 applied indiscriminately to all premium/consumer briefs; rotate palettes)
- SLOP-11 Plain-text wordmarks on trust walls (using unstyled <span>Acme</span> instead of real SVG marks from Simple Icons / devicon, or printing redundant industry labels under logos)
- SLOP-12 Decorative fake status dots (colored glowing dots placed before every nav link, badge, or list item without real semantic state)

## MOT - Motion & micro-interactions → motion.md, taste-engineering.md §5
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
- MOT-11 Unmotivated animation (adding animations solely for spectacle without communicating hierarchy, storytelling, state transition, or feedback)
- MOT-12 Raw scroll listeners / scrollY in state (window.addEventListener('scroll') or continuous scroll position in React state causing frame drops and layout thrash; must use useScroll, ScrollTrigger, or CSS scroll-driven animations)
- MOT-13 Marquee overflow (>1 continuous horizontal marquee on the same page)
- MOT-14 Fragile scroll-pinning / sticky stack (start trigger misaligned, pinning element while transforming it, or omitting invalidateOnRefresh and resize recalculation)

## SOUL - Soulful design, craft & tactile finish → craft.md §3, taste-engineering.md
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
- SOUL-11 CTA button text wrapping at desktop (CTA text wrapping to 2+ lines due to narrow button or verbose label)
- SOUL-12 Italic descender clipping (display italic words with descenders y, g, j, p, q clipped by tight leading-none without descender clearance leading-[1.1] + pb-1 reserve)
- SOUL-13 Button-in-button nested trailing icon missing (naked arrow icon placed beside CTA label instead of nested within its own distinct tactile pill/circle)
- SOUL-14 Full-output omission (lazy truncation, // ..., placeholder comments, or skeleton code in production deliverables)
## HUM - Human cognitive & emotional experience → craft.md §2
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
- PERF-07 Interaction latency over budget: keystroke-to-paint or palette rank over ~250ms on lists >200 items, with no virtualization and no debounced (150-250ms) + aborted async source

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
- THM-04 Dark elevation parity broken: overlay container not raised above the page surface in dark mode, or shortcut hints / secondary text illegible in one theme only

## AI - AI chat, streaming & generated answers → ai-ux.md
- AI-01 Streaming answer with no stream state or stop control: long AI generation shows blank/spinner, has no progressive tokens or step text, no Stop button, or the dialog can close mid-stream and lose the output
- AI-02 Factual AI answer without source drill-down: generated claims show no links, cards, or reference list into the cited documents, and no trust signal (count / recency)
- AI-03 Generic disclaimer only: the only inaccuracy warning is small-print "can make mistakes", with no contextual first-person uncertainty ("I'm not sure…") or High/Med/Low confidence on low-confidence or high-stakes outputs
- AI-04 Generated answer outranks or blends with deterministic results: AI content shares the list with real commands / records without a labelled group and visible seam
- AI-05 AI action executes without confirm or undo: a prompted write (assign, change status, delete) runs blindly with no preview of what will happen and no undo window
- AI-06 AI output with no feedback or verify path: no thumbs / copy / cite-check affordance and no human-verify next step on answers that matter
