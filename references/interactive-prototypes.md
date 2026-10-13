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
  const startTimer = () => { timer = setTimeout(() => toast.remove(), 8000); };
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

### D. Interactive Form & Input Validations (`FRM-01`..`FRM-24`, `A11Y-18`)
Prototypes must not feature dead or fake forms. Users must be able to test live form validations directly in the browser:
- **Required fields & format validation**: Empty inputs trigger red borders (`border-destructive`), `aria-invalid="true"`, and inline error messages linked via `aria-describedby`.
- **Live clearing on input**: Errors clear automatically when the user types to correct the field (`input` event).
- **Character counters**: Textareas or inputs with `maxlength` display live character counters (`x/y chars`), warning users when approaching the limit.

```javascript
function setupFormValidation(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const validateField = (input) => {
    const errorEl = document.getElementById(`${input.id}-error`);
    let errorMessage = '';

    if (input.hasAttribute('required') && !input.value.trim()) {
      errorMessage = `${input.dataset.label || 'This field'} is required.`;
    } else if (input.type === 'email' && input.value && !/^\S+@\S+\.\S+$/.test(input.value)) {
      errorMessage = 'Enter a valid email address.';
    } else if (input.minLength && input.value.length < input.minLength) {
      errorMessage = `Must be at least ${input.minLength} characters.`;
    }

    if (errorMessage) {
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = errorMessage;
        errorEl.classList.remove('hidden');
        input.setAttribute('aria-describedby', errorEl.id);
      }
      return false;
    } else {
      input.removeAttribute('aria-invalid');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
      }
      return true;
    }
  };

  form.querySelectorAll('input, select, textarea').forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validateField(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasError = false;
    form.querySelectorAll('input, select, textarea').forEach((input) => {
      if (!validateField(input)) hasError = true;
    });

    if (hasError) {
      showErrorAlert('Please fix the errors highlighted below before submitting.', 'Validation Failed');
    } else {
      showToast('Form submitted successfully!', 'success');
      form.reset();
    }
  });
}
```

### E. Error Alerts & Simulation Test Bar (`ERR-01`..`ERR-10`, `NOT-01`..`NOT-05`)
Every concept must include a lightweight **Test Panel / Simulation Bar** so the user can test how the redesign handles errors and failures without needing backend APIs:
- **Validation Failure Toggle**: Instantly highlights all invalid form inputs with inline error messages.
- **Server Error Alert Banner**: Displays a persistent inline alert banner (`role="alert"`) with title, description, and recovery action ("Retry").
- **Destructive Toast Alert**: Fires an 8-second hover-paused error toast.

```javascript
function showErrorAlert(message, title = 'Error') {
  let alertContainer = document.getElementById('alert-banner-container');
  if (!alertContainer) return;

  alertContainer.innerHTML = `
    <div class="alert alert-destructive" role="alert">
      <div class="alert-icon">⚠️</div>
      <div class="alert-content">
        <h4 class="alert-title">${title}</h4>
        <p class="alert-description">${message}</p>
      </div>
      <button type="button" class="alert-close" onclick="this.closest('.alert').remove()">&times;</button>
    </div>
  `;
}

// Concept Test Bar: lets users toggle states in the prototype
function setupPrototypeTestBar() {
  const bar = document.createElement('div');
  bar.className = 'prototype-test-bar';
  bar.innerHTML = `
    <span><strong>Prototype Testing:</strong></span>
    <button type="button" onclick="testValidationErrors()">Trigger Form Errors</button>
    <button type="button" onclick="showErrorAlert('Network connection lost (Status 503). Retrying...', 'Connection Error')">Trigger Alert Banner</button>
    <button type="button" onclick="showToast('422 Unprocessable: Request payload rejected by validation rules.', 'destructive')">Trigger Error Toast</button>
  `;
  document.body.prepend(bar);
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

    // Set SINGLE_FILE = true when concepts are single files (concept-a.html …); false for modular folders
    const SINGLE_FILE = false;

    function setConcept(name) {
      conceptBtns.forEach(b => b.classList.toggle('active', b.dataset.concept === name));
      // Modular folders use <name>/index.html; single-file mode uses <name>.html
      iframe.src = SINGLE_FILE ? `${name}.html` : `${name}/index.html`;
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
