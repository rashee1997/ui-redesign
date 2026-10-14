# User flow - audit & design of the path between screens

Defaults only: DESIGN.md and the codebase's own conventions win (design-md.md).

A **UI flow** is the ordered sequence of states a user moves through to finish one job: every screen, step, and dialog, plus every transition triggered by their actions. Wireframes show a state; the flow decides which states exist, in what order, and where a failure lands. Auditing screens one at a time misses flow bugs: a wizard that advances on invalid input, a dead-end confirmation, a submit whose error leaves the user nowhere.

Every state-changing surface gets a **flow table in `PLAN.md` §4b before wireframes are drawn** (Gate G2). A read-only surface with no transitions writes `N/A: single-screen, no state change`.

## Contents
1. Flow table format
2. Friction pass
3. Rules FLW-01..04: detect & fix
4. Flow audit questions

## 1. Flow table format

One table per flow (the primary task of the surface first):

```markdown
### F-01 <flow name> (closes <finding IDs>)
| Step | Entry (precondition) | User action | Validation (file:line) | Pass → | Fail → (code, where it lands) |
|---|---|---|---|---|---|
| S1 | list view | click "New invoice" | - (navigation) | dialog opens | - |
| S2 | dialog open | submit form | invoice-schema.ts:22 `safeParse` | POST → row in list, dialog closes | 409 `INVOICE_EXISTS` → inline FieldError under "Client" |
```

- **Validation** cites the exact schema/handler `file:line`; a client-only gate where the write happens server-side is both a flow finding and `FRM-11`.
- **Fail →** names the code (or HTTP status) *and* where the user lands (inline field error, alert region, toast + retained position). "Toast" alone with no position answer is `FLW-04` material.
- Every fail cell maps to a finding ID or `N/A (navigation step)`.

## 2. Friction pass

One line under each flow table; a failed check is fixed in the table before G2, never deferred:

```
Friction: path ok | next visible | back safe | interruption ok — or fix: <change to the table>
```

| Check | Question | Fails when |
|---|---|---|
| Path ok | Does every step earn its place? | Confirm/summary screens for single low-risk actions (`FLW-03`); data the system already holds is re-asked (`A11Y-19`) |
| Next visible | Can the user see where they are and what's next? | No step indicator; ambiguous or multiple equal-weight next actions (`FLW-01`) |
| Back safe | Does Back/cancel preserve or warn? | Draft lost without warning (`FRM-08`, `FRM-24`); Back traps (`NAV-09`) |
| Interruption ok | Is a modal used only where data would be lost? | Blocking dialogs for inline feedback (NN/g: dialogs force dismissal before acting, `DLG-01`) |

Sources: NN/g *Wireflows* (arrows from acting control to resulting state, including error states), NN/g *10 Design Guidelines for Reporting Errors in Forms* (inline errors next to the field, never validate before input is complete, dialogs sparingly), Baymard *Inline Form Validation* (submit-only errors force full stops; premature validation is the top failure mode) - all read 2026-10-14.

## 3. Rules FLW-01..04: detect & fix

### FLW-01 - No position or next-action signposting
- **Detect**: a stepper/wizard/multi-step dialog renders no current-step indicator (step count, bar, title), or the step has no single unambiguous next action (two+ equal-weight buttons, or next hidden below the fold).
- **Fix**: `Step 2 of 4` text + progress bar (semantic, `aria-current="step"`), one primary next action per step; keep the HIE-02 one-primary rule inside each step.

### FLW-02 - Transition without a validation gate
- **Detect**: `handleNext` / `onNext` / `setStep(s + 1)` / `router.push` advances the flow without running the step's validation (`safeParse`, `trigger()`, `form.formState.isValid`); or submit fires while the step's declared check is pending/failed.
- **Fix**: gate the transition - run the step's schema, block on failure, render the inline error (FRM-03). Never advance on invalid input; validate on blur/submit, not per keystroke (FRM-05).

### FLW-03 - Redundant flow step
- **Detect**: an intermediate screen whose only job is confirming data the system already holds or the user just typed, with no decision, consent, or review choice (re-read the step: what can the user *decide* here?).
- **Fix**: remove the step, or give it a real job (editable review list, choice of destination, consent). Merge with the preceding step when it is just a re-display.

### FLW-04 - Transition failure loses flow position
- **Detect**: `.then(() => next())` with no error branch; mutation error caught while step state already advanced; a failed submit unmounts the step/parent so entered data is gone; failure reported only by a generic toast with no return to the failed step.
- **Fix**: advance only in the success branch; on failure stay on the step, keep inputs, show the error inline (cause + fix, CPY-02) or in an alert region; re-enable the action with retry (ERR-04).

## 4. Flow audit questions

Run while reading the surface (static-audit.md §3); record hits as candidates in `03-findings.md`.

1. List every flow: primary task flow, plus create/edit/delete/retry sub-flows. Does each have steps or transitions beyond a plain link?
2. For each transition (button, Enter, swipe, auto-advance): what validates before it fires (FLW-02)? What happens on failure (FLW-04)?
3. Is position visible at every step, with exactly one obvious next action (FLW-01)?
4. Does every step change a decision, or only re-display data (FLW-03)?
5. Do all terminal states - success, validation failure, no-permission, cancelled - have a way forward (STA-07, STA-10)?
6. Does Back restore the flow (or at least not destroy it) - URL/state restore (NAV-02), no back-button trap (NAV-09), draft preserved (FRM-24)?
7. Does the fail path land where the user's attention is: field error next to the field, screen error in an alert region (ERR-05, FRM-03)?
