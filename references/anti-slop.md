# Anti-slop - visual

> **Defaults only.** Everything here is a fallback for what the project's own DESIGN.md and existing code don't decide. If DESIGN.md sets a value or rule for the same thing (breakpoints, spacing, sizes, component choices, banned or required styles, voice), follow DESIGN.md and use its names. See `design-md.md`.

"Slop" is what you get when every choice is the statistically average default: it looks generated, not designed. The fix isn't more decoration; it's fewer, deliberate choices grounded in the product and its DESIGN.md.

**These are banned defaults, not banned forever.** If DESIGN.md or the existing app deliberately uses one of them, keep it. What's banned is reaching for it because it's what AI-built UIs usually do.

## Layout tells
- Everything wrapped in identical rounded cards with the same soft shadow; cards nested in cards.
- Three (or four) icon-on-top feature cards in a row.
- Stat banner row: big number, small label, repeated 3–4× - when nobody acts on those numbers.
- Centered everything on an app screen (titles, forms, empty text in wide containers).
- Small pill badge above the page title ("✨ New").
- Colored left border on cards/alerts that isn't a real status.
- Numbered "1 → 2 → 3" steps for things that aren't sequential.
- Every section fully expanded; no progressive disclosure.
- Giant hero/header padding on a work screen.
- Emoji used as icons in nav, headings or buttons.

## Color tells
- Purple→blue / teal→violet gradients as decoration (backgrounds, text, buttons).
- Colored glows and colored box-shadows.
- Accent colors outside the token set.
- Low-contrast grey body text, especially on dark backgrounds (must meet WCAG AA: 4.5:1 body, 3:1 large text and UI parts).
- Status colors (red/green/amber) used for decoration.
- Pure `#000` on pure `#fff` or pure black dark mode when the system defines softer neutrals.

## Typography tells
- ALL-CAPS tracked-out eyebrow labels above every heading.
- One word in a headline recolored, italic-serif or gradient for "emphasis".
- Meta strings joined with middle dots everywhere ("Admin · 3 days ago · 12 items") - use layout or plain separators the project already uses.
- Monospace for normal data labels.
- Too many sizes/weights on one screen (more than ~4 sizes, ~2–3 weights).
- A new font that isn't in DESIGN.md.
- Defaults to a single font (e.g. Inter) with no deliberate type pairing/hierarchy, or one type scale with no modular rhythm (SLOP-06).

## Motion tells
- The same fade-and-slide-up on every section as it scrolls in.
- Hover lift/scale on non-interactive cards.
- Bounce/elastic easing.
- Motion without `prefers-reduced-motion` handling.
- Animating layout dimensions (height/width/margin/top/left) causing layout thrash (MOT-08).
- Sluggish or distracting multi-stage animations exceeding 250ms (MOT-09).
- Dead-feeling controls with zero active/press micro-feedback (MOT-06).

## Iconography tells
- An icon before every label, heading and list item.
- Icons scaled far above their design size (chunky).
- Mixed icon sets.

## People & media slop
- AI/placeholder people used as real content: generated avatars (e.g. `dicebear`/`multiavatar`), anime/3D mascots, stock faces; content `<img>` with missing or placeholder `alt` (SLOP-07).

## What to do instead
- Take the density and personality from DESIGN.md's Overview and the good existing pages.
- Group with space and headings first; cards only for units (see hierarchy-declutter.md §5).
- Left-align work UIs. Center only short, isolated moments (an empty state, a confirm).
- Use color by role: neutral surfaces, one primary for the main action, semantic colors for status only.
- **Spend boldness in one place** per screen - the one thing the task list says matters most. Keep the rest quiet.
- Motion answers a user action (open, expand, confirm, reorder), 150–250ms, standard easing, using composited properties only (see motion.md).
- Interactive controls provide instant active/press micro-feedback (`active:scale-[0.98]`, motion.md §2A, SOUL-01).
- **Inject soul & craft (soulful-design.md)**: Stripping slop stops bad design, but removing everything leaves a sterile void. Replace slop with living craft: concentric nested geometry ($R_{\text{inner}} = R_{\text{outer}} - P$), optical mass compensation, crisp hairline luminance, and calm state crossfades.

## Final visual checklist (Phase 5)

Answer yes/no. Any **yes** → fix before reporting done.

1. Is any value (color, size, spacing, radius, shadow, font) not from the project's tokens?
2. Is any card nested in another card, or are there cards that aren't actionable units?
3. Is there a gradient, glow or colored left border that isn't part of the design system?
4. Are there more than ~4 text sizes or ~3 weights visible at once?
5. Are ALL-CAPS labels, eyebrow badges, emoji icons or middle-dot meta strings present without DESIGN.md asking for them?
6. Is there more than one element competing to be the most prominent?
7. Is any body or label text below AA contrast?
8. Does the screen look like a generic template you could paste any product name into?
9. Does any animation run on scroll or on hover of a non-interactive element?
10. Would this look out of place next to the app's other good pages?
11. Does the screen feel sterile, dead, or plastic? (Check concentric geometry SOUL-02, optical alignment SOUL-03, and tactile press response SOUL-01 in `soulful-design.md`).
