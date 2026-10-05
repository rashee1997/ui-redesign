# Accessibility (A11Y) & Assistive Technology

Defaults only: when DESIGN.md or the codebase's own design system primitives decide something differently, they win (`design-md.md`).

Sources: W3C WCAG 2.2 (Level A & AA Success Criteria), W3C WAI-ARIA Authoring Practices Guide (APG 1.3), Vercel Web Interface Guidelines, Radix UI & React Aria design patterns.

## Contents
1. Core principles & the hierarchy of solutions
2. Accessible names & semantic elements
3. Keyboard navigation & focus architecture
4. Color, contrast & visual distinguishability
5. Target sizes & pointer alternatives (WCAG 2.2)
6. Forms, validation & assistive associations
7. Dynamic announcements, status & live regions
8. APG widget patterns (dialogs, disclosures, tabs, comboboxes)
9. Accessibility audit checklist

---

## 1. Core principles & the hierarchy of solutions

Accessibility is not a list of optional polish items; it is structural engineering for human variance (vision, motor, hearing, cognition, and device setups).

### The hierarchy of solutions
1. **Native HTML first**: A native `<button>` or `<a>` gives keyboard focus, Enter/Space activation, screen-reader role, and disabled states for free. Never recreate native mechanics with `<div>` or `<span>`.
2. **Design-system primitives second**: For complex widgets (dialogs, dropdowns, tabs, comboboxes, tooltips), use vetted accessible primitives (`@/components/ui/*`, Radix UI, React Aria) rather than rolling custom state machines.
3. **ARIA as the last resort**: The First Rule of ARIA states: *If you can use a native HTML element or attribute with the semantics and behavior already built in, do so instead of repurposing an element and adding ARIA.*
4. **Never break semantics with ARIA**: Never place `aria-hidden="true"` on a focusable element or a container containing focusable items. Never nest interactive elements (`<button>` inside `<button>` or `<a>`).

---

## 2. Accessible names & semantic elements

Every interactive control must have an unambiguous, programmatic accessible name that assistive technology can announce.

### A. Icon-only buttons (A11Y-02)
- **Problem**: `<button><svg>...</svg></button>` has no text content. Screen readers announce "button" with no purpose.
- **Fix**: Provide an `aria-label` or visually hidden text (`<span className="sr-only">...</span>`), and mark the interior SVG with `aria-hidden="true"`.
```tsx
// Before (Broken)
<button onClick={onClose}><XIcon className="h-4 w-4" /></button>

// After (Accessible)
<button onClick={onClose} aria-label="Close dialog">
  <XIcon className="h-4 w-4" aria-hidden="true" focusable="false" />
</button>
```

### B. Interactive non-semantic elements (A11Y-01)
- **Problem**: `<div onClick={handleClick}>` or `<span onClick={navigate}>`. Divs cannot receive keyboard Tab focus by default, do not trigger on Enter or Space, and announce no role.
- **Fix**:
  - If it triggers an action or mutation: use `<button type="button">`.
  - If it navigates to a URL: use native `<a>` or framework `<Link href="...">`.

### C. Image alternatives (A11Y-08)
- Informative images require descriptive `alt="..."` explaining the content/intent.
- Purely decorative images or icons next to visible labels must have `alt=""` or `aria-hidden="true"` so screen readers skip them cleanly.

### D. Landmark and heading structure (A11Y-07)
- Use standard HTML5 landmarks: `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>`.
- Maintain a logical heading hierarchy: exactly one `<h1>` per view; do not skip levels (e.g. jumping from `<h1>` directly to `<h3>` or `<h4>`).

---

## 3. Keyboard navigation & focus architecture

Keyboard accessibility is essential for power users, screen reader users, switch device users, and anyone without a fine pointer.

### A. Visible focus indicators (A11Y-03)
- **Rule**: Never use `outline-none` or `outline: none` without providing an explicit, high-contrast `:focus-visible` ring.
- **Contrast**: The focus indicator must have at least **3:1 contrast ratio** against both the unfocused state and adjacent background colors (WCAG 2.4.7 & 1.4.11).
- **Pattern**:
```tsx
className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

### B. Natural DOM focus order & positive tabIndex (A11Y-15, LAY-09)
- Visual reading order must match DOM order. Never use CSS `flex-direction: row-reverse` or `order` in ways that cause keyboard focus to jump backward or unpredictably.
- **Ban positive tabIndex**: Never use `tabIndex={1}` or higher. Natural tab order is established by DOM order. Use `tabIndex={0}` to include an element in natural tab sequence, or `tabIndex={-1}` for programmatic focus targets.

### C. Focus obscured by sticky chrome (A11Y-12, WCAG 2.2 AA SC 2.4.11)
- **Problem**: Sticky navigation headers, fixed bottom bars, or floating action bars overlap focused inputs or buttons when users tab down a page.
- **Fix**: Apply `scroll-margin-top` / `scroll-margin-bottom` on scrollable containers or focusable elements, or `scroll-padding` on the container:
```css
/* Ensure focused elements stay completely visible below sticky header */
:focus-visible {
  scroll-margin-top: 5rem;
  scroll-margin-bottom: 5rem;
}
```

### D. Keyboard traps (A11Y-14, WCAG 2.1 SC 2.1.2)
- Focus must never get trapped in an interactive component without an intuitive escape route.
- In dialogs and sheets: focus must be constrained *intentionally* inside the overlay while open, but pressing **Escape** must immediately close the overlay and restore focus to the trigger element that opened it.

---

## 4. Color, contrast & visual distinguishability

### A. Contrast minimums (A11Y-04, WCAG 1.4.3 & 1.4.11)
- **Body & normal text (< 18px regular, < 14px bold)**: Minimum **4.5:1** contrast ratio against background.
- **Large text (≥ 18px regular, ≥ 14px bold)**: Minimum **3.0:1** contrast ratio.
- **UI components & graphical boundaries**: Active controls, borders of inputs, icons conveying state, and focus rings require **3.0:1** contrast against adjacent backgrounds.
- **Theme parity (THM-02)**: Verify contrast in both Light and Dark themes. Dark mode text frequently fails when raw greys (e.g. `#666`) are used.

### B. Color is never the sole indicator (A11Y-06, WCAG 1.4.1)
- Never convey state, priority, or error solely through color hue.
- Always combine color with a secondary cue: an icon (e.g. checkmark or alert triangle), bold text weight, underline on links, or textual status badges ("Active", "Failed").

---

## 5. Target sizes & pointer alternatives (WCAG 2.2)

### A. Target size minimums (A11Y-05, WCAG 2.2 AA SC 2.5.8)
- Every interactive target must have an activation area of at least **24×24 CSS pixels**, or have sufficient spacing from adjacent targets so that a 24px diameter circle centered on the target does not intersect another target.
- For primary mobile touch targets (buttons, list item rows, navigation links), **44×44 CSS pixels** is strongly recommended.
- If visual design demands a compact icon (e.g. 16×16px), extend the click target using padding or negative margins (`p-2 -m-2`).

### B. Dragging & gesture alternatives (A11Y-13, WCAG 2.2 AA SC 2.5.7)
- Any functionality that requires a dragging movement (drag-and-drop reordering, sliders, swipe to delete, kanban cards) must have a single-pointer and keyboard alternative:
  - Sliders: operable via arrow keys, with clickable increment/decrement buttons.
  - Reorderable lists: Provide "Move up" and "Move down" action buttons in an item action menu.
  - Swipe to delete: Provide an explicit "Delete" button in the row or context menu.

---

## 6. Forms, validation & assistive associations

Forms are the most critical user-interaction surface. Broken form accessibility blocks users from completing work.

### A. Explicit label linkage (FRM-01, A11Y-01)
- Every input, select, and textarea must have a visibly associated `<label>`.
- Use matching `htmlFor` on the label and `id` on the input:
```tsx
<label htmlFor="user-email" className="text-sm font-medium">Email Address</label>
<input id="user-email" type="email" name="email" className="..." />
```
- Placeholders are hints, never labels (CPY-06). They vanish upon typing and lack consistent contrast.

### B. Error and helper text linkage (FRM-03, A11Y-18)
- When a field fails validation:
  1. Set `aria-invalid="true"` on the input.
  2. Link the error message element via `aria-describedby`:
```tsx
<input
  id="email"
  name="email"
  aria-invalid={Boolean(errors.email)}
  aria-describedby={errors.email ? "email-error" : "email-hint"}
/>
{errors.email ? (
  <p id="email-error" role="alert" className="text-sm text-destructive">
    {errors.email}
  </p>
) : (
  <p id="email-hint" className="text-xs text-muted-foreground">
    We will send verification to this address.
  </p>
)}
```

### C. Redundant data entry (A11Y-19, WCAG 2.2 AA SC 3.3.7)
- In multi-step wizards or checkout flows, do not ask users to re-enter information entered in a previous step (e.g. billing address matching shipping address). Auto-populate or provide a single-click selection.

### D. Accessible authentication (A11Y-20, WCAG 2.2 AA SC 3.3.8)
- Do not block password managers or pasting (`onPaste={(e) => e.preventDefault()}` is forbidden).
- Provide alternatives to cognitive memory or puzzle tests (magic links, WebAuthn/passkeys, copy-pasteable OTPs).

---

## 7. Dynamic announcements, status & live regions

Assistive technologies do not automatically detect visual DOM mutations that occur outside the currently focused element.

### A. Toasts, alerts & status messages (A11Y-09, ERR-05)
- **Urgent alerts & errors**: Use `role="alert"` or `aria-live="assertive"` so screen readers interrupt and announce immediately.
- **Status updates & subtle toasts**: Use `role="status"` or `aria-live="polite"` so announcements wait until the user pauses.
- **Search result counts & filter changes**: Announce updated item counts politely:
```tsx
<div role="status" aria-live="polite" className="sr-only">
  {isSearching ? "Searching documents..." : `${count} documents found`}
</div>
```

### B. Loading states (LDG-05)
- Async containers or action buttons in a pending state should declare `aria-busy="true"` until the mutation or data fetch resolves:
```tsx
<button type="submit" disabled={isPending} aria-busy={isPending}>
  {isPending ? <Spinner aria-hidden="true" /> : "Save Changes"}
</button>
```

---

## 8. APG widget patterns (Authoring Practices Guide)

Use established, accessible component primitives. Verify key behaviors:

| Widget | Required Keyboard & ARIA Behavior |
|---|---|
| **Modal Dialog / Sheet** | Focus trapped inside; Esc closes; focus restored to trigger on unmount; `role="dialog"` with `aria-modal="true"`; `aria-labelledby` linked to title; background scroll locked without layout shift. |
| **Disclosure / Accordion** | Trigger is a `<button>` with `aria-expanded="true|false"` and `aria-controls="panel-id"`; Enter/Space toggles; panel has matching `id`. |
| **Tabs** | Container has `role="tablist"`; tab triggers have `role="tab"`, `aria-selected="true|false"`, `aria-controls="panel-id"`; arrow keys navigate between tabs; active panel has `role="tabpanel"`. |
| **Dropdown Menu** | Trigger has `aria-haspopup="menu"`, `aria-expanded`; items have `role="menuitem"`; arrow up/down navigates items; Esc closes and returns focus to trigger. |
| **Combobox / Autocomplete** | Input has `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`, `aria-controls="listbox-id"`; options have `role="option"`; active option tracked via `aria-activedescendant`. |

---

## 9. Accessibility audit checklist

Run this checklist during static code review:
- [ ] Every button, link, and input has a distinct accessible name (no unlabeled icon buttons).
- [ ] No `onClick` on non-interactive elements (`div`, `span`) without native semantic replacement.
- [ ] Keyboard Tab navigation follows visual flow without gaps or jumps (no positive `tabIndex`).
- [ ] Focus indicators are visibly distinct (`:focus-visible` with ≥ 3:1 contrast against neighbors).
- [ ] No keyboard traps; dialogs close on Escape and restore focus to the trigger.
- [ ] Sticky chrome does not obscure focused elements (`scroll-margin` / `scroll-padding` present).
- [ ] All text meets contrast thresholds (4.5:1 normal, 3:1 large) in both light and dark themes.
- [ ] Information is never conveyed by color alone (always paired with icon, text, or pattern).
- [ ] Touch targets meet minimum 24×24px (and 44×44px for primary mobile actions).
- [ ] Drag-and-drop or swipe gestures provide single-pointer/button alternatives.
- [ ] Form fields have programmatic label associations (`htmlFor`) and linked error messages (`aria-describedby`).
- [ ] Dynamic updates, errors, and toast notifications announce via `role="alert"` or `aria-live`.
- [ ] Images have appropriate `alt` attributes (`alt=""` for purely decorative graphics).
