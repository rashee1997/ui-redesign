# Hierarchy and decluttering

> **Defaults only.** Everything here is a fallback for what the project's own DESIGN.md and existing code don't decide. If DESIGN.md sets a value or rule for the same thing (breakpoints, spacing, sizes, component choices, banned or required styles, voice), follow DESIGN.md and use its names. See `design-md.md`.

## Contents
1. Diagnose first & the "No-Asset Monochrome" test
2. Declutter moves (in order of preference)
3. Building hierarchy with soul & craft
4. Harmonic typography scale & optical pacing
5. Spacing rhythm & editorial whitespace
6. Tonal depth & elevation without card soup
7. Actions & button architecture
8. Tables, lists and dense data
9. Page shell patterns

## 1. Diagnose first

Answer these for the current screen. Each "no" is a finding.

- Squint test (blur the screenshot): can you tell in 2 seconds what the page is and what the main action is?
- **The "No-Asset Monochrome" test**: If all photos, illustrations, and accent colors are stripped away, does the layout's typographic scale, tonal contrast, and spatial cadence still communicate clear hierarchy and character?
- Is there exactly one dominant focal anchor (North Star), or is the view a flat field of equal-weight cards whispering at the same volume (HIE-01, HIE-09)?
- Are secondary elements (eyebrow badges, decorative icons, status chips) competing with the headline or primary action for attention (HIE-10)?
- Are there ≤ 3 levels of text emphasis visible (e.g. title / body / meta)?
- Do font sizes follow a consistent modular ratio scale with calibrated optical line-heights (HIE-11)?
- Can you tell which items belong together without reading them?
- Does depth come from subtle surface luminance tiers and crisp hairline borders rather than heavy blurry drop shadows (HIE-12)?
- Does every visible element serve a task in the task priority list?
- Is spacing varied on purpose (tight inside groups, looser between them), or is it one gap everywhere?
- Are there regions of empty space that don't frame anything (holes)?

## 2. Declutter moves (in order of preference)

Try them in this order. Earlier moves remove noise; later ones only move it.

1. **Remove** - things that serve no task: duplicate titles (page title + card title saying the same), decorative icons next to every label, helper text that repeats the label, "Welcome back!" banners, stats nobody acts on, dividers between already-separated items.
2. **Merge** - two toolbars into one; a filter row and a search row into one bar; label + value + unit into one line.
3. **Demote** - rarely used actions into an overflow menu (`…`); secondary info into a tooltip, expandable row or detail panel; advanced settings behind "Advanced".
4. **Defer** (progressive disclosure) - show the summary, reveal details on click. A section the task list ranks low starts collapsed.
5. **Move** - only now rearrange.

Everything you remove or hide goes in the plan so the user can object.

### Declutter is mandatory in every redesign

Any redesign that changes layout must run a full declutter pass before structure is planned. Go through **every visible element** of the page and of each dialog, and record a decision in the plan's declutter table:

| Element | Task it serves (from task list) | Decision | Where it goes |
|---|---|---|---|
| "Welcome back" banner | none | Remove | - |
| Stats row (4 tiles) | glance at totals (rank 4) | Merge | one summary line in header |
| Export, Print, Archive buttons | rare (rank 6) | Demote | `…` menu |
| Advanced filters | rare | Defer | "More filters" sheet |
| Search + 3 filter dropdowns on 2 rows | find invoice (rank 1) | Merge | one toolbar row |

Decisions: **Keep / Remove / Merge / Demote / Defer / Move**. An element with no task gets Remove unless the user says otherwise.

Also cut, at every level:
- **Visual**: 1–2 accent colors plus neutrals; one type family, 3–4 sizes, 2–3 weights; drop borders, shadows and backgrounds that don't express grouping or state.
- **Structure**: flatten nesting; remove wrappers and decorative containers; no cards for basic layout.
- **Interaction**: fewer choices, smart defaults, inline edit instead of a modal where it's simpler, one obvious next action.
- **Copy**: shorter sentences; no headers that restate an intro; say it once.

Never declutter away: functionality users need (move it, don't delete it), accessibility labels, information needed to make the decision on this screen, or the hierarchy itself. Simplicity means fewer obstacles, not fewer features.

## 3. Building hierarchy with soul & craft

Generic "AI slop" or bland corporate UI treats every component with identical visual decibels: every card gets the same border, same padding, same font size, and a decorative icon. The result is visual mush where nothing invites the eye.

Hierarchy with "soul" and craft is the deliberate orchestration of gravitas, rhythm, and tension. It tells a human story before a single word is read.

### The Focal Anchor (The "North Star" Entry Point)
- Every screen or primary viewport must have exactly **one dominant focal anchor** (HIE-01, HIE-09). This is the element with the highest visual weight-a bold editorial heading, a key data visualization, or the primary working surface.
- **Emphasize by de-emphasizing**: To make the hero element sing, quiet the surrounding canvas. Before enlarging a headline or coloring a button, strip decoration from secondary panels, mute helper text, and reduce surrounding container borders.
- **Eliminate competing secondary anchors (HIE-10)**: Banish decorative eyebrow badges (`✨ NEW`), icon badges next to every heading, and high-saturation status tags scattered across every card. When everything claims urgency, nothing has priority.
- **Intentional Asymmetry & Weight**: Avoid rigid, repetitive 3-column or 4-column cookie-cutter layouts. Use asymmetric distribution (e.g. 8/4 split, dominant focal column + contextual sidebar, or hero lead card + compact secondary list) to guide the eye along a natural reading arc.

### The 5 Tools of Visual Hierarchy
Tools ordered from strongest to most subtle:
1. **Size**: Scale disparity creates immediate dominance.
2. **Weight**: Optical thickness guides scannability (semibold/bold for anchors; regular for body).
3. **Color & Tonal Contrast**: Foreground luminance against background (high contrast for primary; muted for secondary).
4. **Position**: Natural gaze patterns (top-left entry on LTR, terminal edges for actions).
5. **Whitespace**: Generous isolation elevates an element without adding visual ink.

**The Rule of Two**: Never combine more than two hierarchy tools on a single element (e.g. larger size + bolder weight is sufficient; adding a loud background color and heavy border creates visual screaming).

## 4. Harmonic typography scale & optical pacing

Soulless interfaces often mix arbitrary pixel sizes (`text-[15px]`, `text-[21px]`) that feel discordant, or maintain tiny size steps that blur hierarchy (HIE-11).

### Modular Ratio Scales
Ground type sizes in a disciplined geometric scale (map to the project's tokens):
- **Web App / Dense UI**: Minor Third (1.200) - tighter steps for compact data screens.
- **Marketing / Editorial / Portfolios**: Major Third (1.250) or Perfect Fourth (1.333) - expressive contrast that gives dramatic punch to headlines.

### Optical Leading & Tracking Calibration
As typography scales up, physical spacing must adapt optically:
- **Display Headings (≥ 24px / 1.5rem)**: Must use tight line-height (`leading-[1.1-1.2]` / `leading-tight`) and tight tracking (`tracking-tight` / `-0.02em`). Default loose line-height on large headings causes words to drift apart into detached lines.
- **Body Prose (14–16px / ~1rem)**: Needs comfortable reading line-height (`leading-relaxed` / ~1.5–1.6) and normal tracking (`tracking-normal`) for effortless scanning.
- **Micro-labels & Badges (10–12px)**: Require medium weight (`font-medium` / 500) and slightly wider tracking (`tracking-wider` / `+0.03em` if uppercase) to prevent small glyphs from filling in.
- **Line Balancing**: Always apply `text-wrap: balance` to headings (RSP-05) to eliminate awkward single-word orphan wraps on fluid viewports.

### Type Role Map

| Role | Typical token | Optical treatment |
|---|---|---|
| Page title / Hero | `text-2xl` to `text-4xl` | Semibold/bold, tight leading (`leading-tight`), `tracking-tight`, `text-wrap: balance` |
| Section title | `text-lg` to `text-xl` | Semibold, `leading-snug`, default color |
| Card / Group heading | `text-sm` to `text-base` | Medium or semibold, default color |
| Body / Values | `text-sm` or `text-base` | Regular (400), `leading-relaxed`, default or slightly softened neutral |
| Labels / Meta | `text-xs` | Medium (500), muted color (`text-muted-foreground`), concise |
| Metrics / Numbers | `text-xl` to `text-3xl` | Bold or semibold, tabular figures (`tabular-nums`), right-aligned |

Rules:
- Labels are a last resort: `jane@example.com` needs no "Email:" prefix if format and context are obvious.
- Never use weights below 400 for interface text; to soften, use muted semantic colors (`text-muted-foreground`) or smaller scale steps.
- Numbers in tables, dashboards, and comparative lists must always be right-aligned with tabular figures (`font-variant-numeric: tabular-nums`) (HIE-06).

## 5. Spacing rhythm & editorial whitespace

Negative space is not empty void-it is structural rhythm and pacing. Awkward gaps usually stem from applying one uniform gap everywhere or unconstrained flex containers.

### Pacing Tiers (The Proximity Rule)
Spacing values must come exclusively from token scales and vary by hierarchy level:
- **Micro-clustering (4–8px / gap-1..gap-2)**: Binds tightly related items (icon + label, title + status badge, input + helper text).
- **Meso-group spacing (16–24px / gap-4..gap-6)**: Separates distinct fields within a form, or cards within a single collection.
- **Macro-section pauses (32–64px+ / gap-8..gap-16)**: Marks transitions between major semantic chapters of a screen.

Adjacent spacing steps should differ by ≥ 25% so the eye perceives the structural difference instantly (LAY-05).

### Awkward Gaps Diagnostic Table

| Cause | What it looks like | Fix |
|---|---|---|
| One uniform gap everywhere (`gap-6` on everything) | nothing looks grouped; page feels loose | proximity scale: inside group (4–8) < between groups (12–24) < between sections (32–64), from tokens |
| `justify-between` on a wide row | title far left, one button far right, big hole between | keep related things together; put actions next to what they act on, or constrain row width |
| Fixed-column grid with fewer items | `grid-cols-4` with 3 items → empty column | `grid-template-columns: repeat(auto-fill/auto-fit, minmax(16rem, 1fr))`, or explicit layout per count |
| Last row orphan | 7 cards in 3 columns → one alone | `auto-fit` + sensible min, or make one item span, or change min width |
| Stretched content on wide screens | line length 150+ chars, form inputs 1600px wide | `max-width` on the container (e.g. `max-w-screen-xl`) and on text (`max-w-prose` / 65–75ch); forms ~ 32–40rem |
| Equal-height grid rows with unequal content | tall empty space inside cards | `align-items: start` or `grid-auto-rows: auto`, or rethink as a list |
| Sidebar + content with fixed heights | empty strip under the shorter column | let heights be content-driven; sticky sidebar instead of stretched |
| Margins stacked on padding | double spacing between some sections only | pick one owner of spacing: the parent (`gap`/`space-y`), not child margins |
| Empty wrapper divs with padding | invisible boxes of space | remove the wrapper |
| Hero/header with huge vertical padding on an app screen | content pushed below the fold | app screens are for work; keep headers compact |

Use `gap` on the parent over margins on children. Spacing values come from the token scale only; adjacent steps should differ by ≥ ~25% so they read as different.

## 6. Tonal depth & elevation without card soup

Bland UI wraps everything in identical rounded cards with fuzzy drop shadows (`shadow-md`), creating visual fatigue. High-craft UI builds depth through **tonal surface luminance** and crisp hairline borders (HIE-12).

### Surface Luminance Architecture
Stack surfaces logically to convey physical elevation:
1. **Base Canvas**: Neutral background (`bg-background` or subtle tinted floor).
2. **Recessed Wells (`bg-muted/30` or `bg-secondary/40`)**: For search/filter bars, secondary sidebars, code blocks, or inset table headers.
3. **Elevated Surfaces (`bg-card`)**: The main working sheets or actionable containers.
4. **Floating Overlays (`bg-popover`)**: Modals, dropdowns, tooltips, and floating batch bars.

### Hairline Borders vs. Shadow Soup
- Replace muddy, dark drop shadows with crisp 1px hairlines: `border border-border/50` or `ring-1 ring-border/40`.
- If elevation is needed for floating elements, use minimal ambient diffusion (`shadow-xs` or `shadow-sm`) paired with a hairline border-never raw dark dropshadows.

### The 5 Grouping Mechanisms (Try in Order)
1. **Space alone** (a bigger gap before the next cluster).
2. **A heading** above the cluster.
3. **A divider** (hairline border, token color) between clusters.
4. **A subtle background band** or tinted panel.
5. **A card** - reserved *strictly* for units the user can act on (open, select, drag, reorder, delete) or items in a multi-item collection.

Never cards inside cards. Never wrap an entire page in a single giant card when the screen is already a surface. A settings page is usually clean sections with headings and dividers, not a vertical stack of boxed cards.

## 7. Actions & button architecture

- One **primary** button per view (or per dialog) (HIE-02). Everything else secondary, outline or ghost.
- **Deduplicate repeated buttons with the same action (HIE-08)**:
  - **Single canonical action trigger**: Having two identical buttons on the same screen (e.g. "Save" at the top of a card AND "Save" at the bottom, or duplicate "New Document" CTAs competing in the header and toolbar) clutters the interface, creates decision hesitation, and risks double execution. Pick ONE canonical location.
  - **Short/medium views (≤ 1.5 viewports)**: Remove the duplicate. Forms place actions at the end/footer of the fields where the eye finishes; page-level entity actions sit in the page header. Never show twin static buttons visible simultaneously.
  - **Long scrolling views (> 2 viewports)**: If users need access to submit without scrolling back, use a coordinated sticky header or bottom bar. Never show both buttons active at the same time in the same viewport-hide or dock the action into the sticky bar once the in-page button scrolls out of view.
  - **Empty states vs toolbars**: When a table is empty, the primary CTA belongs in the empty state illustration/card. Demote or hide the duplicate toolbar CTA so users aren't presented with two identical "Create" prompts in the same glance.
  - **Row actions vs batch actions**: When the same action repeats on every table row (e.g. "Delete"), distinguish them accessibly (`aria-label="Delete invoice #1024"`, not bare "Delete"). For multi-select, move repeated row actions into a single consolidated floating batch bar.
- Order: the primary is where the eye ends - usually right of a group on desktop (follow the project's existing convention; check other dialogs).
- On phones, primary actions reach the thumb: full width at the bottom of a form/dialog, or a sticky action bar.
- Destructive actions: quiet until they're the point (in a confirm dialog they become the primary, destructive variant).
- Icon-only buttons need an accessible name (`aria-label`) and a tooltip; ≥ 24×24 target (44×44 on touch-heavy screens is better).
- Row actions: show the 1–2 most used inline, the rest in a `…` menu.
- Micro-interactions: buttons provide instant active press feedback (`active:scale-[0.98]`, see `motion.md`).

## 8. Tables, lists and dense data

- Tables below ~768px: either horizontal scroll inside a bordered container (with the first column sticky) **or** reflow to a stacked list/card per row. Choose by how many columns matter: ≤ 3 important columns → stack; many comparable columns → scroll.
- Never let a table push the page wider than the viewport. Wrap it: `overflow-x: auto` on the wrapper, not the page.
- Hide low-priority columns progressively (container or media queries) instead of cramming.
- Long values (emails, IDs, URLs): truncate with ellipsis + `title`/tooltip, or `overflow-wrap: anywhere` in a detail view.
- Numbers right-aligned, headers aligned with their data.
- Keep the header row one line; shorten header text rather than wrapping it.

## 9. Page shell patterns

A typical app screen, top to bottom:

```
┌ Page header: title (+ short description) ········· primary action ┐
│ Toolbar: search · filters · view toggles (one row, wraps cleanly) │
│ Content: list / table / grid / form                               │
│ Pagination or load more                                            │
└────────────────────────────────────────────────────────────────────┘
```

- Header: title and primary action on one line at ≥ md; at small widths the action moves under the title or into a sticky bottom bar/FAB - decide explicitly in the plan.
- Toolbar: search grows (`flex-1 min-w-0`), filters collapse into a "Filters" button/sheet at small widths.
- Detail screens: master–detail (list + side panel) on wide screens, separate views or a sheet on small ones.
- Forms: single column, labels above fields, related fields side by side only when wide enough (container query), actions at the end.
