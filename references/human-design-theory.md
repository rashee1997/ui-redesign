# Human Design Theory - UI/UX for actual humans, not robots

> **Defaults only.** Everything here is a foundation for designing interfaces that respect human cognitive architecture and emotional psychology. If DESIGN.md sets explicit design system rules, follow DESIGN.md. See `design-md.md`.

Machines parse dense relational matrices effortlessly. Humans do not. When software is authored as a direct projection of database tables, API schemas, or state machines, it creates an interface "for robots": visual noise, cognitive fatigue, disorientation, anxiety, and catastrophic operational errors.

This guide codifies the foundational psychological and perceptual laws required for human-centered UI/UX design and redesigns.

---

## Contents
1. Cognitive Load Theory & Working Memory (Sweller, Miller, Hick)
2. The Action Cycle: Gulfs of Execution and Evaluation (Norman)
3. Gestalt Laws of Visual Perception (Wertheimer, Koffka, Köhler)
4. Calm Technology & Peripheral Attention (Weiser, Brown)
5. The Humane Interface & Mode Error (Raskin)
6. Recognition Over Recall & Progressive Disclosure (Nielsen)
7. Emotional Memory & The Peak-End Rule (Kahneman)
8. Human vs Robot UI Comparison
9. Audit Checklist (HUM-01 to HUM-08)

---

## 1. Cognitive Load Theory & Working Memory (HUM-01)

### The Psychological Law
Human working memory is strictly bounded:
- **Miller's Law**: Humans can process only $7 \pm 2$ discrete chunks of information at a time. In modern high-complexity operational tasks, the limit drops to **3 to 4 active chunks** (Cowan's limit).
- **Cognitive Load Theory (John Sweller)** splits mental effort into three types:
  1. *Intrinsic Load*: The inherent difficulty of the actual domain task (e.g. deciding whether an asset passes safety inspection).
  2. *Germane Load*: The mental processing devoted to understanding and learning the domain.
  3. *Extraneous Load*: The unnecessary mental friction imposed by poor interface layout, confusing terminology, visual clutter, and irrelevant choices.
- **Hick's Law**: The time required to make a decision increases logarithmically with the number and complexity of choices: $T = b \cdot \log_2(n + 1)$.

### Failure Mode: Machine Slop
Dumping 20 form fields on one screen, exposing 12 competing toolbar filters simultaneously, or rendering unorganized cards without visual chunking consumes all working memory on *extraneous load*, forcing human error.

### Human-First Fix
1. **Chunking**: Group related inputs into bounded thematic cards of 3–5 fields maximum.
2. **Progressive Disclosure**: Expose only the primary 20% of controls used 80% of the time. Place advanced filters, raw metadata, or historical logs behind contextual drawers or disclosures.
3. **Choice Architecture**: Present single recommended defaults rather than paralysis-inducing multiple equal-weight buttons.

---

## 2. The Action Cycle: Gulfs of Execution and Evaluation (HUM-02, HUM-03)

### The Psychological Law (Don Norman)
Every human interaction with an interface moves through two critical gulfs:

```
[ User Goal ]
     │
     ▼ (Gulf of Execution: How do I do it?)
[ Physical Action on UI ]
     │
     ▼ (Gulf of Evaluation: Did it work? What state am I in?)
[ Perception of System State ]
```

1. **The Gulf of Execution**: The gap between the user's intent ("I want to archive this document") and the physical mechanics required by the interface.
   - *Signifiers & Affordances*: Controls must visibly broadcast how they are operated (pushable buttons, draggable handles, clickable links).
   - *Natural Mapping*: The spatial arrangement of controls must mirror their real-world or logical relationship (e.g. up/down controls match top/bottom elements).
2. **The Gulf of Evaluation**: The difficulty the user faces in assessing whether their action succeeded and what the new state of the system is.
   - *Immediate Feedback*: Every action must register an observable physical change within **100ms** (active press depression, inline badge change, or optimistic status update).

### Failure Mode
- Invisible buttons disguised as plain text with no hover/focus signifiers.
- Submitting a mutation where the button stays enabled with no spinner, or the dialog vanishes without showing the created item or updating counts.

### Human-First Fix
- Give every actionable control explicit visual affordance (border, tonal surface, elevation, cursor).
- Bridge evaluation with instant deterministic visual confirmation (<100ms press depression, immediate spinner/toast, explicit status shift).

---

## 3. Gestalt Laws of Visual Perception (HUM-04)

### The Perceptual Laws
The human visual cortex organizes visual scenes automatically before conscious thought:
- **Law of Proximity**: Objects that are close together are perceived as a unified group; objects far apart are perceived as unrelated.
- **Law of Similarity**: Elements sharing shape, color, or typography are perceived to perform identical functions.
- **Law of Common Region**: Elements enclosed within a visible boundary (card, border, background wash) are interpreted as belonging to the same entity.
- **Law of Continuity**: The eye follows continuous lines and rhythm, anticipating alignment along vertical and horizontal axes.

### Failure Mode
Label is 16px from its field, but 12px from the preceding unrelated field. The human eye groups the label with the wrong control.

### Human-First Fix
- **Proximity Scale**:
  - Distance between label and input: `gap-1.5` (6px).
  - Distance between fields in the same group: `gap-4` (16px).
  - Distance between separate form sections: `gap-8` (32px).
- Enclose coherent entities in dedicated common regions (`card`, tonal background tier).

---

## 4. Calm Technology & Peripheral Attention (HUM-07)

### The Psychological Law (Mark Weiser & John Seely Brown)
"A calm technology will move easily from the periphery of our attention, to the center, and back."
Human attention is an exhaustible, precious biological resource. Technology must not constantly scream for focal attention.

### Failure Mode
- Toast notifications popping up for every mundane read, background sync, or automatic autosave.
- Flashing red alert banners for minor warnings.
- AI assistants demanding conversational turns for tasks that need a simple toggle.

### Human-First Fix
1. **Peripheral Indicators**: Autosave indicators belong quietly in the footer or corner (`Saved 2m ago`), remaining in peripheral awareness without interrupting focal gaze.
2. **Restrained Severity Escalation**:
   - Background success: quiet silent state update or subtle peripheral tick.
   - Non-critical warning: muted badge or inline helper.
   - High-severity blocking failure: only then introduce an alert banner or dialog requiring acknowledgment.

---

## 5. The Humane Interface & Mode Error (HUM-05)

### The Psychological Law (Jef Raskin)
Human attention is singular (*locus of attention*). When a system introduces invisible modes (e.g. "Edit Mode" vs "View Mode", or caps lock active), identical physical actions produce radically different outcomes. Users inevitably forget the current mode and make catastrophic errors.

### Failure Mode
Clicking a table row in "Select Mode" selects it, but in "Normal Mode" navigates away, destroying unsubmitted work. The user cannot see the active mode without scanning outside their focal area.

### Human-First Fix
1. **Quasi-Modes**: If modes are unavoidable, make them spring-loaded (hold key to inspect, release to return).
2. **Persistent Visual Ambient Shift**: If a view is in Edit or Bulk mode, tint the surrounding viewport chrome or header so the mode is visible in peripheral vision without active scanning.
3. **Monomodal Defaults**: Prefer direct inline editing or explicit dedicated dialogs over whole-screen ambient modal state switches.

---

## 6. Recognition Over Recall & Progressive Disclosure (HUM-06)

### The Psychological Law (Jakob Nielsen)
Retrieving information from long-term memory (*recall*) requires significant cognitive energy and fails under stress. Recognizing information from perceptible cues (*recognition*) is effortless and instantaneous.

### Failure Mode
- Requiring a user to type an exact `Asset ID` or `Department Code` from memory instead of selecting from an autocomplete picker.
- Multi-step wizards where Step 3 refers to numbers or choices from Step 1 that are now hidden from view.

### Human-First Fix
- Autocomplete, comboboxes, and search pickers with live filtering.
- Multi-step summaries: persistently display previous key choices in a sticky sidebar or top breadcrumb ledger.
- Contextual defaults: auto-fill known user metadata (department, author name, current date).

---

## 7. Emotional Memory & The Peak-End Rule (HUM-08)

### The Psychological Law (Daniel Kahneman)
Humans do not remember the duration or sum of an experience; they remember two specific points:
1. **The Peak**: The most intense emotional moment (positive or negative).
2. **The End**: The resolution of the interaction.

### Failure Mode
A user completes a 10-minute complex compliance document upload. At the end, the window simply closes silently to a raw table, or crashes with a raw JSON error: `{ "error": "PrismaClientKnownRequestError" }`. The entire experience is remembered as traumatic and hostile.

### Human-First Fix
- **Affirming Endings**: After completing a high-stakes workflow, provide an affirmative summary card with clear next steps: `"Document QMS-0042 published. View document or Return to list."`
- **Compassionate Peak Failures**: When an error occurs at the peak, never blame the user or dump raw codes. Provide clear explanation, preserve their entered data 100%, and provide a 1-click retry.

---

## 8. Human vs Robot UI Comparison

| Dimension | UI for Robots (Anti-Pattern) | UI for Humans (Human Design Theory) |
|---|---|---|
| **Layout** | 30 fields exposed in flat grid matching DB columns | Bounded thematic chunks of 3–5 fields with progressive disclosure |
| **Actions** | 6 primary colored buttons competing for attention | Exactly 1 clear dominant primary CTA; secondary actions grouped |
| **Feedback** | Silent network call; raw JSON error on failure | Instant <100ms visual response; human cause + fix explanation |
| **Memory** | User must re-type codes, IDs, and previous choices | Autocomplete pickers, pre-populated defaults, persistent context |
| **Notifications** | High-pitched loud modal alerts for minor events | Peripheral ambient indicators for routine status; calm defaults |
| **Spacing** | Uniform arbitrary gaps disconnected from relationships | Strict Gestalt proximity: label close to input, far from next group |
| **Resolution** | Cold silent cutoff or unhandled crash | Calm affirmative ending with next actions; zero data loss on error |

---

## 9. Diagnostic Audit Checklist (HUM-01 to HUM-08)

Every new feature design or UI redesign must be audited against these rules:

- [ ] **HUM-01 (Cognitive Load)**: No screen presents >7 unchunked options, form inputs, or navigation links without grouping or progressive disclosure.
- [ ] **HUM-02 (Gulf of Execution)**: Every actionable control has unmistakable signifiers (cursor, hover/focus states, affordance) so users never guess how to act.
- [ ] **HUM-03 (Gulf of Evaluation)**: Every user interaction produces visible feedback within 100ms; mutations explicitly confirm state change in focal gaze.
- [ ] **HUM-04 (Gestalt Proximity)**: Related labels, inputs, and descriptions are closer to each other than to adjacent unrelated elements.
- [ ] **HUM-05 (Modality Trap)**: No hidden system modes where identical actions trigger contradictory behavior; active modes broadcast unambiguous ambient state.
- [ ] **HUM-06 (Recognition Over Recall)**: Users are never forced to remember codes, IDs, or prior screen data; inputs offer pickers, autocomplete, and summaries.
- [ ] **HUM-07 (Calm Attention)**: Non-critical telemetry, background autosaves, and system status remain in the calm periphery; no high-alert modal interruptions.
- [ ] **HUM-08 (Peak-End Resolution)**: Error states provide compassionate cause+fix with zero data loss; workflow completions offer clear affirmative closure and next actions.
