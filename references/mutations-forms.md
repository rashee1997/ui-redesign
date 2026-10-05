# Mutations, forms and error handling

> **Defaults only.** Use the project's existing data library (TanStack Query, SWR, RTK Query, server actions, tRPC), form library (react-hook-form, Conform, TanStack Form, Formik) and validator (zod, valibot…). Match how the best existing form in the app already does it; don't introduce a new library.

Rules map to MUT-*, FRM-*, ERR-* in rule-catalog.md.

## Contents
1. Mutations
2. Forms and validation
3. Error handling
4. Audit procedure for one mutation

## 1. Mutations

Every write (create, update, delete, invite, upload, export, toggle) must have all of these:

| Need | What it looks like |
|---|---|
| **Pending** (MUT-01, LDG-05) | Button disabled + round spinner + `aria-busy`, size unchanged. The handler also guards: `if (isPending) return`. |
| **Error shown** (MUT-02, MUT-08) | Check the result: `if (!res.ok)`, `result.error`, `onError`. Show the message near the action (field errors on fields; otherwise inline alert or toast with what failed + retry). Never only `console.error`. |
| **Success feedback** (MUT-03) | Say what happened: "Invoice sent to jane@acme.com". Offer Undo where possible instead of a confirm. |
| **Fresh data after** (MUT-04) | Everything showing the changed data is refreshed: `invalidateQueries` on the right keys (list *and* detail *and* counts), `revalidatePath`/`revalidateTag`/`router.refresh()` for server components, `mutate(key)` in SWR, or `setQueryData` with the server response. |
| **Server caches cleared** (MUT-12) | Every server-side cache key holding derived counts or summaries over the mutated entity (Redis/API-response caches, cached aggregate payloads) is deleted or bumped in the same mutation path — not just the client queries. A cached total with a TTL and no invalidation keeps showing the old number after a delete. |
| **Destructive safety** (MUT-07) | Confirm dialog naming the consequence, or an undo window. |
| **Lifecycle order** (MUT-09) | Close dialog / navigate / reset form **after** success, not before. On error, keep the dialog open with the input intact. |
| **Races** (MUT-10) | Ignore or abort responses that arrive after the component unmounted or the inputs changed. |

**Optimistic updates (MUT-05, MUT-06)** - only for quick, likely-to-succeed actions (toggle, rename, reorder, like):
```ts
useMutation({
  mutationKey: ['todos'],
  mutationFn: updateTodo,
  onMutate: async (next) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });          // stop in-flight refetches overwriting us
    const previous = queryClient.getQueryData(['todos']);
    queryClient.setQueryData(['todos'], (old) => apply(old, next));
    return { previous };
  },
  onError: (_e, _next, ctx) => queryClient.setQueryData(['todos'], ctx?.previous), // roll back
  onSettled: () => {
    if (queryClient.isMutating({ mutationKey: ['todos'] }) === 1)       // only the last one invalidates
      queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```
React 19: `useOptimistic` inside a transition/action rolls back automatically when the action ends; still surface the error.

**Server actions (Next.js)**: return a typed result (`{ ok: true, data } | { ok: false, fieldErrors, formError }`) rather than throwing for expected failures; read it with `useActionState`; pending from `useFormStatus` (inside the form) or the action state's `isPending`; call `revalidatePath`/`revalidateTag` in the action after a successful write; validate input on the server with the same schema as the client.

**Consistency (MUT-11)**: one way to call the API in the surface (the project's hook/client), one toast helper, one error-to-message mapper.

## 2. Forms and validation

**Fields**
- Visible `<label>` linked by `htmlFor`/`id` (or the form library's `FormLabel`). Placeholders show an example or nothing.
- Correct `type` (`email`, `tel`, `url`, `number` only for real numbers - not IDs, cards or phone), `inputmode`, `autocomplete`, meaningful `name`; `spellCheck={false}` for emails, codes, usernames (`FRM-02`).
- **Never block paste (`FRM-15`)**: Do not intercept `onPaste` with `e.preventDefault()` on verification codes, passwords, API tokens, or IDs. Users rely on password managers and clipboard access.
- **Checkbox and radio hit targets (`FRM-16`)**: Label and input control must share a continuous single hit area (wrap in `<label className="flex items-center gap-2 cursor-pointer select-none">` or use Radix/shadcn compound components) with no unclickable gap or dead zone between the box/radio circle and the label text.
- **Restrained autoFocus (`FRM-17`)**: Avoid unconditional `autoFocus` on form inputs. On mobile viewports and dialog mounts, automatic focus causes abrupt viewport zoom shifts, keyboard layout pops, and hides instructional copy. If used, limit to desktop-only single-input modals or explicit search trigger flows.
- Trim string values on submit.
- 16px input text minimum on mobile viewports (`RSP-13`) to prevent iOS auto-zoom.
**Validation timing** (FRM-05)
- Don't show errors while the user is typing a field for the first time. Validate on blur (if the value changed) and on submit; after a field has shown an error, re-validate it live so the error clears as soon as it's fixed.
- Don't disable submit until valid - let the user submit and show what's missing. Disable only while the request is pending.
- Same schema on client and server (FRM-11); the server is the source of truth.

**Errors** (FRM-03, FRM-04, FRM-06)
- Inline under the field, with an icon or text (not color only); field gets `aria-invalid="true"` and `aria-describedby` pointing at the error (and hint) ids.
- On submit with errors: move focus to the first invalid field. For long forms, show an error summary at the top (`role="alert"`) linking to each field, and focus the summary.
- Server errors map back to fields (`setError(name, …)` in react-hook-form, `fieldErrors` from the action). Non-field errors go in a form-level alert near the submit button.
- Error text says what's wrong and how to fix it (ux-copy.md).

**Preserving work** (FRM-07, FRM-08)
- Keep all input on error. Don't reset until success.
- Long or multi-step forms: warn on navigation/close with unsaved changes (router guard / `beforeunload` / dialog `onOpenChange` interception). Consider draft persistence for very long forms.

**Submission & actions (HIE-08, FRM-09)**
- Enter submits single-line forms; ⌘/Ctrl+Enter in textareas where that's the convention. Submit button is `type="submit"`; other buttons are `type="button"` (a common bug: a "Cancel" or icon button inside a form submits it).
- **Single submit action (HIE-08)**: Exactly one submit button per form. Never duplicate "Save" at top and bottom of a short form. On long multi-screen forms, use a scroll-aware sticky footer bar that activates only when the form action scrolls out of view.
- Buttons provide instant active/press micro-feedback (`active:scale-[0.98]`, motion.md §2A).
- Required/optional marked one consistent way (mark the minority).

**Controlled inputs** (FRM-13): `value` always paired with `onChange` (or use `defaultValue`); no heavy work per keystroke; debounce search.

**Shared create & edit forms (FRM-14, CON-06)**
- Never duplicate a form across `/new` and `/[id]/edit` routes with separate schemas and copied JSX.
- Extract a single reusable `<EntityForm mode="create" | "edit" initialData={data} onSubmit={handleSubmit} layout="page" | "dialog" />`.
- Share the Zod schema (`entitySchema`) and form hook (`useForm({ resolver: zodResolver(entitySchema), defaultValues: initialData ?? defaultValues })`).
- Toggle button label ("Create [Entity]" vs "Save changes") and conditionally render edit-only audit/status fields based on `mode`.

## 3. Error handling

Map failures to what the user can do (ERR-03):

| Failure | Show |
|---|---|
| 400/422 validation | field errors (above) |
| 401 | session expired → sign in again (keep their input if possible) |
| 403 | "You don't have permission to …" + who to ask; hide/disable the action next time (STA-04) |
| 404 | not-found state for that item, link back |
| 409 conflict | "This was changed by someone else" + reload/compare |
| 413 / limits | the limit and what to do ("Max 25 MB. Try a smaller file.") |
| 429 | "Too many attempts. Try again in a minute." |
| 5xx / network / timeout | what failed + "Try again" button; keep data already on screen |
| offline | say it's offline; retry when back |

Rules:
- Never show raw messages, codes or stack traces (ERR-01). Log details, show human text.
- Every retryable failure gets a retry action (ERR-04). No infinite spinners: requests need timeouts or error branches (ERR-07).
- Announce errors: `role="alert"` for blocking errors, `aria-live="polite"` for toasts/status (ERR-05).
- Route-level: `error.tsx` / error boundary with a retry (`reset()`), local boundaries around independent widgets so one failure doesn't blank the page (STA-08).
- `try { … } catch { }` with nothing in the catch, `.catch(() => {})`, and `catch (e) { console.error(e) }` with no UI are always findings unless a comment proves the failure is intentionally ignored.

## 4. Audit procedure for one mutation

For each write found in the surface, fill one block in your notes and turn gaps into findings:

```
Mutation: <name>  trigger: <file:line>  handler: <file:line>  API: <route/action file:line>
Pending UI:        ✔/✘ (how)            Double-submit guard: ✔/✘
Error shown:       ✔/✘ (where)          Response checked: ✔/✘
Field errors map:  ✔/✘/n.a.             Input kept on error: ✔/✘
Success feedback:  ✔/✘                  Refreshes: <list of queries/paths> - missing: <…>
Optimistic:        none / with rollback / without rollback
Destructive:       n.a. / confirm / undo / none
Closes/resets:     after success ✔/✘    Race-safe: ✔/✘
Server validates:  ✔/✘ (schema shared?)
```
