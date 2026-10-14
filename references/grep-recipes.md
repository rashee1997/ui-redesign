# Grep recipes (candidate finders)

Defaults only. Grep never proves a rule is satisfied or violated: every hit must be opened and read in context, and only then does it become a finding (harness.md §3). Companion to `static-audit.md`.

## Contents
1. Recipes by area
2. Fallbacks

## 1. Recipes by area

Run scoped to the inventory folders.

```bash
P="app/(dash)/invoices components/invoices server/invoices"   # the surface

# Hooks
rg -n "useEffect\(|useLayoutEffect\(" $P
rg -n "eslint-disable.*(react-hooks|exhaustive-deps)" $P
rg -n "useState\(\s*props\.|useState\([a-z]+\)\s*;?\s*$" $P
rg -n "setInterval|setTimeout|addEventListener|subscribe\(" $P        # cleanup?
rg -nU "useEffect\([^)]*\{[^}]*fetch\(" $P                              # fetch in effect: race/abort?

# Missing/stale identifiers in request paths, cache keys, hrefs (HOOK-14). Dynamic:
# scope to the surface; it finds any id-driven URL or key, not one endpoint.
rg -nU "(fetch|apiFetch|loadApiData|queryKey|useSWR|href)[^\n]*[\`'\"][^\`'\"]*\\\$\{" $P   # interpolated URL/key/href
rg -n "encodeURIComponent\(\s*[A-Za-z_$][\w$.?]*\s*\)" $P                # is the arg guaranteed non-null?
rg -n "useQuery\(\{|queryKey\s*:" $P                                    # id in the key? enabled: Boolean(id)?
rg -n "set[A-Z]\w*(Component|View|Panel|Preview)\b|LoadedKey|loadedKey" $P  # async component held in state
rg -ni "(undefined|null)" $P | rg -i "api|fetch|href|url|key|path"      # candidate: literal undefined in a request

# Mutations & errors
rg -n "useMutation|mutate\(|mutateAsync|useActionState|useFormState|useFormStatus|useOptimistic|'use server'|\"use server\"" $P
rg -n "method:\s*['\"](POST|PUT|PATCH|DELETE)" $P
rg -n "catch\s*\(\s*\w*\s*\)\s*\{\s*(console\.\w+\([^)]*\);?)?\s*\}" $P   # swallowed errors
rg -n "\.catch\(\s*\(\)\s*=>\s*\{\s*\}\s*\)|catch\s*\{\s*\}" $P
rg -n "invalidateQueries|revalidatePath|revalidateTag|router\.refresh|mutate\(\s*['\"/]" $P
rg -n "alert\(|confirm\(" $P                                             # native dialogs

# Forms
rg -n "<input|<Input|<textarea|<Textarea|<select|<Select" $P
rg -n "placeholder=" $P
rg -n "onPaste|autoFocus|noValidate|aria-invalid|aria-describedby" $P
rg -n "preventDefault\(\)" $P | rg -i "paste"                               # blocked paste (FRM-15)
rg -n "autoFocus\b" $P                                                      # unconditional autoFocus (FRM-17)
rg -n "safe-area-inset|overscroll-contain|touch-manipulation" $P            # mobile viewport & containment (RSP-14, RSP-15, DLG-10)
rg -n "sr-only\b|absolute\b" $P                                             # uncontained absolute/sr-only scroll leaks (LAY-11)
rg -n "type=[\"']number[\"']" $P | rg -v "onWheel"                            # unhandled number wheel step (FRM-19)
rg -n "toISOString\(\)" $P                                                    # potential UTC day-shift on date pickers (FRM-21)
rg -n "maxLength=" $P                                                         # silent character limit cutoff (FRM-22)
rg -n "type=[\"']password[\"']" $P                                            # password visibility toggle (FRM-23)

# Tables & data grids (TAB)
rg -n "<table|<Table|<thead|<tbody|<th\b|<td\b" $P
rg -n "sticky.*top-0" $P | rg -v "bg-"                                        # transparent sticky headers (TAB-02)
rg -n "group-hover:(opacity-100|flex|inline-flex|block)" $P                   # hover-only row actions (TAB-04)
rg -n "aria-sort" $P                                                          # sort indicators (TAB-07)

# File uploads (UPL)
rg -n "type=[\"']file[\"']" $P
rg -n "onDrop|onDragOver" $P
rg -n "createObjectURL" $P | rg -v "revokeObjectURL"                          # unrevoked object URLs (UPL-03)

# Toasts & notifications (NOT)
rg -n "toast\.(success|error|info|warning|custom)" $P
rg -n "toast\.error.*duration:\s*[1-9]\d{2,3}\b" $P                           # vanishing error toasts <10s (NOT-01)
rg -n "forEach.*toast\." $P                                                   # toast storm on batch operations (NOT-03)

# User flow & transitions (FLW-01..04)
rg -n "setStep|setCurrentStep|activeStep|handleNext|onNext|goToStep" $P        # stepper transitions: gated by validation (FLW-02)?
rg -n "\.then\(\s*\(\)\s*=>\s*(next|setStep|router\.(push|replace))" $P        # advance with no error branch (FLW-04)
rg -n "Step \d+ of \d+|stepper|wizard|aria-current=\"step\"" $P                # position signposting (FLW-01)

# Dialogs, overlays & search (DLG-11..14, NAV-06..08, NAV-11..12)
rg -n "scrollbar-gutter" $P                                                   # modal scroll-lock layout shift (DLG-11)
rg -n "z-\[\d+\]|z-50|z-40|z-30" $P                                          # z-index layering conflicts (DLG-12)
rg -n "<Tooltip|<TooltipContent" $P                                           # tooltip tautology & hover traps (DLG-13, DLG-14)
rg -n "useDebounce|useQuery.*search|abortController" $P                       # search race conditions & cancellation (NAV-06)
rg -n "cmdk|CommandDialog|CommandInput|use-shortcut|aria-activedescendant" $P # palette states & discoverability (NAV-11, NAV-12)

# AI chat & streaming (AI-01..06)
rg -n "useChat|streamText|stop\(\)|isStreaming|isLoading.*ai" $P               # stream state + stop control (AI-01)
rg -n "sources|citations|references" $P | rg -v "^\s*//"                      # source drill-down present? (AI-02)
rg -n "can make mistakes|may (hallucinate|be (wrong|inaccurate))" $P          # generic disclaimer only? needs contextual uncertainty (AI-03)

# Loading / states
rg -n "isLoading|isPending|isFetching|status ===|loading\b" $P
rg -n "return null|Loading\.\.\.|Loading…" $P
rg -n "length\s*===\s*0|\.length\s*\?|!data\b" $P

# Aggregate vs list parity (PAG-11, PAG-12, PAG-13) - dynamic: resolve the names per surface
rg -n "COUNT\(\*\)|count\(\{|groupBy|FILTER\s*\(WHERE" $P          # every aggregate over the listed entity
rg -n "not:|notIn:|NOT IN|!=='|!=\"|status.*obsolete|is_deleted|deleted_at|archived" $P  # exclusion filters: present in list query but missing in aggregate (or vice versa)?
rg -n "z\.enum\(|as const\]|UNION.*status|CHECK.*status" $P        # the status enum: every value must land in one breakdown bucket + one filter option
rg -n "byStatus|byDepartment|breakdown|split|statusCounts" $P     # breakdowns: add the parts, compare with the stated total
rg -n "\.set\(|cache.*set|CACHE_KEY|ex:\s*[0-9]" $P               # server cache writes holding derived counts
rg -n "\.del\(|invalidate|bump|version.*cache" $P                 # cache invalidation: every set above needs a del on each mutation path (MUT-12)

# Layout & hero stability (LAY-13..15, LAY-17)
rg -n "h-screen|100vh|w-\[\d|min-w-\[\d|h-\[\d" $P
rg -n "min-h-screen|min-h-\[100dvh\]" $P                                       # hero viewport overflow (LAY-14)
rg -n "col-span-2.*row-span-2|grid-flow-dense" $P                              # bento voids & dense flow (LAY-17)

# Anti-slop & copy hygiene (CPY-10..12, SLOP-01..12)
rg -n "#[0-9a-fA-F]{3,8}\b|-\[[^\]]+\]" $P                              # raw values (SLOP-01)
rg -n "font-family|Inter\b|sans-serif\b" $P                              # single/default font, no pairing (SLOP-06)
rg -n "dicebear|multiavatar|avataaars|unsplash|\bstock\b|placeholder" $P # AI/placeholder people as content (SLOP-07)
rg -n "bg-gradient|from-(purple|violet|indigo)|shadow-\w+/\d+" $P
rg -n "tracking-widest|uppercase.*tracking" $P                                # eyebrow pill spam (SLOP-08)
rg -n "rounded-full\s+size-[23]\s+bg-(green|emerald|amber)-" $P               # decorative status dots (SLOP-12)
rg -n "key=\{(i|index|idx)\}" $P
rg -n "toLocaleDateString|toFixed\(|new Date\(.*\)\.to" $P
rg -n "[\"'][^\"']*\"[^\"']*[\"']" $P                                      # straight quotes in strings (CPY-08)
rg -n "\d+\s+(MB|GB|KB|px|rem|%|items|records|documents)\b" $P              # missing non-breaking spaces before units (CPY-09)
rg -n "—|–|--\s" $P                                                           # em-dash / en-dash / double-hyphen ban (CPY-10)
rg -ni "(SECTION\s*0[1-9]|STEP\s*0[1-9]|0[1-9]\s*//|0[1-9]\s*/)" $P           # artificial meta-numbering (CPY-11)
rg -n "·|&middot;|&#183;" $P                                                  # middle-dot rationing (CPY-12)
rg -n "translate=[\"']no[\"']|notranslate" $P                              # untranslated system tokens/IDs (I18N-06)

# Accessibility & assistive tech (accessibility.md)
rg -n "onClick" $P | rg -v "<(button|Button|a |Link|DropdownMenuItem|MenuItem)"  # div/span as button (A11Y-01)
rg -n "<(button|Button)[^>]*>\s*<svg" $P                                          # icon-only button: has aria-label? (A11Y-02)
rg -n "outline-none|outline:\s*none|outline-0" $P | rg -v "focus-visible:"       # focus killed without replacement (A11Y-03)
rg -n "tabIndex=\{?[1-9]" $P                                                     # positive tabIndex (A11Y-15)
rg -n "aria-hidden=[\"']true[\"'][^>]*<(button|a|input|select)" $P               # aria-hidden on interactive (A11Y-16)
rg -n "<(button|Button)[^>]*<button|<a[^>]*<a" $P                                 # nested interactives (A11Y-17)
rg -n "role=[\"'](button|link)[\"']" $P                                          # manual roles instead of native elements
rg -n "<img|<Image" $P | rg -v "alt="                                            # missing image alt (A11Y-08)
rg -n "user-scalable\s*=\s*no|maximum-scale\s*=\s*1" $P                         # zoom disabled (A11Y-10)
rg -n "onPaste.*preventDefault" $P                                                # blocked paste / cognitive auth (A11Y-20, FRM-15)

# Motion & micro-interactions (motion.md)
rg -n "transition-all|transition:\s*all" $P                              # layout thrashing risk (MOT-02)
rg -n "animate-bounce|animate-pulse" $P                                  # distracting/slop animation (MOT-04)
rg -n "duration-\[?[3-9]\d{2,}\]?" $P                                   # sluggish >250ms transitions (MOT-09)
rg -n "<(button|Button)" $P | rg -v "active:"                           # missing press micro-feedback (MOT-06)
rg -n "(animate-|transition)" $P | rg -v "motion-reduce:"               # missing reduced motion fallback (MOT-01)
rg -n "addEventListener\(['\"]scroll['\"]" $P                                  # raw scroll listener in state (MOT-12)
rg -n "<Marquee|animate-marquee" $P                                            # marquee count & overflow (MOT-13)
rg -n "ScrollTrigger\.create" $P                                               # pinned scroll distance & cleanup (MOT-14)

# Duplicate actions & shared form sprawl (HIE-08, CON-06, CON-07)
rg -n "type=[\"']submit[\"']" $P                                        # multiple submit buttons on same view? (HIE-08)
rg -n "useForm\b|z\.object\(" $P                                         # duplicate form definitions across routes? (CON-06, CON-07)
# Shared-primitive reuse vs one-off variants (CON-01, CON-02, CON-07)
rg -n "components/ui/" $P                                                # shared primitives; one-off variants are candidates

# Hierarchy & depth (HIE-09..HIE-15)
rg -n "shadow-(lg|xl|2xl)" $P                                                # shadow soup instead of surface luminance (HIE-12)
rg -n "text-\[\d+px\]" $P                                                    # arbitrary unscaled font sizes (HIE-11)

# Soulful craft & tactile finish (SOUL-01..SOUL-14)
rg -n "rounded-[a-z0-9]+" $P                                                 # check nested radii for concentricity: R_inner = R_outer - P (SOUL-02)
rg -n "<(Play|Chevron|Arrow)" $P                                             # check optical alignment compensation on directional icons (SOUL-03)
rg -n "italic.*font-serif|<em\b" $P                                            # italic descender clipping check (SOUL-12)
rg -n "<(Button|button)[^>]*class.*(w-full|flex-1)" $P                         # desktop CTA wrap candidates (SOUL-11)

# Dynamic item binding & form button safety (CON-08, FRM-18, PAG-14, MUT-13)
rg -n "<(button|Button)[^>]*" $P | rg -v "type="                            # button inside form without explicit type="button"? (FRM-18)
rg -n "items\[0\]|versions\[0\]|approvals\[0\]|currentVersion" $P           # static/hardcoded item props in master-detail/workbench? (CON-08)
rg -n "includeObsolete|is_obsolete|status.*obsolete" $P                     # archive query: does it incorrectly filter is_current/is_active? (PAG-14)
rg -n "invalidateQueries" $P                                                # mutation invalidation: does it miss audit-logs or child telemetry? (MUT-13)

# Platform rules (platform-quality.md §4; STA-12, ERR-11, FRM-25, A11Y-21, MOT-15, PERF-08, PERF-09)
rg -n "invalid:|:invalid\b" $P | rg -v "user-invalid|aria-invalid"           # error styling on pristine fields (FRM-25)
rg -n "forced-colors|forced-color-adjust" $P                                  # forced-colors handled anywhere? (A11Y-21)
rg -n "focus(-visible)?:ring|ring-\d|shadow-" $P | rg -v "outline|border"     # focus/boundary drawn only with box-shadow (A11Y-21)
rg -n "startViewTransition|view-transition-name" $P                           # guarded + reduced-motion branch? (MOT-15)
rg -n "loading=\"lazy\"|<Image\b" $P                                          # first/hero image lazy or no priority (PERF-08)
rg -n "fetchpriority|priority\b" $P                                           # present on the LCP image? (PERF-08)
rg -ln "^[\"']use client[\"']" $P | rg "(page|layout)\.(t|j)sx$"              # directive at route/layout level (PERF-09)
rg -n "status\s*(===|==)\s*(403|429)|Retry-After|retry-after|Forbidden" $P    # 403 / 429 handled with a message and a way forward? (STA-12, ERR-11)
```

## 2. Fallbacks

If `rg` isn't installed, use `grep -rnE` with the same patterns.

If the project has lint rules for these (eslint-plugin-react-hooks, jsx-a11y), run the linter on the surface files too and treat its output as candidates - but don't "fix" by adding `eslint-disable`.
