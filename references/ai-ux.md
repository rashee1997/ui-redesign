# AI chat, streaming & generated answers

> **Defaults only.** Everything here is a fallback for what the project's own DESIGN.md and existing code don't decide. If DESIGN.md sets AI voice, citation, or streaming rules, follow DESIGN.md and use its names. See `design-md.md`.

Rules map to `AI-01`..`AI-06` in `rule-catalog.md`.

Sources: NN/g "AI Hallucinations: What Designers Need to Know" (Laubheimer 2025), Setproduct "Command Palette UI Design" (AI-native palettes, Kamushken 2026), Google PAIR Guidebook.

## Contents
1. Stream state & stop · 2. Sources drill-down · 3. Contextual uncertainty · 4. Visible seam · 5. Confirm or undo · 6. Feedback & verify · 7. Checklist

## 1. Stream state & stop (AI-01)

Long generations (> ~1s) stream tokens progressively with step text ("Searching 3 documents…"), not a blank panel or full-screen spinner. A Stop button cancels the stream; closing the dialog mid-stream keeps or discards output deliberately, never loses it silently. Treat like a long job in `loading-states.md` §1 (progress, not spinner).

```tsx
{status === 'streaming' && (
  <div aria-live="polite" aria-busy="true">
    <StreamText tokens={tokens} />
    <Button type="button" onClick={stop}>Stop</Button>
  </div>
)}
```

## 2. Sources drill-down (AI-02)

Factual answers cite the documents they came from: source links, cards, or a reference list above or below the text, with count and recency where it matters ("3 sources · newest 2 Oct"). For QHSE Q&A every claim that affects compliance must trace to a document chunk. Presence of links must not imply truth — keep the seam in §4.

## 3. Contextual uncertainty (AI-03)

A generic small-print "can make mistakes" line is liability text, not UX — NN/g shows users habituate and stop seeing it. Warn where risk is: first-person uncertainty on low-confidence outputs ("I'm not sure, but…"), High/Med/Low confidence labels on high-stakes answers (health, safety, legal). Never a bare percentage that implies false precision the model cannot back.

## 4. Visible seam (AI-04)

When AI results share a list with deterministic ones (palette, search, records), group them under a labelled "AI answer" header and never let a generated row outrank a real command. Users forgive a fallback that admits what it is; they stop trusting the surface the first time it confidently runs the wrong thing.

## 5. Confirm or undo (AI-05)

Prompted writes (assign, change status, delete, publish) show a preview of what will happen and require confirm, or offer an undo window. Follows `MUT-07`; AI initiation never skips it.

## 6. Feedback & verify (AI-06)

Answers that matter carry thumbs up/down (or copy / cite-check) plus a human-verify next step ("Open source", "Ask a reviewer"). Feed the signal back; don't strand the user on an answer they cannot check.

## 7. Checklist

- [ ] Streaming shows tokens + step text + Stop; close mid-stream is deliberate (AI-01).
- [ ] Factual claims link to sources with count/recency (AI-02).
- [ ] Low-confidence or high-stakes outputs carry first-person or High/Med/Low uncertainty in context (AI-03).
- [ ] AI group labelled; never outranks real commands (AI-04).
- [ ] AI-initiated writes confirm or undo (AI-05).
- [ ] Feedback + verify path on answers that matter (AI-06).
