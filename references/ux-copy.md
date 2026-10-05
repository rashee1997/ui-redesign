# UX copy - clear, specific, not "AI"

> **Defaults only.** Everything here is a fallback for what the project's own DESIGN.md and existing code don't decide. If DESIGN.md sets a value or rule for the same thing (breakpoints, spacing, sizes, component choices, banned or required styles, voice), follow DESIGN.md and use its names. See `design-md.md`.

UI copy is part of the design. Bad copy creates clutter (extra words, extra helper text) and weakens hierarchy. Rewrite every user-facing string in the surface you touch, and list changes in the plan's copy table.

First check for a voice guide: DESIGN.md, PRODUCT.md, a `content-guidelines` doc, or i18n files. If the app uses i18n (`t('...')`, `messages/*.json`), change the strings in the locale files, keep keys stable unless the plan says otherwise, and update every locale you can (or flag the ones you can't).

## Rules by element

**Buttons and links**
- Verb + object, sentence case: "Save changes", "Create invoice", "Delete 3 files". Not "Submit", "OK", "Yes", "Click here".
- The button label matches the dialog title's action: title "Delete project?" → button "Delete project".
- Keep to 1–3 words where possible so it never wraps.
- Links say where they go: "View invoice", not "Learn more" repeated five times.

**Page and section titles**
- Name the thing, not a slogan: "Invoices", "Team members". Not "Manage your invoices seamlessly".
- Descriptions only when they add information the title doesn't. One sentence.

**Form labels, placeholders and help**
- Every field has a real visible label. A placeholder is never the label.
- Placeholders show format examples ("name@company.com") or nothing.
- Help text only for non-obvious rules ("Used for invoices. Not shown publicly.").
- Mark the minority: if most fields are required, mark "Optional" ones instead of asterisks on all.

**Errors** - what happened + how to fix, in plain words, no blame:
- ✗ "Oops! Something went wrong." → ✓ "Couldn't save the invoice because the connection dropped. Try again."
- ✗ "Invalid input" → ✓ "Enter a date after 1 Jan 2024."
- Place field errors under the field; page errors near the action that failed.
- Never apologize without a fact. Never show raw error codes alone.

**Empty states** - what belongs here + one action to fill it:
- ✗ "Nothing here yet!" → ✓ "No invoices yet. Create one to bill a client." [Create invoice]
- Distinguish: first-use empty vs no search results ("No invoices match 'acme'. Clear filters") vs error.

**Confirmations** - name the consequence:
- ✗ "Are you sure?" → ✓ "Delete 'Q3 report'? This removes it for everyone and can't be undone." [Cancel] [Delete report]

**Success / toasts**
- State what happened, short: "Invoice sent to jane@acme.com". Add "Undo" when possible. No "🎉 Awesome!".

**Loading & punctuation**
- Skeletons over "Loading..." text. If text is needed, say what: "Loading invoices…". Use the real ellipsis character `…` (`\u2026`), never three ASCII periods `...` (`CPY-07`).
- **Typographic quotes (`CPY-08`)**: In user-facing prose, helper copy, and dialog descriptions, use directional curly quotes (“ ” and ‘ ’) rather than typewriter straight quotes (" '). Straight quotes are reserved for code identifiers.
- **Non-breaking spaces (`CPY-09`)**: Place a non-breaking space (`&nbsp;` or `\u00A0`) between numeric values and units or compound keyboard shortcuts (e.g. `10&nbsp;MB`, `24&nbsp;px`, `⌘&nbsp;K`, `Ctrl&nbsp;+&nbsp;S`) to prevent orphan characters from wrapping to a new line.
- **Untranslated system tokens (`I18N-06`)**: Brand names, Asset IDs, SKU codes, system tokens, and acronyms must have `translate="no"` (or `className="notranslate"`) to prevent automatic browser translators from mangling technical identifiers into broken vocabulary.

## Banned AI-tell patterns
1. Promotional words: seamless(ly), effortless(ly), powerful, robust, supercharge, unlock, elevate, streamline, cutting-edge, delightful, magical, game-changing, leverage.
2. "Not just X - it's Y" / "More than just…" constructions.
3. Filler: "in order to", "simply", "just", "easily", "feel free to", "please note that".
4. "Serves as", "acts as" where "is" works.
5. Title Case On Buttons And Labels (use sentence case unless DESIGN.md says otherwise).
6. "Oops!", "Uh-oh!", "Whoops!" errors.
7. Generic "Are you sure?".
8. Em dashes in UI strings - use a period, comma or colon.
9. Forced groups of three ("Fast, simple, and secure").
10. Upbeat closers: "Happy invoicing!", "You're all set! 🚀".
11. Apologies with no fact ("Sorry for the inconvenience").
12. Emoji in functional copy.
13. Welcome banners and marketing copy inside app screens.
14. Exclamation marks (except a genuinely celebratory moment, max one).

## Final copy checklist (Phase 5)

Any **yes** → rewrite.
1. Does any button say only "Submit", "OK", "Yes", "Confirm", "Continue" without an object?
2. Does any error not say how to fix it?
3. Does any empty state lack an action (where the user is allowed to act)?
4. Does any confirm dialog not name what will be lost?
5. Does any string contain a word from the banned list, an em dash or an emoji?
6. Is any placeholder standing in for a label?
7. Is there helper text that just repeats the label?
8. Would any label wrap to two lines at 320px?
9. Are straight quotes used in prose or units wrapped without non-breaking spaces?
