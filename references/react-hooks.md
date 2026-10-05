# React hooks - common bugs and fixes

Rules map to HOOK-* in rule-catalog.md. Applies to React (and Next.js/Remix). For Vue/Svelte, check the equivalent (watchers without cleanup, reactive statements that loop, missing `onUnmounted` cleanup).

Always read the whole component before judging a hook: many "missing deps" are deliberate refs or stable setters.

## Contents
1. Effects
2. Data fetching in effects
3. State
4. Memoization and identity
5. Rules of hooks, keys, hydration
6. Audit procedure

## 1. Effects

**HOOK-02 - You might not need an effect.** Flag effects that:
- compute something from props/state and `setState` it → compute during render (`const total = items.reduce(…)`), or `useMemo` if expensive;
- react to a user event (`useEffect(() => { if (submitted) post() }, [submitted])`) → do it in the event handler;
- reset state when a prop changes → use a `key` on the component, or compare during render;
- notify the parent (`useEffect(() => onChange(value), [value])`) → call `onChange` in the handler that changed it;
- chain effects that set state that triggers the next effect.

**HOOK-01 - Dependencies.** Every value from the component used inside the effect must be in the deps array. `// eslint-disable-next-line react-hooks/exhaustive-deps` is a finding unless a comment explains why it's safe; the usual real fix is moving the function inside the effect, using a functional update, or a ref for "latest value" (or `useEffectEvent` where available).

**HOOK-04 - Cleanup.** Anything an effect starts, it stops:
```ts
useEffect(() => {
  const id = setInterval(tick, 1000);
  const onResize = () => …; window.addEventListener('resize', onResize);
  const ro = new ResizeObserver(…); ro.observe(el);
  const unsub = store.subscribe(…);
  return () => { clearInterval(id); window.removeEventListener('resize', onResize); ro.disconnect(); unsub(); };
}, []);
```
`addEventListener` with an inline arrow can't be removed - keep the reference.

**HOOK-08 - Loops.** Effect sets state that's in its own deps; deps include an object/array/function created during render (new identity each time) → infinite loop or a refetch every render. Fix: depend on primitives, memoize the object, or move it inside the effect.

**HOOK-13** - `useLayoutEffect` in server-rendered components warns and does nothing on the server; reading layout (`getBoundingClientRect`) during render forces reflow. Use `useLayoutEffect` only for measure-then-paint, client-only.

## 2. Data fetching in effects (HOOK-03)

Prefer the project's data library (TanStack Query, SWR, server components, loaders). If a raw fetch-in-effect stays, it needs: abort/ignore on cleanup, loading and error state, and no state update after unmount.

```ts
useEffect(() => {
  const controller = new AbortController();
  setStatus('loading');
  fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
    .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then((data) => { setData(data); setStatus('success'); })
    .catch((e) => { if (e.name !== 'AbortError') setStatus('error'); });
  return () => controller.abort();          // a newer q cancels the older request: no out-of-order results
}, [q]);
```
Symptoms of the bug: typing fast shows results for an old query; "Can't perform a React state update on an unmounted component"; flashes of wrong data when switching tabs/items.

Under React Strict Mode effects run twice in development - an effect that breaks when run twice is missing cleanup.

**HOOK-14 - Missing or stale identifiers.** A hook or component must never build a request path, cache key, `href`, or required id from a value that can be `undefined`/`null`. Two failure shapes share one root cause (a value used before it is known to exist):

1. **Literal `undefined`/`null` in a request.** A template literal or `encodeURIComponent(id)` inside `fetch`/`apiFetch`/`loadApiData`/a `useQuery` `queryKey`/a `useSWR` key/`href` runs before `id` is present, so the app requests a path such as `/api/items/undefined` (a real 400/404 at the server, and noise that hides the real bug).
2. **Stale async component.** A component held in state (a dynamically imported view, a preview, a pane) is rendered against a **new** key or prop before its state has caught up, so it mounts with the previous data or with no id at all. Shape 1 is usually how shape 2 surfaces.

```ts
// ✘ requests /api/items/undefined when id is missing
useEffect(() => { fetch(`/api/items/${encodeURIComponent(id)}`); }, [id]);

// ✔ guard at the boundary; never interpolate a value that can be missing
useEffect(() => {
  if (!id || id === 'undefined' || id === 'null') return;
  const controller = new AbortController();
  fetch(`/api/items/${encodeURIComponent(id)}`, { signal: controller.signal }) /* … */
  return () => controller.abort();
}, [id]);
```
```ts
// ✘ the component in state is stale for one render after the key changes,
//    so it mounts with the wrong (or no) id
if (ViewComponent) return <ViewComponent id={currentId} />;

// ✔ gate rendering on the key the component was actually loaded for
if (loading || !ViewComponent || loadedKey !== currentKey) return <Skeleton />;
return <ViewComponent key={currentKey} id={currentKey} />;
```

Signals to look for: a URL or network log containing an `undefined`/`null` segment; `encodeURIComponent(x)` or `` `${x}` `` where `x` is a prop, a `searchParam`, or an optional field; a hook called with an id the caller can leave out; an async-loaded component stored in state with no `loadedKey === currentKey` check; React Query/SWR keys that omit the id or never set `enabled: Boolean(id)`.

Fix: guard before the request and treat the literal `'undefined'`/`'null'` as absent at the boundary; early-return or set `enabled` on the id; and pair every async-loaded component with the key it was loaded for (or `key={id}` to reset it). Dynamic by design: it applies to any id, route, key, or href, not one specific endpoint.

## 3. State

- **HOOK-05 Stale closures**: intervals, timeouts, event listeners and async callbacks that read state captured at creation. Use functional updates (`setCount(c => c + 1)`), a ref holding the latest value, or include the value in deps.
- **HOOK-06 Props copied into state**: `const [name, setName] = useState(props.name)` won't update when the prop changes. Either use the prop directly, reset with `key`, or make it explicitly "initial" (`initialName`). Syncing with `useEffect(() => setName(props.name), [props.name])` causes an extra render and flicker - avoid.
- Redundant state: storing something derivable (e.g. `filteredItems` alongside `items` + `query`) → derive it.
- Multiple related `useState`s updated together that can get out of sync → one object/`useReducer`, or a status enum instead of `isLoading` + `isError` + `isSuccess` booleans.
- Mutating state objects/arrays in place (`items.push(x); setItems(items)`) → no re-render. Always new references.

## 4. Memoization and identity

- **HOOK-09**: `useMemo`/`useCallback` with missing deps return stale values; with deps that change every render they do nothing. Don't add them everywhere; add them where identity matters (deps of other hooks, memoized children, context values) or computation is expensive. If the project uses the React Compiler, don't add manual memoization.
- **HOOK-12**: `<Ctx.Provider value={{ user, setUser }}>` creates a new object every render → every consumer re-renders. Memoize the value or split contexts.
- **PERF-04**: inline objects/functions passed to memoized list rows defeat the memo.

## 5. Rules of hooks, keys, hydration

- **HOOK-07**: hooks inside `if`, loops, after an early `return`, or in non-component functions. Common in refactors: `if (!data) return <Skeleton/>` placed above a `useState` → crash when data arrives. Move all hooks above early returns.
- **HOOK-10 Keys**: `key={index}` on lists that can be reordered, filtered, inserted into or deleted from → inputs and state stick to the wrong row. Use a stable id. Never `key={Math.random()}` (remounts every render).
- **HOOK-11 Hydration**: rendering `new Date()`, `Math.random()`, `window`/`localStorage` values, or locale-dependent formatting during SSR → mismatch. Render on the client after mount (`useEffect` + state, or `useSyncExternalStore`), or pass the value from the server. `suppressHydrationWarning` only on the exact element with a known benign difference (e.g. a timestamp).
- `"use client"` boundaries: hooks used in a file without `"use client"` in the App Router is a build error; adding `"use client"` high up turns a whole server tree into client code - put it on the smallest interactive leaf.

## 6. Audit procedure

For each component in the inventory, list its hooks and check them:

```
Component: InvoiceTable (components/invoices/invoice-table.tsx)
useState: page(42) sort(43) selected(44) - derived state? props copied?
useEffect @51: deps [q] ✔ cleanup ✘ (fetch, no abort) → HOOK-03
useEffect @70: sets total from items → HOOK-02 (derive in render)
useMemo @88: deps ✔
Keys: rows key={row.id} ✔
Early returns before hooks: ✘ none
```
Every ✘ becomes a finding in `03-findings.md` with the code quoted as evidence.
