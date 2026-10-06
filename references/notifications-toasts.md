# Toasts, Notifications & Alerts

Defaults only: when the project's `DESIGN.md` or existing notification primitives decide something differently, they win (`design-md.md`).

Toasts, banners, and notification badges deliver asynchronous system feedback. Every rule here is a strict law of the book: deterministic, falsifiable, and auditable against concrete code signals.

## Contents
1. Non-critical vs persistent feedback (NOT-01)
2. Interactive action timers & hover pausing (NOT-02)
3. Batch aggregation & stack cap hygiene (NOT-03)
4. Viewport placement & control occlusion (NOT-04)
5. Unread badge synchronization (NOT-05)
6. Audit checklist

---

## 1. Non-critical vs persistent feedback (NOT-01)

### The Law
- **Toasts are for low-consequence, asynchronous confirmation only** (*"Link copied"*, *"Document archived"*, *"Draft saved"*).
- Auto-dismissing toasts MUST NEVER be used for critical errors, system outages, authentication failures, or messages containing complex error codes/technical diagnostics.
- Critical and actionable errors MUST be rendered as persistent inline alerts (`<Alert variant="destructive">`) or modal dialogs that require explicit user dismissal or affirmative recovery actions.
- Any toast displaying an error code or recovery instructions MUST NOT auto-dismiss on a short timer (< 10 seconds).

### Code signal & violation
```tsx
// VIOLATION: Complex error with critical reference code vanishes in 3 seconds
toast.error(`Payment processing failed. Reference: ERR_${txId}`, { duration: 3000 });

// PASS: Persistent alert requiring user dismissal or retry
toast.error(`Payment processing failed. Reference: ERR_${txId}`, {
  duration: Infinity,
  action: { label: 'Retry', onClick: () => handleRetry() },
});
```

---

## 2. Interactive action timers & hover pausing (NOT-02)

### The Law
Any notification that contains an interactive button or action (such as *"Undo"*, *"View"*, or *"Retry"*):
1. MUST pause its auto-dismiss countdown timer whenever the pointer is over the toast (`:hover`) or keyboard focus enters the container (`:focus-within`).
2. MUST offer an interactive window of at least 8,000ms (8 seconds) if not hovered or focused.
3. Timer countdown MUST resume only after both pointer hover and keyboard focus have exited the element.

Failing to pause timers causes racing conditions where users attempt to click an "Undo" button as it animates away, clicking an underlying button instead.

---

## 3. Batch aggregation & stack cap hygiene (NOT-03)

### The Law
- Performing a batch operation on $N$ records (e.g. deleting 15 documents or uploading 8 files) MUST emit a single aggregated summary notification (*"Archived 15 documents"*).
- Emitting $N$ individual floating toasts for a loop of mutations is a strict VIOLATION.
- Toast containers MUST enforce a visible stack cap of no more than 3 simultaneous notifications. Incoming notifications beyond the cap must displace older ones or queue in order.

### Code signal & violation
```tsx
// VIOLATION: Loop fires 20 individual toasts covering the viewport
items.forEach((item) => {
  toast.success(`Deleted ${item.name}`);
});

// PASS: Single aggregated summary toast
toast.success(`Deleted ${items.length} items`);
```

---

## 4. Viewport placement & control occlusion (NOT-04)

### The Law
Toast containers MUST NOT occlude primary navigation bars, top-right header action buttons (such as Save, Publish, or Profile menus), or mobile bottom tab bars.
- **Desktop viewports (≥1024px)**: Anchor toasts to the bottom-right corner.
- **Mobile viewports (<640px)**: Anchor toasts to bottom-center with safe-area bottom padding (`env(safe-area-inset-bottom)`) positioned above navigation bars.
- Sticky action bars and modal dialogs must sit in higher z-index layers than background toasts, or toasts must reposition dynamically to avoid covering active form actions.

---

## 5. Unread badge synchronization (NOT-05)

### The Law
Notification badge counters (e.g. `(3)` on a bell icon or tab indicator) MUST:
1. Decrement or clear synchronously upon opening the notification center or marking individual items as read.
2. Synchronize across tabs using storage events or real-time query invalidation.
3. Never display phantom counts where the badge indicates unread items but opening the list reveals an empty or all-read state.

---

## 6. Audit checklist

- [ ] `NOT-01`: Complex/actionable error messages do not auto-dismiss on short timers; persistent until closed.
- [ ] `NOT-02`: Interactive toasts ("Undo", "View") pause timer on hover and focus; duration ≥8s.
- [ ] `NOT-03`: Batch operations emit one aggregated notification; maximum 3 visible toasts stacked.
- [ ] `NOT-04`: Toasts do not occlude top-bar primary action buttons or mobile bottom navigation bars.
- [ ] `NOT-05`: Notification badge counters decrement synchronously when opened or read.
