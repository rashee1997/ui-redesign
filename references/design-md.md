# Reading the project's DESIGN.md

The project's DESIGN.md is written by the user, for this project. It has **no fixed format**: it may be YAML tokens, prose, tables, bullet rules, screenshots, links to other files, or a mix. Don't expect particular headings or token names, and don't reshape it to fit a template. Read it as the project's own law and extract what it says.

## Precedence (applies to the whole skill)

1. **The user's current instructions** in the chat.
2. **The project's DESIGN.md** (and any files it links to or imports).
3. **The existing code's conventions** - tokens, primitives, and how the good pages do things.
4. **This skill's reference guides** - fallback defaults only, for questions 2 and 3 don't answer.

Every number and rule in the other reference files (breakpoints, spacing, widths, font sizes, button order, banned styles, copy rules) is a **default**. If DESIGN.md sets its own value or rule for the same thing, use DESIGN.md's and don't mention the default. If DESIGN.md deliberately asks for something craft.md §1 bans (all-caps labels, gradients, a centered layout), follow DESIGN.md.

## 1. Find it

```bash
find . -iname 'design.md' -not -path '*/node_modules/*' -not -path '*/.git/*'
```

Check the repo root, `docs/`, `.design/`, app/package folders in a monorepo (each package may have its own - use the one closest to the page you're redesigning, falling back to the root one). Also look for design sections in `CLAUDE.md`, `AGENTS.md`, `PRODUCT.md`, `.cursor/rules`, `style-guide.md`, `design-system.md`. If DESIGN.md links or `@imports` other files (token files, component docs, voice guides), read those too.

Read the whole file. Don't skim to the parts you expect; project-specific rules often sit in unexpected sections.

## 2. Extract a rules digest

Build a **DESIGN.md digest** in your notes (it goes into section 2 of the plan). Organize it by *topic*, not by the file's headings, and cite where each rule came from, so the user can check you read it right:

| Topic | What to capture | Example entry |
|---|---|---|
| Personality & density | tone, how airy or dense, what it should feel like | "Calm, dense, data-first (§Principles)" |
| Colors | each color and its **role**, dark mode rules | "`accent` only for primary CTA (§Color)" |
| Typography | fonts, scale, which style for which role, casing rules | "Page titles `text-xl` semibold, never larger (§Type)" |
| Spacing & layout | scale, max widths, grid, page padding, breakpoints | "Content max 1200px; gutters 16/24/32 (§Layout)" |
| Responsive rules | breakpoints, mobile patterns, what collapses | "Tables become lists under md (§Responsive)" |
| Components | which primitives, variants, when to use each, states | "Use `Sheet` not `Dialog` for edit forms (§Components)" |
| Surfaces & depth | cards, borders, shadows, radii - when each is used | "No shadows; separate with borders (§Elevation)" |
| Motion | durations, easing, what may animate | |
| Icons & imagery | set, sizes, when icons appear | |
| Copy & voice | tone, casing, terminology, words to use/avoid | "Say 'workspace', never 'project' (§Voice)" |
| Accessibility | contrast, target sizes, focus style | |
| Explicit do's / don'ts | every hard rule, copied closely | |
| Gaps | topics the file doesn't cover | "No rule on dialog sizes → use skill default" |

Keep the file's own names for tokens and components. If the file uses words like "must/never/always", keep that strength.

The **Gaps** row matters: it tells you exactly where the skill's defaults are allowed to fill in. List the defaults you'll use there in the plan, so the user can overrule them.

## 3. Map rules to code

For each token or component rule, find how it's implemented: CSS variables, `@theme` (Tailwind v4), `tailwind.config.*`, theme objects (MUI/Chakra/Mantine), shadcn `components.json` + `globals.css`, a `components/ui` folder. Record the code name you'll actually write (`bg-accent`, `var(--space-4)`, `<Button variant="ghost">`) **plus its exact literal value copied character-for-character** (`#ffffff`, `16px`, `rounded-lg`). This name-plus-value ledger is what concepts and implementation may use; anything absent from it is banned. Use code names in the implementation, never raw values copied from the doc.

If DESIGN.md describes something the code doesn't have yet (a token, a variant), note it; implementing it goes in the plan as a proposed change.

## 4. Conflicts

- **DESIGN.md vs code** (doc says 8px radius, components use 12px): don't pick silently. List it in the plan's "Conflicts" and ask which wins. Until answered, follow DESIGN.md for anything new you build.
- **DESIGN.md vs this skill's guides**: DESIGN.md wins. No need to ask.
- **DESIGN.md is ambiguous or contradicts itself**: quote both parts in the plan and ask.
- **DESIGN.md is out of date** (refers to components that no longer exist): say so in the plan; follow the current code for those parts.

Never edit DESIGN.md without the user's approval. If the redesign establishes a new pattern worth recording, propose the addition in the plan (exact text to add, and where).

## 5. When there is no DESIGN.md

Derive the language from the code instead, and say so in the plan:

1. Tokens: CSS variables, `@theme`, Tailwind config, theme objects, `components/ui`.
2. Real usage - the most-used classes show the actual scale:
   ```bash
   grep -rhoE '\b(text|gap|p[xy]?|m[xy]?|rounded|max-w)-[a-z0-9.\[\]/]+' src app components 2>/dev/null | sort | uniq -c | sort -rn | head -40
   ```
3. 2–3 good-looking existing pages: page header shape, primary button variant, cards vs plain sections, table style, dialog style.

Write this as a short "Derived design language" in the plan (same topics as the digest). After the redesign, offer to save it as a DESIGN.md - don't create one unasked.

## Reference: the public DESIGN.md spec

Some projects follow Google's open DESIGN.md spec (google-labs-code/design.md): YAML frontmatter with `colors`, `typography`, `rounded`, `spacing`, `components` tokens (references written like `{colors.primary}`), then sections Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts. If the project's file looks like that, the YAML values are exact tokens and the prose explains when to use them. If it doesn't, that's fine; the digest method above works on any format.
