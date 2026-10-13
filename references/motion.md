# Motion and micro-interactions

> **Defaults only.** Everything here is a fallback for what the project's own DESIGN.md and existing code don't decide. If DESIGN.md sets motion tokens, easing curves, duration scales or component micro-interactions, follow DESIGN.md and use its names. See `design-md.md`.

Sources: Nielsen Norman Group (micro-interactions, 0.1s response limit), W3C WCAG 2.2 (SC 2.3.3 Animation from Interactions), Vercel Web Interface Guidelines, Leonxlnx/taste-skill (taste-skill v2 experimental, gpt-tasteskill).

Rules map to `MOT-*` in `rule-catalog.md`. See also canonical GSAP skeletons in `taste-engineering.md` §5.

## Contents
1. Principles of micro-interactions
2. Micro-interaction catalog & patterns
3. Performance: composited properties only
4. Duration and easing budget
5. Motivated motion & scroll architecture
6. Accessibility & `prefers-reduced-motion`
7. Anti-slop motion rules & checklist

---

## 1. Principles of micro-interactions

A micro-interaction is a single, contained trigger-feedback pair that communicates system status, confirms an action, or clarifies spatial relationships.

- **Purpose over decoration**: Micro-interactions are functional tools to prevent errors, acknowledge user intent, and indicate state changes. Never animate without an explicit interaction trigger (click, press, hover, focus, state change).
- **The 0.1-second (100ms) rule**: According to NN/g response time limits, feedback within 100ms is perceived as instantaneous. Button press depressions and active states must respond immediately to prevent users from wondering if their tap/click registered ("ghost interactions").
- **Physical plausibility**: Real objects don't jump instantaneously across states. Interfaces use subtle, purposeful easing (acceleration and deceleration) rather than robotic linear steps.
- **De-escalation on exit**: Entering elements draw focus (ease-out, 150–200ms); exiting elements clear away quickly without lingering (ease-in, 100–150ms).

---

## 2. Micro-interaction catalog & patterns

Implement these patterns using the project's Tailwind tokens and primitives:

### A. Button active / press micro-feedback (MOT-06)
A button that doesn't react on press feels dead and causes duplicate clicks:
```tsx
// Subtle scale depression + active tone on press
<Button
  className="transition-all duration-100 ease-out active:scale-[0.98] active:brightness-95 motion-reduce:active:scale-100"
>
  Save changes
</Button>
```
*Note*: Never depress buttons by more than 2% (`scale-[0.98]`). Oversized squash/stretch is AI slop.

### B. Input focus micro-interaction (remedies dead inputs per MOT-06)
Inputs should smoothly emphasize the active field without jarring outline snaps:
```tsx
<input
  className="border border-input bg-background px-3 py-2 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
/>
```

### C. State toggles & switches (MOT-07)
A switch thumb sliding between states must glide cleanly rather than jumping:
```tsx
<SwitchPrimitives.Thumb
  className="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-sm ring-0 transition-transform duration-150 ease-out data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 motion-reduce:transition-none"
/>
```

### D. Expand / collapse disclosure (MOT-07, MOT-08)
Animating `height: auto` directly thrashes layout. Use CSS grid rows for zero-jank hardware-accelerated expansion:
```tsx
<div
  className={cn(
    "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
  )}
>
  <div className="overflow-hidden">
    <div className="pt-2 text-sm text-muted-foreground">
      {/* Content */}
    </div>
  </div>
</div>
```

### E. Menus, dropdowns & popovers (MOT-05, MOT-07)
Dropdowns must scale subtly from their trigger attachment point, not from screen center:
```tsx
<DropdownMenuContent
  className="origin-(--radix-dropdown-menu-content-transform-origin) transition-all duration-150 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 motion-reduce:animate-none"
/>
```

### F. Success & confirmation feedback (remedies lack of micro-interaction per MOT-06)
When a quick action finishes (copying a link, bookmarking), provide a brief confirmation:
```tsx
// Micro checkmark transition
<button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
  {copied ? (
    <Check className="h-3.5 w-3.5 text-success transition-transform duration-150 ease-out scale-110 motion-reduce:scale-100" />
  ) : (
    <Copy className="h-3.5 w-3.5 transition-transform duration-100 active:scale-90" />
  )}
  <span>{copied ? "Copied" : "Copy link"}</span>
</button>
```

### G. Skeleton-to-content transition (MOT-10, LDG-03)
Avoid abrupt layout pop when server data lands; use a quick crossfade:
```tsx
<div className="transition-opacity duration-150 ease-out motion-reduce:transition-none">
  {isLoading ? <InvoiceTableSkeleton /> : <InvoiceTable data={data} />}
</div>
```

---

## 3. Performance: composited properties only (MOT-02, MOT-08)

Browser rendering engines optimize properties that run directly on the GPU compositor thread without triggering layout reflow or repaint cycles.

| Good (Composited) | Banned (Layout Thrashing) |
|---|---|
| `transform` (`translate`, `scale`, `rotate`) | `width`, `height`, `min-width`, `max-height` |
| `opacity` | `top`, `left`, `right`, `bottom`, `margin`, `padding` |
| `filter` (sparingly) | `border-width`, `font-size` |
| CSS grid `grid-template-rows: 0fr -> 1fr` | animating `max-height: 1000px` (laggy timing) |

**The `transition: all` anti-pattern (MOT-02)**: Never use `transition-all` on containers with dynamic layout dimensions. Specify the exact property: `transition-transform`, `transition-opacity`, or `transition-[color,background-color,border-color]`.

---

## 4. Duration and easing budget (MOT-04, MOT-09)

Micro-interactions must never make the user wait. Every millisecond above the threshold feels sluggish.

| Interaction Type | Target Duration | Easing Curve |
|---|---|---|
| Button press / tap feedback | **75ms – 100ms** | `ease-out` (instant response) |
| Hover state changes | **100ms – 150ms** | `ease-out` |
| Toggle / switch transitions | **150ms – 200ms** | `cubic-bezier(0.16, 1, 0.3, 1)` or `ease-out` |
| Menus, dropdowns, tooltips | **120ms – 150ms** | `ease-out` enter / `ease-in` exit |
| Dialog / modal entrance | **150ms – 200ms** | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Large drawer / sheet reveal | **200ms – 250ms** | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Exit / dismiss transitions | **100ms – 150ms** | `ease-in` (exit faster than enter) |

**Banned**: Any micro-interaction exceeding 250ms (MOT-09). Any bounce, spring overshoot, or elastic oscillation for business interfaces (MOT-04).

---

## 5. Motivated motion & scroll architecture

### A. The Motivated Motion mandate (MOT-11)
Before adding any animation or transition, articulate its exact functional role in one sentence:
- **Hierarchy**: drawing focal attention to the primary element in sequence.
- **Storytelling**: revealing narrative content progressively as the user advances.
- **Feedback**: confirming user input within the 100ms threshold.
- **State transition**: maintaining spatial orientation when modes or views change.
*Invalid reason*: "It looks cool" or "adding GSAP because it's available." Animations without a clear communicative role are visual clutter.

### B. Ban on raw scroll listeners & state updates (MOT-12)
`window.addEventListener('scroll', ...)` runs on every scroll frame without batching, triggering main-thread layout thrashing and stutter.
- **Banned**: Binding `window.addEventListener('scroll')` in React effects.
- **Banned**: Storing `window.scrollY` in React state (`useState`) to drive layout styles (causes root-to-leaf re-renders on every scroll tick).
- **Required**: Use Motion's `useScroll()` with `useTransform()`, GSAP `ScrollTrigger` with `scrub`, or native CSS scroll-driven animations (`animation-timeline: view()`).

### C. Marquee restraint (MOT-13)
Horizontal continuous scrolling marquees (partner logos, keyword bands) are permitted **at most once per page**. Multiple marquees on a single page create visual fatigue and mask layout deficiencies.

### D. ScrollTrigger pinning integrity (MOT-14)
When implementing pinned card stacks or horizontal scrubs, follow the canonical skeletons in `taste-engineering.md` §5:
- Trigger starts exactly at `top top`, not arbitrary percentages.
- Pin the outer wrapper; transform the inner child (never scale or transform the pinned element itself).
- End trigger dynamically recomputes via functions (`end: () => "+=" + distance`) paired with `invalidateOnRefresh: true`.
- Under `prefers-reduced-motion`, collapse pinning into accessible static or native-scroll layouts (`overflow-x-auto snap-x`).

---

## 6. Accessibility & `prefers-reduced-motion` (MOT-01)

Vestibular disorders and motion sensitivities affect millions of users. Movement, parallax, and sudden scaling can trigger nausea or dizziness.

Under **WCAG 2.2 Success Criterion 2.3.3 (Animation from Interactions)**:
1. Every motion and transition must respect the user's OS preference for reduced motion.
2. In Tailwind CSS, guard animated classes with `motion-reduce:`:
   ```html
   <div className="transition-transform duration-150 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100">
   ```
3. Or in CSS modules / global styles:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
4. Essential state changes (like opening a dialog or changing a tab) still occur immediately; only the intermediate motion is removed.

---

## 7. Anti-slop motion rules & checklist

### Banned motion tells
- ✘ Section fade-in-and-slide-up triggered on scroll (portfolio slop).
- ✘ Hover lift (`-translate-y-1` + shadow) on non-interactive stat cards or containers.
- ✘ Wobbly spinners or spinning wrappers that aren't centered.
- ✘ Elastic bouncy buttons that jiggle after clicking.
- ✘ Continuous looping animations (pulsing badges, glowing borders) that distract from content.
- ✘ Bounce/fade animations applied to every hover and scroll entry with no functional intent (MOT-03).
- ✘ Unmotivated motion added for spectacle without functional intent (MOT-11).
- ✘ Raw `window.addEventListener('scroll')` or `scrollY` driving React state (MOT-12).
- ✘ More than one continuous horizontal marquee on the same page (MOT-13).
- ✘ ScrollTrigger pinning the element being transformed or omitting `invalidateOnRefresh` (MOT-14).

### Motion audit checklist
- [ ] Every interactive control (button, tab, menu item) provides instant active/press feedback within 100ms.
- [ ] All animations use composited properties (`transform`, `opacity`) or CSS grid rows; zero layout thrashing on `height`/`width`/`margin`.
- [ ] Durations are budgeted ≤ 250ms; exits are faster than entrances.
- [ ] No `transition: all` on containers with layout dimensions.
- [ ] Popovers and dropdowns animate from their trigger attachment point (`transform-origin`).
- [ ] All animated transitions include `motion-reduce:transition-none` or equivalent reduced-motion fallback.
- [ ] No uniform bounce/fade on every hover and scroll with no functional intent (MOT-03).
- [ ] Every animation can be articulated with a clear communicative purpose (MOT-11).
- [ ] Zero raw scroll event listeners or React state scroll bindings (MOT-12).
- [ ] Max one horizontal marquee per page (MOT-13).
- [ ] Pinned scroll-stack or horizontal pan follows canonical skeletons with `invalidateOnRefresh` (MOT-14).
