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
   Map both light and dark CSS custom properties in `styles.css` (or `<style>`):
   ```css
   :root {
     --background: #ffffff;
     --foreground: #09090b;
     --card: #f4f4f5;
     --border: #e4e4e7;
   }
   .dark, [data-theme="dark"] {
     --background: #09090b;
     --foreground: #f4f4f5;
     --card: #121215;
     --border: #27272a;
   }
   ```
2. **Zero Arbitrary Palette Drift**: Never inject unvetted purples, neon glows, or random hex values unless defined in the project's `DESIGN.md`.
3. **Realistic Domain Data**: Zero "Lorem Ipsum", "User 1", or "Test Item". Use real entity names, realistic timestamps, real monetary amounts, and actual status states matching the audited codebase.
4. **Accessible Native Controls**: Use native `<button type="button">`, `<dialog>`, `<input>`, `<label>`, and semantic headings (`<h1>`..`<h3>`). Div-based fake buttons are banned.
5. **Real Inline SVGs**: Use crisp inline SVGs (e.g. Lucide icons matching the app) with proper `size-4` / `size-5` dimensions.

---

## 4. Required Interactive Behaviors

Prototypes must be physically testable in the browser without backend dependencies. Every concept must simulate:

1. **Dialogs & Sheets**: Working `<dialog>` elements or drawer panels with backdrop click, close triggers (`[data-close]`), and Escape dismissal.
2. **Form & Input Validations (`FRM-01`..`FRM-24`, `A11Y-18`)**: Real inputs with `required` and format checks. Blur and submit triggers set `aria-invalid="true"`, show inline error messages linked via `aria-describedby`, and clear errors on input (`input` listener).
3. **Mutations & Loading (`MUT-01`..`MUT-13`)**: Mutation buttons show an inline spinner, disable during simulated async work (~600ms), and restore upon completion.
4. **Alerts & Toasts (`NOT-01`..`NOT-05`, `ERR-01`..`ERR-10`)**: Persistent inline error alert banners (`role="alert"`) with title and recovery action; toast notifications that pause timeout on mouse hover/focus.
5. **Simulation Test Bar**: A compact fixed top or bottom strip (`.prototype-test-bar`) with trigger buttons to let the user simulate states instantly (e.g. "Trigger Form Errors", "Show Error Banner", "Fire Error Toast").
6. **Dark Mode & Themes (`THM-01`..`THM-04`)**: All concepts must support light and dark modes (and project theme variants). Toggling themes must flip CSS variables cleanly without broken contrast, unstyled flashes, or illegible text.

### Unified Interaction Pattern

A single minimal script wires up dialogs, toasts, mutation buttons, and validation:

```javascript
// Minimal interaction helper for HTML prototypes
function setupPrototypeInteractions() {
  // Dialogs & drawers
  document.querySelectorAll('[data-dialog-target]').forEach(btn => {
    const dialog = document.getElementById(btn.dataset.dialogTarget);
    btn.onclick = () => dialog?.showModal?.() || dialog?.classList.remove('hidden');
  });
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.onclick = () => btn.closest('dialog')?.close?.() || btn.closest('.modal')?.classList.add('hidden');
  });

  // Simulated mutation buttons
  document.querySelectorAll('[data-mutation]').forEach(btn => {
    btn.onclick = () => {
      const orig = btn.innerHTML;
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.innerHTML = '<span class="spinner"></span> Saving...';
      setTimeout(() => {
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        btn.innerHTML = orig;
        showPrototypeToast('Action completed successfully.', 'success');
      }, 600);
    };
  });

  // Form validation simulation
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.onsubmit = (e) => {
      e.preventDefault();
      const invalid = form.querySelectorAll(':invalid, [aria-invalid="true"]');
      if (invalid.length) {
        showPrototypeAlert('Please resolve highlighted errors before submitting.');
      } else {
        showPrototypeToast('Form submitted successfully.', 'success');
      }
    };
  });
}

function showPrototypeToast(msg, variant = 'default') {
  const container = document.getElementById('toast-container') || document.body;
  const t = document.createElement('div');
  t.className = `toast toast-${variant}`;
  t.setAttribute('role', 'alert');
  t.innerHTML = `<span>${msg}</span><button type="button" data-close>&times;</button>`;
  let timer = setTimeout(() => t.remove(), 8000);
  t.onmouseenter = () => clearTimeout(timer);
  t.onmouseleave = () => { timer = setTimeout(() => t.remove(), 4000); };
  t.querySelector('[data-close]').onclick = () => t.remove();
  container.appendChild(t);
}

function showPrototypeAlert(msg, title = 'Validation Error') {
  const container = document.getElementById('alert-banner-container');
  if (!container) return;
  container.innerHTML = `<div class="alert alert-destructive" role="alert"><strong>${title}:</strong> ${msg}</div>`;
}
```

---

## 5. Switcher Shell Template (`concepts/index.html`)

The switcher shell hosts all three concepts in an iframe, allowing instant keyboard cycling (`1`, `2`, `3`) and responsive viewport emulation (Mobile 375px, Tablet 768px, Desktop 1280px). Shell chrome below uses placeholder dark values: replace them with the project's DESIGN.md tokens before showing the user (same zero-drift rule as §3):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UI Redesign Concepts Viewer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: var(--background, #09090b); color: var(--foreground, #f4f4f5); height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
    header { background: var(--card, #121215); border-bottom: 1px solid var(--border, #27272a); padding: 0.75rem 1.25rem; display: flex; justify-content: space-between; align-items: center; }
    .segmented { display: inline-flex; background: #18181b; border: 1px solid #27272a; border-radius: 0.5rem; padding: 2px; gap: 2px; }
    .segmented button { background: transparent; border: none; color: #a1a1aa; padding: 0.4rem 0.85rem; border-radius: 0.35rem; font-size: 0.85rem; cursor: pointer; }
    .segmented button.active { background: #27272a; color: #fff; font-weight: 600; }
    .viewport { flex: 1; display: flex; justify-content: center; align-items: center; padding: 1rem; background: #050507; }
    iframe { border: 1px solid #27272a; border-radius: 0.5rem; background: #fff; height: 100%; transition: width 0.2s ease; }
    iframe.desktop { width: 100%; max-width: 1440px; }
    iframe.tablet { width: 768px; }
    iframe.mobile { width: 375px; }
  </style>
</head>
<body>
  <header>
    <div><strong>UI Redesign: Concepts</strong> <span style="color:#71717a;font-size:0.8rem;margin-left:0.5rem;">Keys 1, 2, 3 · T (Theme)</span></div>
    <div class="segmented" id="concept-tabs">
      <button class="active" data-c="concept-a">Concept A: Structured</button>
      <button data-c="concept-b">Concept B: Balanced</button>
      <button data-c="concept-c">Concept C: Contextual</button>
    </div>
    <div class="segmented" id="vp-tabs">
      <button data-vp="mobile">Mobile (375px)</button>
      <button data-vp="tablet">Tablet (768px)</button>
      <button class="active" data-vp="desktop">Desktop</button>
    </div>
    <div class="segmented" id="theme-tabs">
      <button class="active" data-th="dark">Dark</button>
      <button data-th="light">Light</button>
    </div>
  </header>
  <div class="viewport"><iframe id="preview" class="desktop" src="concept-a/index.html"></iframe></div>
  <script>
    const iframe = document.getElementById('preview');
    const SINGLE_FILE = false; // set true if using concept-a.html single-file mode
    function setConcept(name) {
      document.querySelectorAll('#concept-tabs button').forEach(b => b.classList.toggle('active', b.dataset.c === name));
      iframe.src = SINGLE_FILE ? `${name}.html` : `${name}/index.html`;
    }
    function setVp(vp) {
      document.querySelectorAll('#vp-tabs button').forEach(b => b.classList.toggle('active', b.dataset.vp === vp));
      iframe.className = vp;
    }
    function setTheme(th) {
      document.querySelectorAll('#theme-tabs button').forEach(b => b.classList.toggle('active', b.dataset.th === th));
      document.documentElement.className = th;
      try { iframe.contentDocument.documentElement.className = th; } catch (e) {}
    }
    document.querySelectorAll('#concept-tabs button').forEach(b => b.onclick = () => setConcept(b.dataset.c));
    document.querySelectorAll('#vp-tabs button').forEach(b => b.onclick = () => setVp(b.dataset.vp));
    document.querySelectorAll('#theme-tabs button').forEach(b => b.onclick = () => setTheme(b.dataset.th));
    window.onkeydown = (e) => {
      if (['1','2','3'].includes(e.key)) setConcept(`concept-${['a','b','c'][e.key - 1]}`);
      if (e.key === 't' || e.key === 'T') {
        const cur = document.querySelector('#theme-tabs button.active')?.dataset.th;
        setTheme(cur === 'dark' ? 'light' : 'dark');
      }
    };
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
