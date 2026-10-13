# Taste engineering - dials, archetypes, & anti-slop architecture

> **Defaults only.** Everything here is a fallback for what the project's own DESIGN.md and existing code don't decide. If DESIGN.md sets tokens, components, density, typography, or motion guidelines, follow DESIGN.md and use its names. See `design-md.md`. Rules map to `LAY-*`, `HIE-*`, `CON-*`, `CPY-*`, `SLOP-*`, `MOT-*`, and `SOUL-*` in `rule-catalog.md`.

Sources: Leonxlnx/taste-skill (taste-skill v2 experimental, redesign-skill, soft-skill, minimalist-skill, brutalist-skill, gpt-tasteskill, output-skill); Vercel Web Interface Guidelines; Emil Kowalski (Animations on the Web); Rauno Freiberg (Invisible Details).

---

## Contents
1. Brief inference & the Design Read
2. The Three Dials framework
3. Design system map & aesthetic archetypes
4. Redesign modernisation levers & preservation protocol
5. Canonical motion architectures (GSAP Sticky-Stack & Horizontal-Pan)
6. Full output enforcement

---

## 1. Brief inference & the Design Read

Read the brief, audience context, and existing repository tokens before selecting layout, typography, or styling.

### A. Read these signals first
1. **Page kind**: landing (SaaS, consumer, agency, event), portfolio (developer, designer), admin/internal tool, product dashboard, editorial/documentation.
2. **Context & audience**: B2B enterprise procurement vs design-conscious consumer vs engineer scanning documentation. The audience dictates the density and aesthetic, not developer habit.
3. **Existing brand assets**: logo mark, color tokens, typography, photography. For redesigns, these are mandatory starting constraints, not optional inputs.
4. **Quiet constraints**: WCAG accessibility targets, regulatory compliance, public sector trust requirements. These strictly override aesthetic preference.

### B. Mandatory one-line "Design Read"
Before generating code or planning a redesign, declare in one line:
> **"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system or aesthetic family>."**

*Examples:*
- *"Reading this as: enterprise compliance dashboard for QHSE officers, with a calm, high-density utilitarian language, leaning toward Tailwind tokens + Radix primitives + tabular monospace."*
- *"Reading this as: B2B SaaS landing page for engineering leads, with a Linear-style minimalist language, leaning toward Geist + restrained spring motion + border hairlines."*

---

## 2. The Three Dials framework

Every layout, motion, and density decision is calibrated by three 1–10 dials:

| Dial | Scale Range | Definition & Impact |
|---|---|---|
| `DESIGN_VARIANCE` | `1` (Symmetric Grid) → `10` (Artsy Chaos) | **1–3**: Strict 12-col grid, equal paddings, predictable symmetry.<br>**4–7**: Asymmetric white-space, offset margins, varied image aspect ratios.<br>**8–10**: Masonry, fractional CSS grids (`2fr 1fr 1fr`), viewport-bleeding elements. |
| `MOTION_INTENSITY` | `1` (Static Restrained) → `10` (Cinematic Physics) | **1–3**: Zero auto-motion, CSS hover/active micro-feedback only.<br>**4–7**: Fluid transitions (150–200ms cubic-bezier), entrance reveals, spring physics.<br>**8–10**: ScrollTrigger scrubbing, sticky pinning, horizontal pans. |
| `VISUAL_DENSITY` | `1` (Gallery Airy) → `10` (Cockpit Dense) | **1–3**: Expansive white space (`py-32+`), sparse elements, high breathing room.<br>**4–7**: Balanced daily application spacing (`py-12` to `py-20`).<br>**8–10**: Dense operational cockpit, tight gaps, hairlines replacing card boxes, tabular numerals. |

### Dial presets by use case

| Use Case | VARIANCE | MOTION | DENSITY | Notes |
|---|---|---|---|---|
| Enterprise / Dashboard / Admin | 3–4 | 2–3 | 8–9 | Hairlines over cards, monospace metrics, zero decorative motion |
| B2B SaaS Landing | 6–7 | 5–6 | 4–5 | Structured bento grids, subtle scroll stagger, one accent |
| Premium Consumer / Lifestyle | 7–8 | 5–6 | 3–4 | Expansive whitespace, warm or cold luxury tones, high tactile finish |
| Creative Agency / Portfolio | 8–9 | 7–8 | 2–3 | Asymmetric layouts, kinetic typography, sticky pinning |
| Editorial / Documentation | 4–5 | 2–3 | 5–6 | Clear typographic hierarchy, wide reading column (65ch), no card spam |
| Redesign (Preserve) | match | match + 1 | match | Modernise typography and micro-interactions without breaking brand |
| Redesign (Overhaul) | +2 | +2 | match | Fresh spatial composition; preserve content and routing |

---

## 3. Design system map & aesthetic archetypes

Do not hand-roll ad-hoc CSS for systems with official implementations, and do not pretend an aesthetic style is an official design system.

### A. Official design systems (reach for official packages when specified)
- **Radix Themes / shadcn/ui**: Accessible unstyled primitives + customizable token layer (our repo default).
- **IBM Carbon (`@carbon/react`)**: High-density enterprise dashboards, analytics, data tables.
- **Microsoft Fluent (`@fluentui/react-components`)**: Office/enterprise workflows, standard command surfaces.
- **Google Material 3 (`@material/web`)**: M3 tokenized interfaces, dynamic tonal palettes.
- **GitHub Primer (`@primer/react`)**: Developer tool interfaces and documentation.

### B. Aesthetic archetypes (built with clean CSS/Tailwind)
- **Ethereal Glass (Dark Tech / SaaS)**: Deep OLED off-black (`#09090b`), subtle radial glow orbs, cards with `backdrop-blur-xl` and 1px white/10 borders, geometric grotesk fonts. Always provide solid fallback under `prefers-reduced-transparency`.
- **Editorial Luxury**: High-contrast display typography, restrained monochromatic base, generous whitespace, subtle noise/grain overlay (`opacity-[0.03]` on fixed container). Never use the cliché AI beige+brass+espresso default (`SLOP-10`).
- **Soft Structuralism**: Silver-grey or pure neutral canvas, bold grotesque display type, airy floating components, diffused ambient shadows (no muddy black drops).
- **Swiss Industrial Print**: High-contrast matte canvas (`#F4F4F0`), carbon ink (`#111111`), single alert accent (hazard red `#E61919`), visible 1px dividing lines, 90-degree corners (zero border-radius), bimodal density.
- **Tactile Bento Grid**: Asymmetric CSS grid cells, gapless packing with `grid-auto-flow: dense`, at least 2–3 cells with visual variation (image, gradient, tint) instead of identical white text boxes (`LAY-17`).

---

## 4. Redesign modernisation levers & preservation protocol

When upgrading or redesigning existing code, follow the **Scan → Diagnose → Fix** sequence. Do not rewrite from scratch when targeted evolution works.

### A. Modernisation levers in priority order
Apply levers sequentially; stop when the brief is satisfied:
1. **Typography refresh (Lever 1)**: Biggest visual lift with lowest risk. Tighten display tracking, establish modular scale, balance headings (`text-wrap: balance`), tabularize data numerals (`tabular-nums`).
2. **Spacing & rhythm calibration (Lever 2)**: Double cramped section padding (`py-24+` on marketing, `py-8` on app views), unify vertical cadence, eliminate stacked margins.
3. **Color recalibration (Lever 3)**: Desaturate accents (<80%), unify grays into one consistent family (cool or warm), enforce single locked accent (`CON-10`) and page theme lock (`CON-09`).
4. **Motion layer (Lever 4)**: Inject 100ms active press feedback (`active:scale-[0.98]`), hardware-accelerated state transitions (MOT-07), motivated scroll reveals with `prefers-reduced-motion` guards.
5. **Key-section recomposition (Lever 5)**: Recompose hero to fit viewport (LAY-14), cap H1 at 2–3 lines (LAY-13), eliminate zigzag fatigue (LAY-16), align multi-column card baselines (HIE-14).
6. **Full block replacement (Lever 6)**: Replace only unsalvageable legacy blocks.

### B. What never changes silently in a redesign
Never modify without explicit user approval:
- URL paths, query parameters, and route slugs.
- Primary navigation destination labels.
- Form field names, input types, and submission payload contracts.
- Official brand logos or wordmarks.
- Existing legal, compliance, and consent copy.
- Analytics event attributes and telemetry tracking IDs.

---

## 5. Canonical motion architectures

All complex motion must be isolated in leaf Client Components (`"use client"`) and strictly honor `prefers-reduced-motion` (`MOT-01`). Never use `window.addEventListener('scroll')` or store scroll position in React state (`MOT-12`).

### A. GSAP Sticky-Stack (canonical skeleton)
Pins each card sequentially at viewport top while shrinking previous cards as the next card arrives.

```tsx
"use client";
import { useRef, useEffect, useId, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function StickyStack({ cards }: { cards: ReactNode[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const instanceId = useId().replace(/:/g, "");
  const cardClass = `stack-card-${instanceId}`;
  const innerClass = `stack-card-inner-${instanceId}`;

  useEffect(() => {
    if (shouldReduceMotion || !containerRef.current || cards.length <= 1) return;
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(`.${cardClass}`);
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
        const inner = card.querySelector(`.${innerClass}`);
        if (!inner) return;
        gsap.to(inner, {
          scale: 0.94,
          opacity: 0.6,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, [shouldReduceMotion, cards.length, cardClass, innerClass]);

  return (
    <div ref={containerRef} className="relative">
      {cards.map((card, i) => (
        <div
          key={i}
          style={{ zIndex: i + 1 }}
          className={`${cardClass} relative min-h-[100dvh] flex items-center justify-center`}
        >
          <div className={`${innerClass} w-full will-change-transform`}>
            {card}
          </div>
        </div>
      ))}
    </div>
  );
}
```

*Rules*: Outer card is pinned with `pin: true`; inner wrapper receives the scale tween. Never pin an element that is being scaled. Class names are scoped via `useId` to prevent cross-stack selector collision.

### B. GSAP Horizontal-Pan (canonical skeleton)
Translates vertical scroll into a horizontal panoramic scrub.

```tsx
"use client";
import { useRef, useEffect, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function HorizontalPan({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion || !wrapRef.current || !trackRef.current) return;
    const ctx = gsap.context(() => {
      const getDistance = () =>
        Math.max(0, trackRef.current!.scrollWidth - wrapRef.current!.clientWidth);
      gsap.to(trackRef.current, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrapRef);
    return () => ctx.revert();
  }, [shouldReduceMotion]);

  return (
    <section
      ref={wrapRef}
      role="region"
      aria-label="Horizontal content track"
      tabIndex={shouldReduceMotion ? 0 : undefined}
      className={`relative w-full ${shouldReduceMotion ? "overflow-x-auto scroll-smooth" : "overflow-hidden"}`}
    >
      <div
        ref={trackRef}
        className={`flex h-[100dvh] w-max items-center ${shouldReduceMotion ? "snap-x snap-mandatory" : ""}`}
      >
        {children}
      </div>
    </section>
  );
}
```

---

## 6. Full output enforcement

A partial implementation is a broken implementation. LLMs exhibit statistical "laziness" under long outputs by substituting code with comments or truncated stubs. This is strictly prohibited (`SOUL-14`).

### Hard banned patterns in deliverables
- `// ...` or `/* ... */`
- `// rest of code unchanged`
- `// TODO: implement here`
- `// add remaining fields following pattern`
- Bare `...` replacing omitted JSX or logic

### Execution rules
1. **Count deliverables upfront**: Count functions, sections, and files before authoring. Deliver all of them in full.
2. **Never compress or skip**: Do not output the first and last item while skipping the middle.
3. **Token budget splits**: If hitting token output limits, stop cleanly at a natural boundary (such as the end of a component) and output:
   `[PAUSED: X of Y complete. Send "continue" to resume from: <section>]`.
   Resume immediately without preamble or recapping.
