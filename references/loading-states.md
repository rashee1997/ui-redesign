# Loading states - skeletons and pending buttons

> **Defaults only.** If the project already has a `Skeleton`, `Spinner`, `LoadingButton` or a `loading` prop on Button, use and fix those rather than adding new ones. DESIGN.md's motion and color rules win.

## Contents
1. Which loading state to use
2. Skeletons: rules
3. Skeletons: where they're usually missing
4. Pending buttons and the oval-spinner bug
5. One shared Spinner and one loading Button
6. Checklist

## 1. Which loading state to use

| What's loading | Use |
|---|---|
| A page or region's data, first time | **Skeleton** shaped like the final content |
| Next page / new filter on a list already shown | Keep old data, dim it, `aria-busy`; thin progress bar or nothing |
| A button's action (submit, save, delete, export) | **Pending button**: disabled, spinner inside, same size |
| Background refetch | Nothing, or a tiny indicator in the header |
| Long job (> ~5s: upload, export, AI generation) | Progress bar with real progress or step text ("Uploading 3 of 8 files") |
| Instant actions (toggle, star, reorder) | Optimistic update, roll back on error |

Never: a full-screen spinner for a partial update; a spinner replacing content that was already on screen; blank space while loading.

## 2. Skeletons: rules

- **Match the final layout exactly** - same container, same grid, same row height, same widths. The real content must replace it with no layout shift. Build the skeleton from the same layout component/classes as the real one where possible (e.g. render the real `<Table>` header with skeleton cells).
- **Redesign rule: never reuse an old skeleton for redesigned UI (LDG-11)** - when a component, card, table, or page layout is redesigned, its skeleton must be redesigned in tandem to match the new structure, dimensions, and layout. Reusing the legacy skeleton causes jarring visual mismatch and layout shift (CLS) when loading switches to the newly redesigned content. If the UI changes, the skeleton changes too.
- **Right count**: list/table skeletons render as many rows as the page size (or the number that fits on screen); cards as many as one row of the grid × 2.
- **Shape from content**: text lines are bars of the text's line height with varied widths (e.g. 60%/40%/75%); avatars are circles of the avatar size; buttons keep the button size; images keep their aspect ratio.
- **Static parts render for real**: page title, toolbar, column headers, tabs and labels don't need skeletons; only the data does. This gives context immediately.
- **Use the project's `Skeleton` primitive** and its color token. If none exists, propose one: `animate-pulse rounded-md bg-muted` (or the system's subtle surface token). One shimmer/pulse style app-wide.
- **Reduced motion**: `motion-reduce:animate-none`.
- **Accessibility**: the region gets `aria-busy="true"`; skeleton blocks are `aria-hidden`; a visually hidden "Loading invoices…" status for screen readers if there's no other cue.
- **Avoid flashes**: for very fast responses, either delay showing the skeleton ~150–200ms, or keep it for a minimum ~300ms once shown - follow whichever pattern the codebase already uses; don't add both.
- **Next.js App Router**: `loading.tsx` for route-level, `<Suspense fallback={<XSkeleton/>}>` around slow server components so the shell renders first. Put the skeleton component next to the real one (`invoice-table.tsx` + `invoice-table-skeleton.tsx`).
- **Images**: reserve space with width/height or `aspect-ratio`; show the skeleton/blur until load.

## 3. Skeletons: where they're usually missing

Check every one of these in the surface:
- [ ] Route/page first load (`loading.tsx` or `isLoading` branch)
- [ ] Each independently-fetched panel, card, chart, stat
- [ ] Tables and lists (rows)
- [ ] Detail panels/sheets that fetch on open
- [ ] Dialogs that load data on open (edit forms prefilled from the API): skeleton the form fields, not a spinner over the dialog
- [ ] Dropdowns/comboboxes with async options: "Loading…" row in the menu
- [ ] Tabs whose content fetches on switch
- [ ] Avatars and images
- [ ] Dependent queries (second fetch after the first) - skeleton until both are done, or staged

Code smells: `if (isLoading) return null`, `if (!data) return <Spinner/>` for a whole page, `{data && …}` with nothing for the loading branch, `"Loading..."` text alone, reusing an old/legacy skeleton component on a redesigned UI (LDG-11).

## 4. Pending buttons and the oval-spinner bug

**Symptom:** after clicking Submit/Save/Delete, the spinner inside the button looks oval or egg-shaped, wobbles while spinning, or the button jumps in size.

**Causes and fixes:**

| Cause | Fix |
|---|---|
| Spinner icon is a flex child that shrinks (`flex-shrink: 1` default) when the label is long or the button is narrow → squashed width | `shrink-0` on the spinner |
| Only width or only height set; the other comes from line-height or the parent stretches it (`align-items: stretch`, `h-full`) | set both: `size-4` (or `h-4 w-4`) **and** `aspect-square`; parent `items-center` |
| Border-based spinner (`rounded-full border-2 border-t-transparent`) on an inline `<span>` → width/height ignored | `inline-block` (or `block`) + `size-4` |
| Button's `[&_svg]:size-*` or icon rules conflict with the spinner's own size (shadcn Button does this) | use the same size token the button applies to icons, or override deliberately with one class; don't fight it |
| `animate-spin` is on a wrapper that holds icon + text, or on the button itself → rotating a rectangle looks like an oval wobble | put `animate-spin` **only** on the square spinner element |
| SVG with non-square `viewBox`, or `preserveAspectRatio="none"`, or stroke clipped at the edge | square viewBox (`0 0 24 24`), keep default aspect ratio, enough inset for the stroke |
| `transform-origin` not centered (SVG `transform-box` issues, padding on the spinning element) | no padding/margin on the rotating element; `origin-center`; for SVG children `transform-box: fill-box` |
| Spinner also scaled/translated by another animation or class (`scale-*`, `translate-*`, hover transforms) | nothing else transforms the spinning element |
| Odd sizes on high-DPI (e.g. 13px) causing subpixel wobble | use an even token size (16/20px) |
| Button shrinks/grows because text swaps for spinner | keep the button size: stack label and spinner in the same grid cell (below) or keep the label and add the spinner beside it with a fixed `min-width` |

**Correct pending button pattern** (grid stacking keeps the width of the larger child, so nothing moves):
```tsx
<Button type="submit" disabled={pending} aria-busy={pending} aria-disabled={pending}
  className="grid [grid-template-areas:'stack']">
  <span className={cn('[grid-area:stack] inline-flex items-center gap-2', pending && 'invisible')}>
    Save changes
  </span>
  {pending && (
    <span className="[grid-area:stack] inline-flex items-center justify-center gap-2">
      <Spinner className="size-4" /> <span className="sr-only">Saving…</span>
    </span>
  )}
</Button>
```
Alternative when the label should change: keep the spinner **beside** the label ("⟳ Saving…"), spinner `shrink-0`, and give the button a `min-width` equal to the longer label so it doesn't jump.

Behaviour rules for every action button:
- Disabled while pending → no double submits. For forms, `useFormStatus().pending` (React 19 / Next server actions), `isSubmitting` (react-hook-form), `mutation.isPending` (TanStack).
- `aria-busy="true"` and a screen-reader text ("Saving…").
- Only the clicked button shows the spinner; sibling buttons (Cancel) are disabled but don't spin.
- In dialogs, the dialog can't be closed by backdrop/Esc while a destructive action is pending (or it cancels the request).
- On success: close/navigate/toast. On error: re-enable, show the error near the button, keep the user's input.
- Very fast actions: avoid a flash of spinner (show after ~150ms) if the project has a helper for it.

## 5. One shared Spinner and one loading Button

Inconsistent loaders (Loader2 here, a CSS ring there, "Loading..." text elsewhere, three sizes) are both a consistency bug and the usual source of the oval bug. Fix it once:

```tsx
// components/ui/spinner.tsx - the only spinner in the app
export function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"
      className={cn('size-4 shrink-0 aspect-square animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]', className)} {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
```
(If the project uses an icon library spinner like lucide `Loader2`, wrap it the same way: `size-* shrink-0 animate-spin`.)

Then give the project's Button a `loading` prop (or a `LoadingButton` wrapper) that applies the grid-stack pattern above, and replace every hand-made pending button in the surface with it. Propose this in the plan; if the Button is shared app-wide, list the other call sites that would benefit but only change the ones in scope unless approved.

## 6. Checklist

- [ ] Every data region has a skeleton that matches its final layout (no CLS when data arrives).
- [ ] Redesigned components have newly redesigned skeletons matching the new layout - no legacy/old skeletons reused (LDG-11).
- [ ] Skeleton count matches page size / visible rows; static parts render immediately.
- [ ] One Skeleton style and one Spinner component across the surface.
- [ ] Every action button: disabled + spinner + `aria-busy` while pending, no size change, no double submit.
- [ ] Spinners are perfectly round: square element, `shrink-0`, both dimensions set, `animate-spin` only on the spinner.
- [ ] List page changes keep previous data (no blank flash).
- [ ] `prefers-reduced-motion` respected.
- [ ] Error after loading is handled (not an infinite skeleton).
