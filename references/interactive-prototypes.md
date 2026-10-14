# Interactive concept (one prototype, tweaked in place)

Defaults only: DESIGN.md wins. Before the plan is approved the agent builds **one** interactive HTML concept in `.ui-audit/<surface>/concepts/` - the direction it judges best for this archetype and audience - and the user tweaks it until they approve. The user opens `concepts/index.html`, tests responsive widths, dialogs, toasts and themes, and says what to change.

## Contents
1. Why one concept
2. Choosing the direction
3. Files and shell
4. Fidelity rules (anti-hallucination)
5. Required behaviours
6. The tweak loop
7. G2/G3 and the script check

## 1. Why one concept

Three finished prototypes triple the tokens spent, the code to keep faithful and the review burden, and users end up comparing polish instead of structure. NN/g's research (Fessenden 2024, after Nielsen) finds parallel design pays off when the alternatives are **cheap and rough**, then the best parts are merged and iterated; and that iteration alone gains about 22-38% usability per round but can climb to a local maximum. So this skill splits the two:

- **Divergence stays cheap and textual**: three one-line directions with a phone/desktop ASCII wireframe each in `PLAN.md` §6 (no code).
- **Convergence is built once**: one interactive concept, refined by iteration. Merging an idea from a rejected direction is allowed on request.

## 2. Choosing the direction

1. Read the archetype, audience and domain research in `01-design.md`, then set the Three Dials (`taste-engineering.md`) from them, not from taste.
2. Write the three candidate directions in `PLAN.md` §6 using the table below as the vocabulary; mark one **Chosen direction** and give the one-sentence reason tied to the audience (scan frequency, density tolerance, time pressure).
3. Build only the chosen one.

| Direction | Mental model | Dials | Fits |
|---|---|---|---|
| Structured | Precision data cockpit: 12-col grid, compact rows, `tabular-nums`, sticky opaque headers, inline actions | VARIANCE 2-3, MOTION 2-3, DENSITY 8-9 | compliance, operations, high-frequency scanning |
| Balanced | Guided workflow: clear hierarchy, grouped surfaces, sticky action bar, drawers for detail | VARIANCE 5-6, MOTION 4-5, DENSITY 4-5 | B2B SaaS, mixed expert and occasional users |
| Contextual | Master-detail: split pane, inspector, palette trigger, progressive disclosure | VARIANCE 7-8, MOTION 3-4, DENSITY 5-6 | exploratory or research-heavy work |

A re-skin of the same layout is not a direction. If the user says "show me another direction", build it as a second revision, never alongside.

## 3. Files and shell

```
.ui-audit/<surface>/concepts/
├── index.html     # the concept itself (+ viewport/theme bar)
├── styles.css     # optional, ledger tokens only
└── app.js         # optional, only when index.html would pass ~400 lines
```

Keep exactly one concept; the script fails G2 on `concept-b*`. The viewer bar is the only chrome: viewport (375 / 768 / full) and theme toggle, styled **only** with ledger variables (no literal colours, no fallbacks):

```html
<header class="viewer-bar" data-trace="<inventory file:line of the page header>">
  <div role="group" aria-label="Viewport"><button type="button" data-vp="375">Phone</button><button type="button" data-vp="768">Tablet</button><button type="button" data-vp="">Desktop</button></div>
  <button type="button" data-theme-toggle>Theme</button>
</header>
<main id="stage"><iframe id="frame" src="surface.html" title="Concept"></iframe></main>
<script>
  const frame = document.getElementById('frame');
  document.querySelectorAll('[data-vp]').forEach(b => b.onclick = () => { frame.style.width = b.dataset.vp ? b.dataset.vp + 'px' : '100%'; });
  document.querySelector('[data-theme-toggle]').onclick = () => {
    const next = document.documentElement.classList.toggle('dark');
    try { frame.contentDocument.documentElement.classList.toggle('dark', next); } catch (e) {}
  };
</script>
```

For a compact surface, inline the concept in `index.html` instead of an iframe.

## 4. Fidelity rules (anti-hallucination)

The script `scripts/verify_ledger.mjs check <surface> --gate g2` enforces the starred rules.

1. **\* Token ledger first.** In `PLAN.md` §2 map every DESIGN.md token to its code name and literal value, light and dark, copied from `tokens.css` / `globals.css` / `@theme`, never from memory. Concepts may use only ledger entries. Every hex / `rgb()` / `hsl()` / `oklch()` literal in `concepts/` must appear in `PLAN.md`; gradients, glows and arbitrary `-[...]` values are banned.
2. **\* Inventory-traced structure.** Every block, dialog, action, field and status carries `data-trace="path:line"` naming a `02-inventory.md` file. No invented routes, tabs, fields, filters, roles or workflows.
3. **\* Verbatim feedback copy.** Every toast, alert, inline error, empty state and validation string is an element with `data-copy="path:line"` whose text appears within 5 lines of that source line (or a row of the `PLAN.md` §7 copy table: use `data-copy="PLAN.md:<line>"`). Invented error codes, "Action completed successfully." and "Something went wrong" are banned.
4. **\* Realistic data.** Entity names, statuses, amounts and counts come from the codebase or fixtures; "Lorem ipsum", "User 1", "Test Item" and "Acme" fail G2 unless the literal exists in the repo and is named in `PLAN.md`.
5. **Native, accessible controls.** `<button type="button">`, `<dialog>`, `<label>`, real headings; inline SVG icons from the app's icon set; no emoji icons.
6. **Dual theme.** Define light (`:root`) and dark (`.dark`, `[data-theme="dark"]`) variables from the ledger; the toggle must flip without contrast loss (THM-01..04).

## 5. Required behaviours

Physically testable with no backend:

- Dialogs and sheets open and close (backdrop, `[data-close]`, Esc) and trap focus.
- Forms: blur and submit set `aria-invalid`, show the verbatim inline error via `aria-describedby`, clear on input; submit with errors moves focus to the first error (FRM-03/04).
- Mutation buttons show a round spinner, disable and keep size for ~600 ms (MUT-01, LDG-05..07).
- Toasts pause on hover and focus; critical errors persist as `role="alert"` banners with a recovery action (NOT-01/02).
- A fixed `.prototype-test-bar` with buttons that fire each state (form errors, error banner, empty, loading skeleton, permission denied) using only the verbatim strings from §4.3.
- The flow tables in `PLAN.md` §4b are walkable: no step advances on invalid input and each failure lands where the table says (FLW-01..04).

Keep helpers small; one `showToast(src)` that reads its text from a `data-copy` element is enough.

## 6. The tweak loop

Each user message about the concept is one revision:

1. Quote the user's words in a new row of `PLAN.md` **Revision log** (`Rev N | user words | what changed | files`).
2. Classify the change: visual, copy, structure or flow. Edit the concept **in place**; never fork a second concept.
3. Update every `PLAN.md` section the change touches (declutter table, flow table, wireframes, copy table, slices, ledger) in the same turn so the plan and the prototype never disagree.
4. A change that adds an element, string or token must first add its source (inventory row, `PLAN.md` §7 row, ledger row), then the markup.
5. Re-run `node <skill>/scripts/verify_ledger.mjs check <surface> --gate g2`; paste its output. Fix failures before showing the revision.
6. Reply with a 3-line summary: what changed, what was untouched, what to look at. Do not re-explain the whole plan.

If a requested tweak breaks a catalog rule or DESIGN.md, build it, log the conflict in the revision row and name the rule; the user decides.

## 7. G2/G3 and the script check

- **G2**: `PLAN.md` complete, the one concept exists, and `verify_ledger.mjs check --gate g2` prints PASS (no unlisted colour literal, every `data-trace` in the inventory, every `data-copy` verbatim, no filler, one concept only, flow section present, Revision log present).
- **G3**: the user approves a specific revision; quote their words and write `Approved rev N` under `PLAN.md` Approval. Any later tweak after approval reopens the loop.
- Sources: NN/g "Parallel & Iterative Design + Competitive Testing = High Usability" (Fessenden, 2024-12-03; read 2026-10-14).
