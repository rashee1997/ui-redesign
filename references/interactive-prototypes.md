# Interactive Layout Concepts & HTML Prototypes

Before writing production code or locking in the redesign plan at Gate G3, the agent builds **three distinct, interactive HTML layout concepts** inside `.ui-audit/<surface-slug>/concepts/`. The user opens `concepts/index.html` in their browser to test responsive behavior, trigger dialogs, fire alerts, and select their preferred direction.

---

## 1. Directory Structure & Sizing Heuristic

To prevent agent token limits, output truncation, and messy code, choose the file architecture based on the surface complexity:

```
.ui-audit/<surface-slug>/concepts/
├── index.html                        # Switcher shell & responsive viewport emulator
│
│   ── Compact Surface (< 400 lines total markup/styles) ──
├── concept-a.html                    # Self-contained Concept A (HTML + CSS + JS)
├── concept-b.html                    # Self-contained Concept B
├── concept-c.html                    # Self-contained Concept C
│
│   ── Complex / Large Surface (>= 400 lines or multi-dialog/complex data) ──
├── concept-a/
│   ├── index.html                    # Semantic HTML markup and domain data
│   ├── styles.css                    # DESIGN.md tokens and component styling
│   └── app.js                        # Working dialogs, alerts, and interactions
├── concept-b/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── concept-c/
    ├── index.html
    ├── styles.css
    └── app.js
```

### Heuristic
- **Single-File Mode (`concept-{x}.html`)**: Used when the audited surface has ≤ 2 dialogs, simple lists, or compact forms. The entire concept lives in one clean file with embedded `<style>` and `<script>`.
- **Modular Multi-File Mode (`concept-{x}/`)**: Mandatory when the surface includes complex data grids, multiple modal workflows, side drawers, rich filter bars, or exceeds 400 lines. Splitting ensures crisp, non-truncated code generation.

---

## 2. The Three Distinct Mental Models

Never generate superficial re-skins (e.g. three identical card grids with different colors). The three concepts must explore fundamentally different layout architectures, anchored in the Three Dials framework (`references/taste-engineering.md`):

| Concept | Architectural Mental Model | Three Dials Calibration | Typical Layout Patterns |
|---|---|---|---|
| **Concept A** | **Structured & High-Density**<br>Precision data cockpit | `VARIANCE` 2-3<br>`MOTION` 2-3<br>`DENSITY` 8-9 | Strict 12-column grid, compact table rows with tabular numerals, sticky opaque headers, inline table actions, minimal whitespace, keyboard shortcuts visible. |
| **Concept B** | **Modern SaaS & Progressive**<br>Balanced, guided workflow | `VARIANCE` 5-6<br>`MOTION` 4-5<br>`DENSITY` 4-5 | Clear visual hierarchy, grouped card surfaces, sticky bottom action bar, slide-out drawer sheets for secondary details, standard modal dialogs, airy padding. |
| **Concept C** | **Contextual & Fluid**<br>Master-detail / Canvas | `VARIANCE` 7-8<br>`MOTION` 3-4<br>`DENSITY` 5-6 | Split-pane / two-column layout, sticky contextual inspector sidebar, command palette trigger, progressive disclosure accordions, quick preview flyouts. |

---

## 3. Production Token Fidelity & Anti-Slop Rules

Every concept must look like the real application, not a generic template:

1. **Extract Project Tokens (`DESIGN.md`)**:
   Map the project's exact CSS custom properties in `styles.css` (or `<style>`):
   ```css
   :root {
     --background: #09090b;
     --foreground: #f4f4f5;
     --card: #121215;
     --card-foreground: #f4f4f5;
     --primary: #2563eb;
     --primary-foreground: #ffffff;
     --muted: #27272a;
     --muted-foreground: #a1a1aa;
     --border: #27272a;
     --radius: 0.5rem;
   }
   ```
2. **Zero Arbitrary Palette Drift**: Never inject unvetted purples, neon glows, or random hex values unless defined in the project's `DESIGN.md`.
3. **Realistic Domain Data**: Zero "Lorem Ipsum", "User 1", or "Test Item". Use real entity names, realistic timestamps, real monetary amounts, and actual status states matching the audited codebase.
4. **Accessible Native Controls**: Use native `<button type="button">`, `<dialog>`, `<input>`, `<label>`, and semantic headings (`<h1>`..`<h3>`). Div-based fake buttons are banned.
5. **Real Inline SVGs**: Use crisp inline SVGs (e.g. Lucide icons matching the app) with proper `size-4` / `size-5` dimensions.

---

## 4. Interactive JavaScript Recipes

All prototypes must be interactive so the user can physically verify behaviors before approving:

### A. Accessible Dialogs & Modals
```javascript
// Native dialog or custom modal with backdrop and Esc listener
function setupDialog(triggerId, dialogId) {
  const trigger = document.getElementById(triggerId);
  const dialog = document.getElementById(dialogId);
  if (!trigger || !dialog) return;

  trigger.addEventListener('click', () => {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.classList.remove('hidden');
    }
  });

  dialog.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.classList.add('hidden');
    });
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.classList.add('hidden');
    }
  });
}
```

### B. Toast Alerts with Hover-Pause (`NOT-01`..`NOT-05`)
```javascript
function showToast(message, variant = 'default') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${variant}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span>${message}</span><button type="button" data-close>&times;</button>`;

  let timer = null;
  const startTimer = () => { timer = setTimeout(() => toast.remove(), 4000); };
  const clearTimer = () => { if (timer) clearTimeout(timer); };

  toast.addEventListener('mouseenter', clearTimer);
  toast.addEventListener('mouseleave', startTimer);
  toast.querySelector('[data-close]').addEventListener('click', () => toast.remove());

  container.appendChild(toast);
  startTimer();
}
```

### C. Simulated Mutation Loading States
```javascript
function setupMutationButton(buttonId, successMessage) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  btn.addEventListener('click', () => {
    const originalText = btn.innerHTML;
    btn.setAttribute('aria-busy', 'true');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Saving...`;

    setTimeout(() => {
      btn.removeAttribute('aria-busy');
      btn.disabled = false;
      btn.innerHTML = originalText;
      showToast(successMessage, 'success');
    }, 700);
  });
}
```

---

## 5. Switcher Shell Template (`concepts/index.html`)

The switcher shell hosts all three concepts in an iframe, allowing instant keyboard cycling (`1`, `2`, `3`) and responsive viewport emulation (Mobile 375px, Tablet 768px, Desktop 1280px):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UI Redesign Concepts Viewer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
    header { background: #121215; border-bottom: 1px solid #27272a; padding: 0.75rem 1.25rem; display: flex; justify-content: space-between; align-items: center; }
    .segmented { display: inline-flex; background: #18181b; border: 1px solid #27272a; border-radius: 0.5rem; padding: 2px; gap: 2px; }
    .segmented button { background: transparent; border: none; color: #a1a1aa; padding: 0.4rem 0.85rem; border-radius: 0.35rem; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
    .segmented button.active { background: #27272a; color: #ffffff; font-weight: 600; }
    .viewport-container { flex: 1; display: flex; justify-content: center; align-items: center; padding: 1rem; background: #050507; }
    iframe { border: 1px solid #27272a; border-radius: 0.5rem; background: #ffffff; height: 100%; transition: width 0.25s ease; }
    iframe.desktop { width: 100%; max-width: 1440px; }
    iframe.tablet { width: 768px; }
    iframe.mobile { width: 375px; }
  </style>
</head>
<body>
  <header>
    <div>
      <strong>UI Redesign: Layout Concepts</strong>
      <span style="color:#71717a; font-size:0.8rem; margin-left:0.5rem;">Keys 1, 2, 3 to toggle</span>
    </div>
    <div class="segmented" id="concept-tabs">
      <button class="active" data-concept="concept-a">Concept A: Structured</button>
      <button data-concept="concept-b">Concept B: Balanced</button>
      <button data-concept="concept-c">Concept C: Contextual</button>
    </div>
    <div class="segmented" id="viewport-tabs">
      <button data-viewport="mobile">Mobile (375px)</button>
      <button data-viewport="tablet">Tablet (768px)</button>
      <button class="active" data-viewport="desktop">Desktop</button>
    </div>
  </header>
  <div class="viewport-container">
    <iframe id="preview" class="desktop" src="concept-a/index.html"></iframe>
  </div>
  <script>
    const iframe = document.getElementById('preview');
    const conceptBtns = document.querySelectorAll('#concept-tabs button');
    const viewportBtns = document.querySelectorAll('#viewport-tabs button');

    function setConcept(name) {
      conceptBtns.forEach(b => b.classList.toggle('active', b.dataset.concept === name));
      // Supports both modular folders and single files
      iframe.src = name.includes('/') ? name : (window.location.pathname.includes('/') ? `${name}/index.html` : `${name}.html`);
    }

    function setViewport(vp) {
      viewportBtns.forEach(b => b.classList.toggle('active', b.dataset.viewport === vp));
      iframe.className = vp;
    }

    conceptBtns.forEach(b => b.addEventListener('click', () => setConcept(b.dataset.concept)));
    viewportBtns.forEach(b => b.addEventListener('click', () => setViewport(b.dataset.viewport)));

    window.addEventListener('keydown', (e) => {
      if (e.key === '1') setConcept('concept-a');
      if (e.key === '2') setConcept('concept-b');
      if (e.key === '3') setConcept('concept-c');
    });
  </script>
</body>
</html>
```

---

## 6. Gate Criteria & Workflow Integration

1. **Phase 2 (Plan)**: In addition to drafting `PLAN.md`, the agent builds the three concepts in `.ui-audit/<surface-slug>/concepts/`.
2. **Gate G2 Requirement**: `PLAN.md` exists, findings mapped, and all 3 interactive concepts exist, verified free of console syntax errors, and linkable from `PLAN.md`.
3. **Phase 3 (Approval)**: The agent outputs the local link to `.ui-audit/<surface-slug>/concepts/index.html`. The user opens the file, tests interactions, and selects their choice.
4. **Gate G3 Requirement**: User's approved choice (e.g. "Approved Concept B" or "Concept A with Concept B dialog") is quoted in `PLAN.md` before Phase 4 begins.
