# Static audit - the primary method

The audit is done by **reading code**, file by file, against the rule catalog. Grep and the scripts only find candidates and give runtime evidence; they never replace reading.

## Contents
1. Order of work
2. Tracing the surface
3. Per-file pass
4. Cross-file passes
5. Grep recipes (candidate finders)
6. The scripts (secondary)

## 1. Order of work

1. Trace the surface → `02-inventory.md` (§2).
2. Read every file in full, top to bottom, running the per-file pass (§3). Mark Read ✔.
3. Run the cross-file passes (§4): consistency, data flow, state coverage.
4. Run grep recipes (§5) to catch anything the reading missed; open every hit.
5. Optional: run the scripts for runtime evidence (§6).
6. Falsify pass (harness.md §3).
7. Build `04-coverage/` section reports (FULL mode): walk **every rule ID in `rule-catalog.md` in strict sequential order from LAY-01 through AI-06**, recording sections `01-layout-hierarchy.md` through `05-craft-copy.md` with `00-summary.md` rollup. Record each rule as `VIOLATION` (with `F-xxx`), `PASS` (with concrete code proof `file:line`), or justified `N/A`. Verify Gate G1 before moving to plan.
## 2. Tracing the surface

Start at the route entry (`page.tsx`, `route.tsx`, `index.vue`, `+page.svelte`…), plus its `layout`, `loading`, `error`, `not-found` siblings. Then follow, recursively:

- **Render tree**: every imported component until you reach design-system primitives (`components/ui/*`). Read the primitives only for the props/variants used (and their pending/loading/focus behaviour).
- **Things opened from here**: dialogs, sheets, drawers, popovers, menus, command palettes, toasts, confirm dialogs - wherever they're defined.
- **Data in**: every hook/loader/fetch/server component query → follow to the API route, server action, tRPC procedure or DB query. Note: limit, sort, filters, error handling.
- **Data out (mutations)**: every form submit, button `onClick` that writes, server action, `useMutation`, `fetch(... { method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' })` → follow to the handler: validation, error shape, what's invalidated/revalidated afterwards.
- **Shared state**: context providers, stores (Zustand/Redux/Jotai), URL state (`searchParams`, nuqs) the surface reads or writes.
- **Styles**: CSS modules, global classes, Tailwind config/`@theme` tokens used.

Inventory row: `path | role (page/child/dialog/hook/api/query/primitive) | states handled (loading/empty/error/pending/permission) | Read ✔`.

## 3. Per-file pass

Read the file once fully, then walk it with these questions. Record every hit as a candidate with file:line.

**Markup & layout** - LAY, RSP, HIE, SLOP rules
- What's the structure? Wrappers that do nothing? Cards in cards? One uniform gap? `justify-between` holes? Fixed widths/heights? `h-screen`/`100vh`? Missing `min-w-0`/truncation on text in flex/grid?
- Display headlines & hero stability: Does the display headline wrap past 2–3 lines on desktop (`LAY-13`)? Does the hero section overflow the initial viewport via `min-h-[100dvh]` with `pt-24+` pushing CTAs below fold (`LAY-14`)? Does the hero stack exceed 4 text/action items before primary content (`LAY-15`)?
- Layout rhythm & bento density: Does feature alternating zigzag exceed 2 pairs (`LAY-16`)? Does any bento grid card leave empty visual voids or lack dynamic visual variation (`LAY-17`)? Does section header split title left and text right as default filler without asymmetric tension (`LAY-18`)?
- Hierarchy & visual weight: Is there a single dominant focal anchor, or is visual weight flat and monotonous across all cards (HIE-01, HIE-09)? Are eyebrow badges, icons, or chips competing with the headline (HIE-10)? Does typography follow a harmonic scale with tight leading on display headings (HIE-11)? Is depth built with surface luminance tiers instead of blurry drop shadows (HIE-12)?
- Multi-column card baseline: Across horizontal grid/flex card rows, are CTAs, metadata, and badge baselines misaligned across cards due to uneven content heights without `flex flex-col justify-between` (`HIE-14`)?
- Nested container double-bezel: Are nested cards/containers wrapped in identical hairline borders without background luminance shift (`HIE-15`)?
- Actions & buttons: Are there duplicate buttons triggering the same action on the same screen (HIE-08)? Do hero or section CTAs compete with duplicate intents or conflicting weights (`HIE-13`)?
- Copy strings: run them past `ux-copy.md`. Check for em-dashes (`CPY-10`), meta-numbering filler (`CPY-11`), middle-dot overuse (`CPY-12`), and performative marketing jargon (`CPY-13`).

**Accessibility & assistive tech** - A11Y (accessibility.md)
- Controls & names: Does every button, link, and input have an unambiguous accessible name (A11Y-01, A11Y-02)? Are icon-only buttons equipped with `aria-label` or `<span className="sr-only">`? Are interior SVGs marked `aria-hidden="true"`?
- Keyboard & focus: Can every interactive control be reached and activated by keyboard alone? Does focus have an explicit visible ring with ≥3:1 contrast (`focus-visible:ring-2`, A11Y-03)? Are there positive `tabIndex` attributes (`tabIndex > 0`, A11Y-15)? Does visual order match DOM reading order (LAY-09)? Is focus obscured by sticky headers/footers without `scroll-margin` (A11Y-12)? Are there any keyboard traps (A11Y-14)?
- Color & contrast: Does text meet 4.5:1 (3:1 large text) across all themes (A11Y-04, THM-02)? Are UI borders, input edges, and active states at least 3:1? Is status indicated by something other than color alone (icons, text badges, A11Y-06)?
- Touch targets: Do all clickable targets meet at least 24×24px (and 44×44px on mobile) (A11Y-05)? Do drag/swipe gestures have button alternatives (A11Y-13)?
- Forms & validation: Are all inputs linked to labels via `htmlFor`/`id` (FRM-01)? Are validation errors linked via `aria-describedby` and flagged with `aria-invalid` (FRM-03, A11Y-18)? Is redundant data entry avoided (A11Y-19)? Is cognitive testing or paste-blocking present in auth (A11Y-20)?
- ARIA semantics: Are native elements used first? Is `aria-hidden="true"` placed on any focusable element (A11Y-16)? Are interactive elements nested (A11Y-17)?
- Announcements: Are toasts, dynamic updates, and async results announced via `role="alert"` or `role="status"` / `aria-live` (A11Y-09, ERR-05)? Are loading buttons flagged with `aria-busy` (LDG-05)?

**State branches** - LDG, STA
- For every async value: is there a loading, empty, error and success branch? What does each render? Is the loading branch a skeleton that matches the current layout, or is an old/legacy skeleton being reused (LDG-11)?

**Hooks** - HOOK (react-hooks.md)
- Every `useEffect`/`useLayoutEffect`: deps correct? cleanup? is it derived state that shouldn't be an effect? fetch race?
- Every `useState` initialised from props? Every `useMemo`/`useCallback` deps? Custom hooks called conditionally?
- Every request path, cache key, `href` or required id: is it built from a value that can be missing (`undefined`/`null`)? Can any fetch fire with a literal `undefined` segment, or can an asynchronously loaded component render against a key/prop it was not loaded for (HOOK-14)?

**Mutations & forms** - MUT, FRM, ERR (mutations-forms.md)
- Every write: pending state, double-submit guard, error surfaced to the user, success feedback, cache/route revalidation, optimistic rollback?
- Every form: labels, types, autocomplete, validation timing, server errors mapped to fields, focus first error, input kept on error, unsaved-changes guard?
- Input autonomy: Is paste blocked on any field (`FRM-15`)? Do checkbox/radio controls share a single continuous hit target with labels without dead zones (`FRM-16`)? Is `autoFocus` triggering aggressive mobile zoom/keyboard shifts (`FRM-17`)?
- Form deduplication: Is this form nearly identical to another form in another route (e.g. create vs edit) instead of sharing a single polymorphic component (FRM-14, CON-06)? Is there exactly one submit button (HIE-08)?

**Tables & data grids** - TAB (tables-data-grids.md)
- Header vs cell alignment: Are text columns left-aligned and numeric/currency columns right-aligned with `tabular-nums` in both `<th>` and `<td>` (`TAB-01`)?
- Sticky header background: Does `sticky top-0` define an opaque `bg-background` and hairline border, or do scrolling rows bleed through (`TAB-02`)?
- Multi-select scope: Does the select-all checkbox clarify page vs total dataset scope, and does selection survive page navigation (`TAB-03`)?
- Row actions discoverability: Are action buttons hidden behind `group-hover` with no persistent button on touch/keyboard (`TAB-04`)?
- Horizontal scrolling cues: Does the table show a scroll shadow affordance and freeze the primary ID column on wide views (`TAB-05`)?
- Truncated cells: Do truncated text cells (IDs, emails, hashes, error traces) provide a tooltip or copy affordance (`TAB-06`)?
- Sort chevrons: Do sortable headers display explicit direction arrows and `aria-sort` (`TAB-07`)?

**File uploads & drag-and-drop** - UPL (file-uploads.md)
- Drop containment: Does `window`/`document` listen for `dragover`/`drop` and call `e.preventDefault()`, or will an accidental missed drop navigate the browser tab away (`UPL-01`)?
- File input reset: Does the file input clear `e.target.value = ''` so selecting the exact same file fires `onChange` (`UPL-02`)?
- Object URL cleanup: Is `URL.revokeObjectURL(url)` invoked in effect cleanup when previews are replaced or unmounted (`UPL-03`)?
- Upfront constraints: Does the resting dropzone UI state accepted extensions/MIME types and max file sizes upfront (`UPL-04`)?
- Multi-file batch status: Do multi-file uploads show per-file progress and allow retrying failed files without restarting the batch (`UPL-05`)?
- Determinate progress: Do uploads >1 MB display percentage/byte progress metrics and an active Abort button (`UPL-06`)?

**Toasts, notifications & alerts** - NOT (notifications-toasts.md)
- Persistent critical errors: Do actionable errors, error codes, and recovery steps stay persistent instead of auto-dismissing on short timers (`NOT-01`)?
- Interactive toast pause: Do toasts with "Undo" or "View" buttons pause timers on `:hover` and `:focus-within` with ≥8s duration (`NOT-02`)?
- Batch aggregation: Do batch actions emit a single aggregated summary toast instead of a waterfall of individual toasts (max 3 stacked) (`NOT-03`)?
- Viewport occlusion: Are toasts anchored where they do not obscure top action headers or mobile tab bars (`NOT-04`)?
- Badge counter sync: Do unread notification badges decrement synchronously when opened or read (`NOT-05`)?

**Scroll containment & mobile viewport** - LAY-11, LAY-12, RSP-14, RSP-15, DLG-10 (responsive-fluid.md §9 and §§6-7)
- Does any absolute or `sr-only` element lack a positioned ancestor inside its scroller (`LAY-11`)?
- Are there nested scrollers competing for scroll events (`LAY-12`)?
- Do sticky bottom bars/sheets include safe-area insets (`env(safe-area-inset-bottom)`, `RSP-14`)?
- Do tap targets use `touch-action: manipulation` (`RSP-15`)?
- Do scrolling dialogs/sheets/drawers set `overscroll-behavior: contain` (`DLG-10`)?


**Dialogs, tooltips & search navigation** - DLG, NAV
- Does opening a modal cause a 15px layout shift from removing the scrollbar (`scrollbar-gutter: stable`, `DLG-11`)?
- Are overlay z-indexes coordinated, and are popovers free from parent `overflow-hidden` clipping (`DLG-12`)?
- Do tooltips avoid rendering directly under the cursor, and is tooltip info available on mobile touch devices (`DLG-13`)?
- Do tooltips avoid repeating the exact visible button text without added context (`DLG-14`)?
- Do search/filter queries cancel in-flight requests to prevent stale race conditions (`NAV-06`)?
- Do search inputs provide an instant one-click clear (`x`) button (`NAV-07`)?
- Does keyboard arrow navigation in comboboxes scroll active highlighted options into view (`NAV-08`)?
- Does form submission on expired sessions preserve user input instead of hard-redirecting to login (`ERR-08`)?
- Is session logout synchronized across tabs (`ERR-09`)?
- Does offline show a persistent banner with queued retry instead of silent failure (`ERR-10`)?
- Command palette: does empty query show recents, no-results offer exits, async render skeleton rows, local commands survive offline, nested pages show back, disabled rows show reasons (`NAV-11`)? Is the binding taught on a visible trigger, alive inside inputs, with highlighted matches and announced counts (`NAV-12`)?
**AI chat & generated answers** - AI (ai-ux.md)
- Does streaming show tokens + Stop (`AI-01`)? Do factual claims link sources (`AI-02`)? Is uncertainty contextual, not generic small print (`AI-03`)? Are AI rows labelled and never outranking real commands (`AI-04`)? Do AI writes confirm/undo (`AI-05`)? Is there feedback + verify (`AI-06`)?
**Motion & micro-interactions** - MOT (motion.md)
- Do interactive controls provide immediate press feedback within 100ms (`active:scale-[0.98]`, MOT-06)?
- Do state transitions (expand/collapse, tabs, switches, popovers) transition smoothly without layout thrash on height/width (MOT-07, MOT-08)?
- Are durations budgeted ≤ 250ms with `motion-reduce:transition-none` (MOT-01, MOT-09)?
- Motivated motion & scroll integrity: Does every entrance animation serve a cognitive purpose rather than distracting boilerplate fade-ups (`MOT-11`)? Does any component attach a raw `window.addEventListener('scroll')` to track scroll progress in React state (`MOT-12`)? Does the page feature >1 infinite marquee or miss pause-on-hover/reduced-motion (`MOT-13`)? Does any pinned section fail to calculate explicit scroll distance or cleanup triggers (`MOT-14`)?
**Human cognitive & emotional experience** - HUM (craft.md §2)
- Cognitive capacity: Does the screen overwhelm working memory with >7 unchunked options or fields without progressive disclosure (`HUM-01`)?
- Gulf of Execution: Does every actionable control have visible signifiers and intuitive physical affordance (`HUM-02`)?
- Gulf of Evaluation: Does every state change register visible feedback within 100ms in the user's focal gaze (`HUM-03`)?
- Gestalt proximity: Are related labels and inputs closer to each other than to adjacent elements (`HUM-04`)?
- Modality traps: Are there hidden modal states where identical actions cause conflicting results (`HUM-05`)?
- Recognition over recall: Does the UI provide autocomplete pickers and persistent context summaries instead of forcing users to memorize IDs or prior choices (`HUM-06`)?
- Calm attention: Do routine background tasks and non-critical status updates remain in the peripheral awareness rather than interrupting with shrill modal alerts (`HUM-07`)?
- Peak-end resolution: Do error states provide compassionate cause+fix guidance, and do completed workflows offer affirmative closure (`HUM-08`)?

**Soulful design & tactile finish** - SOUL (craft.md §3)
- Physical tactility: Do buttons, switches, and tabs have instant active/press depression (`active:scale-[0.98]`, SOUL-01, SOUL-09)?
- Concentric geometry: Do nested containers follow the Doppelrand rule R_inner = R_outer - P (SOUL-02)?
- Optical alignment: Are asymmetric icons (play, chevron), micro-badges, and mixed text-icon locks optically compensated (SOUL-03)?
- State choreography: Does the skeleton match the content layout 1:1, and does the data transition calmly with a crossfade rather than jarring CLS or abrupt snaps (SOUL-04)?
- Surface elevation: Does depth come from calibrated surface luminance tiers and crisp hairline borders rather than heavy muddy drop shadows (SOUL-06)?
- Human voice: Is copy unpretentious, dignified, and clear without robotic "Oops!" or juvenile cheerfulness (SOUL-08)?
- Desktop button wrap & descenders: Does any CTA button or badge allow text to wrap onto multiple lines at desktop breakpoints (`SOUL-11`)? Do italic serif display headings clip descenders (`g`, `y`, `p`) without explicit line-height and bottom padding (`SOUL-12`)?
- Nested trailing icon & full output: Do pill buttons nest trailing icon circles with proper concentric radius and subtle hover translation (`SOUL-13`)? Are all files emitted in full without placeholder comments or truncations (`SOUL-14`)?

**Data & lists** - PAG, PERF
- Unbounded fetch? Client-side slicing? Big list without pagination/virtualization? Keys stable (not index on reorderable lists)?

**Dialogs** - DLG
- Focus in/trap/return, Esc, scroll inside, footer reachable on phones, unsaved changes, pending blocks close?

## 4. Cross-file passes

- **Consistency** (consistency.md): list every variant of each pattern found across the inventory. Verify Page Theme Lock (no mid-page light/dark flips, `CON-09`), Color Consistency Lock (no extra brand/accent colors outside tokens, `CON-10`), and Corner Radius Scale Lock (no disparate radii, `CON-11`).
- **Anti-slop audit** (rule-catalog.md §4, craft.md §4): Check for eyebrow spam across sections (max 1 per 3 sections, `SLOP-08`), fake div screenshots (`SLOP-09`), lazy warm craft palette drift (`SLOP-10`), plain text wordmarks in trust walls (`SLOP-11`), and decorative unclickable status dots (`SLOP-12`).
- **Component & form reuse** (consistency.md §3): compare forms and complex views across routes. Are separate Create and Edit pages duplicating schemas and JSX instead of sharing a polymorphic `<EntityForm mode="..." />` (CON-06, FRM-14)?
- **Data flow**: for each mutation, which queries show the changed data? Are they all refreshed? (A stale list after "Save" is the most common mutation bug.) For every summary/KPI on the surface, diff its aggregate filters against the list query's filters (PAG-11); list the entity's status enum values and check each lands in one breakdown bucket and one filter option (PAG-12); add the parts and compare with the stated total (PAG-13); for every server cache key holding a derived count, check the mutation paths delete/bump it (MUT-12).
- **State coverage matrix**: region × state (loading / empty / error / pending / no-permission / long content). Empty cells are findings.
- **Navigation**: URL reflects filters/tabs/page/open item? Back button works?

## 5. Grep recipes (candidate finders)

Run scoped to the inventory folders. Every hit must be opened and read in context.

```bash
P="app/(dash)/invoices components/invoices server/invoices"   # the surface

# Hooks
rg -n "useEffect\(|useLayoutEffect\(" $P
rg -n "eslint-disable.*(react-hooks|exhaustive-deps)" $P
rg -n "useState\(\s*props\.|useState\([a-z]+\)\s*;?\s*$" $P
rg -n "setInterval|setTimeout|addEventListener|subscribe\(" $P        # cleanup?
rg -nU "useEffect\([^)]*\{[^}]*fetch\(" $P                              # fetch in effect: race/abort?

# Missing/stale identifiers in request paths, cache keys, hrefs (HOOK-14). Dynamic:
# scope to the surface; it finds any id-driven URL or key, not one endpoint.
rg -nU "(fetch|apiFetch|loadApiData|queryKey|useSWR|href)[^\n]*[\`'\"][^\`'\"]*\\\$\{" $P   # interpolated URL/key/href
rg -n "encodeURIComponent\(\s*[A-Za-z_$][\w$.?]*\s*\)" $P                # is the arg guaranteed non-null?
rg -n "useQuery\(\{|queryKey\s*:" $P                                    # id in the key? enabled: Boolean(id)?
rg -n "set[A-Z]\w*(Component|View|Panel|Preview)\b|LoadedKey|loadedKey" $P  # async component held in state
rg -ni "(undefined|null)" $P | rg -i "api|fetch|href|url|key|path"      # candidate: literal undefined in a request

# Mutations & errors
rg -n "useMutation|mutate\(|mutateAsync|useActionState|useFormState|useFormStatus|useOptimistic|'use server'|\"use server\"" $P
rg -n "method:\s*['\"](POST|PUT|PATCH|DELETE)" $P
rg -n "catch\s*\(\s*\w*\s*\)\s*\{\s*(console\.\w+\([^)]*\);?)?\s*\}" $P   # swallowed errors
rg -n "\.catch\(\s*\(\)\s*=>\s*\{\s*\}\s*\)|catch\s*\{\s*\}" $P
rg -n "invalidateQueries|revalidatePath|revalidateTag|router\.refresh|mutate\(\s*['\"/]" $P
rg -n "alert\(|confirm\(" $P                                             # native dialogs

# Forms
rg -n "<input|<Input|<textarea|<Textarea|<select|<Select" $P
rg -n "placeholder=" $P
rg -n "onPaste|autoFocus|noValidate|aria-invalid|aria-describedby" $P
rg -n "preventDefault\(\)" $P | rg -i "paste"                               # blocked paste (FRM-15)
rg -n "autoFocus\b" $P                                                      # unconditional autoFocus (FRM-17)
rg -n "safe-area-inset|overscroll-contain|touch-manipulation" $P            # mobile viewport & containment (RSP-14, RSP-15, DLG-10)
rg -n "sr-only\b|absolute\b" $P                                             # uncontained absolute/sr-only scroll leaks (LAY-11)
rg -n "type=[\"']number[\"']" $P | rg -v "onWheel"                            # unhandled number wheel step (FRM-19)
rg -n "toISOString\(\)" $P                                                    # potential UTC day-shift on date pickers (FRM-21)
rg -n "maxLength=" $P                                                         # silent character limit cutoff (FRM-22)
rg -n "type=[\"']password[\"']" $P                                            # password visibility toggle (FRM-23)

# Tables & data grids (TAB)
rg -n "<table|<Table|<thead|<tbody|<th\b|<td\b" $P
rg -n "sticky.*top-0" $P | rg -v "bg-"                                        # transparent sticky headers (TAB-02)
rg -n "group-hover:(opacity-100|flex|inline-flex|block)" $P                   # hover-only row actions (TAB-04)
rg -n "aria-sort" $P                                                          # sort indicators (TAB-07)

# File uploads (UPL)
rg -n "type=[\"']file[\"']" $P
rg -n "onDrop|onDragOver" $P
rg -n "createObjectURL" $P | rg -v "revokeObjectURL"                          # unrevoked object URLs (UPL-03)

# Toasts & notifications (NOT)
rg -n "toast\.(success|error|info|warning|custom)" $P
rg -n "toast\.error.*duration:\s*[1-9]\d{2,3}\b" $P                           # vanishing error toasts <10s (NOT-01)
rg -n "forEach.*toast\." $P                                                   # toast storm on batch operations (NOT-03)

# Dialogs, overlays & search (DLG-11..14, NAV-06..08, NAV-11..12)
rg -n "scrollbar-gutter" $P                                                   # modal scroll-lock layout shift (DLG-11)
rg -n "z-\[\d+\]|z-50|z-40|z-30" $P                                          # z-index layering conflicts (DLG-12)
rg -n "<Tooltip|<TooltipContent" $P                                           # tooltip tautology & hover traps (DLG-13, DLG-14)
rg -n "useDebounce|useQuery.*search|abortController" $P                       # search race conditions & cancellation (NAV-06)
rg -n "cmdk|CommandDialog|CommandInput|use-shortcut|aria-activedescendant" $P # palette states & discoverability (NAV-11, NAV-12)

# AI chat & streaming (AI-01..06)
rg -n "useChat|streamText|stop\(\)|isStreaming|isLoading.*ai" $P               # stream state + stop control (AI-01)
rg -n "sources|citations|references" $P | rg -v "^\s*//"                      # source drill-down present? (AI-02)
rg -n "can make mistakes|may (hallucinate|be (wrong|inaccurate))" $P          # generic disclaimer only? needs contextual uncertainty (AI-03)

# Loading / states
rg -n "isLoading|isPending|isFetching|status ===|loading\b" $P
rg -n "return null|Loading\.\.\.|Loading…" $P
rg -n "length\s*===\s*0|\.length\s*\?|!data\b" $P

# Aggregate vs list parity (PAG-11, PAG-12, PAG-13) - dynamic: resolve the names per surface
rg -n "COUNT\(\*\)|count\(\{|groupBy|FILTER\s*\(WHERE" $P          # every aggregate over the listed entity
rg -n "not:|notIn:|NOT IN|!=='|!=\"|status.*obsolete|is_deleted|deleted_at|archived" $P  # exclusion filters: present in list query but missing in aggregate (or vice versa)?
rg -n "z\.enum\(|as const\]|UNION.*status|CHECK.*status" $P        # the status enum: every value must land in one breakdown bucket + one filter option
rg -n "byStatus|byDepartment|breakdown|split|statusCounts" $P     # breakdowns: add the parts, compare with the stated total
rg -n "\.set\(|cache.*set|CACHE_KEY|ex:\s*[0-9]" $P               # server cache writes holding derived counts
rg -n "\.del\(|invalidate|bump|version.*cache" $P                 # cache invalidation: every set above needs a del on each mutation path (MUT-12)

# Layout & hero stability (LAY-13..15, LAY-17)
rg -n "h-screen|100vh|w-\[\d|min-w-\[\d|h-\[\d" $P
rg -n "min-h-screen|min-h-\[100dvh\]" $P                                       # hero viewport overflow (LAY-14)
rg -n "col-span-2.*row-span-2|grid-flow-dense" $P                              # bento voids & dense flow (LAY-17)

# Anti-slop & copy hygiene (CPY-10..12, SLOP-01..12)
rg -n "#[0-9a-fA-F]{3,8}\b|-\[[^\]]+\]" $P                              # raw values (SLOP-01)
rg -n "font-family|Inter\b|sans-serif\b" $P                              # single/default font, no pairing (SLOP-06)
rg -n "dicebear|multiavatar|avataaars|unsplash|\bstock\b|placeholder" $P # AI/placeholder people as content (SLOP-07)
rg -n "bg-gradient|from-(purple|violet|indigo)|shadow-\w+/\d+" $P
rg -n "tracking-widest|uppercase.*tracking" $P                                # eyebrow pill spam (SLOP-08)
rg -n "rounded-full\s+size-[23]\s+bg-(green|emerald|amber)-" $P               # decorative status dots (SLOP-12)
rg -n "key=\{(i|index|idx)\}" $P
rg -n "toLocaleDateString|toFixed\(|new Date\(.*\)\.to" $P
rg -n "[\"'][^\"']*\"[^\"']*[\"']" $P                                      # straight quotes in strings (CPY-08)
rg -n "\d+\s+(MB|GB|KB|px|rem|%|items|records|documents)\b" $P              # missing non-breaking spaces before units (CPY-09)
rg -n "—|–|--\s" $P                                                           # em-dash / en-dash / double-hyphen ban (CPY-10)
rg -ni "(SECTION\s*0[1-9]|STEP\s*0[1-9]|0[1-9]\s*//|0[1-9]\s*/)" $P           # artificial meta-numbering (CPY-11)
rg -n "·|&middot;|&#183;" $P                                                  # middle-dot rationing (CPY-12)
rg -n "translate=[\"']no[\"']|notranslate" $P                              # untranslated system tokens/IDs (I18N-06)

# Accessibility & assistive tech (accessibility.md)
rg -n "onClick" $P | rg -v "<(button|Button|a |Link|DropdownMenuItem|MenuItem)"  # div/span as button (A11Y-01)
rg -n "<(button|Button)[^>]*>\s*<svg" $P                                          # icon-only button: has aria-label? (A11Y-02)
rg -n "outline-none|outline:\s*none|outline-0" $P | rg -v "focus-visible:"       # focus killed without replacement (A11Y-03)
rg -n "tabIndex=\{?[1-9]" $P                                                     # positive tabIndex (A11Y-15)
rg -n "aria-hidden=[\"']true[\"'][^>]*<(button|a|input|select)" $P               # aria-hidden on interactive (A11Y-16)
rg -n "<(button|Button)[^>]*<button|<a[^>]*<a" $P                                 # nested interactives (A11Y-17)
rg -n "role=[\"'](button|link)[\"']" $P                                          # manual roles instead of native elements
rg -n "<img|<Image" $P | rg -v "alt="                                            # missing image alt (A11Y-08)
rg -n "user-scalable\s*=\s*no|maximum-scale\s*=\s*1" $P                         # zoom disabled (A11Y-10)
rg -n "onPaste.*preventDefault" $P                                                # blocked paste / cognitive auth (A11Y-20, FRM-15)

# Motion & micro-interactions (motion.md)
rg -n "transition-all|transition:\s*all" $P                              # layout thrashing risk (MOT-02)
rg -n "animate-bounce|animate-pulse" $P                                  # distracting/slop animation (MOT-04)
rg -n "duration-\[?[3-9]\d{2,}\]?" $P                                   # sluggish >250ms transitions (MOT-09)
rg -n "<(button|Button)" $P | rg -v "active:"                           # missing press micro-feedback (MOT-06)
rg -n "(animate-|transition)" $P | rg -v "motion-reduce:"               # missing reduced motion fallback (MOT-01)
rg -n "addEventListener\(['\"]scroll['\"]" $P                                  # raw scroll listener in state (MOT-12)
rg -n "<Marquee|animate-marquee" $P                                            # marquee count & overflow (MOT-13)
rg -n "ScrollTrigger\.create" $P                                               # pinned scroll distance & cleanup (MOT-14)

# Duplicate actions & shared form sprawl (HIE-08, CON-06, CON-07)
rg -n "type=[\"']submit[\"']" $P                                        # multiple submit buttons on same view? (HIE-08)
rg -n "useForm\b|z\.object\(" $P                                         # duplicate form definitions across routes? (CON-06, CON-07)
# Shared-primitive reuse vs one-off variants (CON-01, CON-02, CON-07)
rg -n "components/ui/" $P                                                # shared primitives; one-off variants are candidates

# Hierarchy & depth (HIE-09..HIE-15)
rg -n "shadow-(lg|xl|2xl)" $P                                                # shadow soup instead of surface luminance (HIE-12)
rg -n "text-\[\d+px\]" $P                                                    # arbitrary unscaled font sizes (HIE-11)

# Soulful craft & tactile finish (SOUL-01..SOUL-14)
rg -n "rounded-[a-z0-9]+" $P                                                 # check nested radii for concentricity: R_inner = R_outer - P (SOUL-02)
rg -n "<(Play|Chevron|Arrow)" $P                                             # check optical alignment compensation on directional icons (SOUL-03)
rg -n "italic.*font-serif|<em\b" $P                                            # italic descender clipping check (SOUL-12)
rg -n "<(Button|button)[^>]*class.*(w-full|flex-1)" $P                         # desktop CTA wrap candidates (SOUL-11)

# Dynamic item binding & form button safety (CON-08, FRM-18, PAG-14, MUT-13)
rg -n "<(button|Button)[^>]*" $P | rg -v "type="                            # button inside form without explicit type="button"? (FRM-18)
rg -n "items\[0\]|versions\[0\]|approvals\[0\]|currentVersion" $P           # static/hardcoded item props in master-detail/workbench? (CON-08)
rg -n "includeObsolete|is_obsolete|status.*obsolete" $P                     # archive query: does it incorrectly filter is_current/is_active? (PAG-14)
rg -n "invalidateQueries" $P                                                # mutation invalidation: does it miss audit-logs or child telemetry? (MUT-13)
```

If `rg` isn't installed, use `grep -rnE` with the same patterns.

If the project has lint rules for these (eslint-plugin-react-hooks, jsx-a11y), run the linter on the surface files too and treat its output as candidates - but don't "fix" by adding `eslint-disable`.

## 6. The scripts (secondary)

The bundled scripts are optional helpers, never the audit itself:
- `scripts/scan_patterns.mjs` - a quick candidate list (spinners, unbounded queries, missing pending states, variant counts). Treat like grep.
- `scripts/ui_audit.mjs` - needs the app running. Use it for **runtime evidence**: horizontal overflow and wrapped labels at many widths, layout shift, console/network errors, what loading looks like, pending buttons. Use its output to confirm or add findings and in Phase 5 for before/after numbers.

If the app can't run, say so and rely on the static audit; never skip findings because the script couldn't confirm them.
