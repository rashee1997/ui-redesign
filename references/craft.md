# Craft - taste, human psychology & tactile finish

> **Defaults only.** Everything here is a fallback for what the project's own DESIGN.md and existing code don't decide. If DESIGN.md sets tokens, density, elevation, typography, or interaction rules, follow DESIGN.md and use its names. See `design-md.md`. Rules map to `SLOP-*`, `HUM-*`, and `SOUL-*` in `rule-catalog.md`.

Sources: Jakob Nielsen (10 heuristics; recognition over recall; Peak-End via Kahneman), Don Norman (gulfs of execution/evaluation; emotional design), John Sweller (cognitive load), Miller/Cowan (working-memory limits), Gestalt psychologists (proximity, similarity, common region), Mark Weiser (calm technology), Jef Raskin (humane interface, modes), NN/g (heuristic evaluation method; severity = frequency × impact × persistence; skeleton screens); Christopher Alexander, Dieter Rams, Rauno Freiberg (craft).

Machines parse dense matrices effortlessly. Humans do not. When software mirrors database tables, every choice is the statistical default, or assembly is all defaults with no care, you get interfaces that are noisy, robotic, or sterile. The fix is the same in all three cases: fewer deliberate choices, chunked for human memory, finished with physical care.

## Contents
1. Slop tells (what to strip)
2. Human laws (what to respect)
3. Craft finish (what to add)
4. Audit checklists

---

## 1. Slop tells (SLOP-*)

What you get when every choice is the average default. **Banned defaults, not banned forever**: if DESIGN.md deliberately uses one, keep it. What's banned is reaching for it because it's what AI-built UIs usually do.

**Layout**: identical rounded cards with the same shadow; cards in cards; 3-icon-on-top feature cards in a row; stat banner rows nobody acts on; centered app screens; pill badge above the title; colored left border that isn't status; numbered steps for non-sequences; everything expanded; hero padding on work screens; emoji as icons.
**Color**: decorative purple/blue gradients; colored glows; off-token accents; low-contrast grey body text (must meet WCAG AA: 4.5:1 body, 3:1 large/UI parts); status colors as decoration; pure `#000`/`#fff` when softer neutrals exist.
**Typography**: ALL-CAPS eyebrow above every heading; one recolored headline word; middle-dot meta strings; monospace data labels; >4 sizes or >2–3 weights per screen; a new font; single default font with no scale.
**Motion**: same scroll-in fade-up everywhere; hover lift on non-interactive cards; bounce easing; no `prefers-reduced-motion`; animating layout dimensions (MOT-08); >250ms multi-stage animations (MOT-09); dead controls with zero press feedback (MOT-06, SOUL-01).
**Icons**: an icon before every label; oversized chunky icons; mixed sets.
**People/media**: generated avatars or mascots as real content; placeholder `alt` (SLOP-07).

Instead: density and personality from DESIGN.md and the app's best pages; group with space and headings first, cards only for units; left-align work UIs; color by role (neutral surfaces, one primary, semantic colors for status only); **one bold thing per screen**; motion answers an action (150–250ms, composited properties); instant press feedback on every control.

## 2. Human laws (HUM-*)

| Law | Rule | Fix |
|---|---|---|
| Working memory is 3–4 chunks (Miller/Cowan); extraneous load causes error (Sweller) | HUM-01: chunk screens into 3–5 item groups; progressive disclosure for the rest; one recommended default, not equal-weight paralysis | 18-field form → 4 thematic cards; secondary filters behind a drawer |
| Gulf of execution (Norman): users must see how to act | HUM-02: every control broadcasts affordance (border, surface, cursor, hover/focus) | text that is secretly a button gets a real button surface |
| Gulf of evaluation (Norman): users must see it worked | HUM-03: visible feedback within 100ms (press depression, spinner, status shift); mutations confirm in focal gaze | save → instant pending button, then explicit success state |
| Gestalt proximity/similarity/common region | HUM-04: label–input `gap-1.5`, in-group `gap-4`, between sections `gap-8`; coherent entities inside one region | label closer to its field than to the neighbor above |
| Raskin: invisible modes cause catastrophic error | HUM-05: no hidden modes; active modes tint ambient chrome; prefer inline edit or explicit dialogs | bulk-select mode visibly re-skins the header |
| Recognition over recall (Nielsen) | HUM-06: pickers/autocomplete/defaults/summaries, never memorized IDs; wizards keep prior choices visible | department combobox instead of typed code |
| Calm technology (Weiser): attention is exhaustible | HUM-07: routine status stays peripheral (footer "Saved 2m ago"); alerts only for blocking failures | sync tick, not a modal, for autosave |
| Peak-End rule (Kahneman): users remember the peak and the ending | HUM-08: affirming completion summaries with next actions; compassionate errors (cause + fix, zero data loss, 1-click retry) | "Document QMS-0042 published. View it or return to the list." |

Robot UI test: layout mirrors DB columns | competing primary buttons | silent calls / raw JSON errors | memorized IDs | modal alerts for trivia | uniform gaps | silent cutoff on completion. Each fails its HUM row above.

## 3. Craft finish (SOUL-*)

Stripping slop stops bad design; without craft the result is a sterile void. Finish with physical care:

- **One focal anchor** per screen (North Star); quiet the secondary before enlarging the primary (SOUL-05).
- **Concentric radii**: inner radius = outer radius minus padding, $R_i = \max(0, R_o - P)$ (SOUL-02). Recipe:
```tsx
<div className="rounded-2xl border border-border/60 bg-muted/30 p-2">
  <div className="rounded-lg border border-border/40 bg-card p-4">…</div>
</div>
```
- **Press depression**: every control answers within 100ms — `active:scale-[0.98]`, no dead buttons (SOUL-01, SOUL-09). Recipe: `transition-all duration-100 ease-out hover:brightness-105 active:scale-[0.98] active:brightness-95`, always with a visible `focus-visible` ring and `motion-reduce` off-ramps.
- **Optical alignment**: asymmetric icons/badges get micro-offsets (`translate-x-[1px]`), not geometric centering (SOUL-03).
- **State continuity**: skeletons are 1:1 structural twins of the final layout (see loading-states.md); loading→content crossfades calmly, no pops or CLS (SOUL-04).
- **Tonal depth**: elevation through surface tiers + hairlines, never muddy drop-shadow soup (SOUL-06).
- **Dignified voice**: cause + fix errors, no blame, no emoji greetings (SOUL-08).
- **Grace at edges**: 0 rows, 1 row, 10,000 rows, 100-char names — layout adapts (SOUL-10).

## 4. Audit checklists

**Taste (run in Phase 1 and re-run on changed surfaces in Phase 5).** Any yes → finding:
1. Any value not from project tokens? 2. Cards in cards, or non-unit cards? 3. Non-system gradient/glow/colored border? 4. >4 text sizes or >3 weights? 5. Unasked ALL-CAPS/eyebrow/emoji/dot-meta? 6. More than one element fighting for prominence? 7. Text below AA contrast? 8. Paste-any-product-name generic? 9. Scroll/hover animation on non-interactive elements? 10. Out of place beside the app's good pages? 11. Sterile or dead (check SOUL-01/02/03)?

**Human (HUM-01..08):** no screen shows >7 unchunked options/inputs/links (01); every control's affordance is unmistakable (02); every interaction answers within 100ms (03); related items are closer to each other than to neighbors (04); no hidden contradictory modes (05); no memorized codes/IDs/prior-screen data (06); routine telemetry stays peripheral (07); errors carry cause+fix with zero data loss, completions close affirmatively (08).

**Craft (SOUL-01..10):** press feedback everywhere (01); concentric radii (02); optical balance (03); calm crossfades, zero CLS (04); one focal anchor (05); tonal depth, no shadow soup (06); provenance for overlays (07); dignified voice (08); satisfying toggles (09); graceful edges (10).
