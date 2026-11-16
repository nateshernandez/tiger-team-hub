# Tiger Team Hub

A hub of artifacts the team uses to plan and build agents into our platform.
Code here is read far more than it's written, so every choice favors the
reviewer. A file should be understood in one pass, top to bottom.

**Stack:** Vite 8, React 19 (React Compiler on), TypeScript 6 (strict),
TanStack Router (file-based), TanStack Query, Zod, Tailwind 4, shadcn/ui
(Base UI), Vitest, Testing Library.

## Commands

| Command         | What it does                                                       |
| --------------- | ------------------------------------------------------------------ |
| `pnpm dev`      | Start the dev server                                               |
| `pnpm check`    | **Definition of done.** Typecheck, lint, format, knip, test, build |
| `pnpm lint:fix` | Autofix lint issues                                                |
| `pnpm format`   | Format everything with Prettier                                    |
| `pnpm test`     | Run tests once (`pnpm test:watch` to watch)                        |
| `pnpm knip`     | Find unused files, exports and dependencies                        |

Work isn't done until `pnpm check` passes. CI runs the same command.

## Architecture

```
src/
  app/                 # Composition root: entry, providers, router, routes
    routes/            # TanStack Router file routes (thin: wire a page, nothing else)
    route-tree.gen.ts  # Generated. Never edit
  features/<feature>/  # Everything for one feature
    components/  hooks/  api/  lib/  types.ts
  components/          # Shared app components
    ui/                # shadcn output. Never hand-edit
  hooks/  lib/  types/ # Shared, feature-agnostic code
  test/                # Test setup
```

**Dependencies flow one way: shared → features → app.**

- `shared` (`components`, `hooks`, `lib`, `types`) imports only shared.
- A feature imports shared and itself. **Features never import other features.**
  If two features need the same thing, move it to shared.
- `app` imports anything. It's where features get composed.
- `eslint-plugin-boundaries` enforces this. A wrong-way import is a lint error.

**Where does a file go?** Ask whether it would be deleted along with the
feature. If yes, it goes in `features/<feature>/`. If no, it's shared.

- **No barrel files** (`index.ts` re-exports). Import from the file that defines
  the thing.
- **Routes stay thin.** A route file declares the route, its loader and its
  search-param schema, then renders a page component from a feature.
- **Server state lives in TanStack Query** (`features/<feature>/api/`), not in
  `useState` + `useEffect`. Put query keys and options together in a
  `queryOptions()` factory.
- **Validate at the boundary with Zod.** API responses, search params and
  `localStorage` get parsed, and types come from the schema (`z.infer`).
- **shadcn components** are added with `pnpm dlx shadcn@latest add <name>`, or
  through the shadcn MCP. Customize by wrapping them in `components/`, never by
  editing `components/ui/`.

## Naming

Names are the main documentation. Spend time on them.

- **Files** are `kebab-case`: `agent-run-list.tsx`, `use-agent-runs.ts`.
  Tests sit next to their file as `*.test.ts(x)`.
- **Components and types** are `PascalCase`. Types get no `I` or `T` prefix.
  Props types are named `<Component>Props`.
- **Booleans** read as a yes/no question: `isOpen`, `hasError`, `canSubmit`,
  `shouldRetry`.
- **Events:** props are `onX` (`onSelect`). Handlers inside the component are
  `handleX` (`handleSelect`).
- **Hooks** are `useX`, named for what they return or do: `useAgentRuns`, not
  `useData`.
- **Name things in domain terms**, not by their shape: `pendingRuns`, not
  `filteredArray`. Spell words out (`button`, not `btn`). Put units in names
  (`timeoutMs`, `maxRetries`).
- **Module constants** are `UPPER_SNAKE_CASE`. Everything else is `camelCase`.

## TypeScript

- **No `any`** and no `!` non-null assertions. Use `as` only at a boundary
  you've validated, and prefer a Zod parse.
- **Use `type`, not `interface`.** The one exception is module augmentation.
- **Model states with discriminated unions**, not loose booleans:
  `{ status: "loading" } | { status: "error"; error: Error } | { status: "success"; data: Run[] }`.
- **Switches are exhaustive.** Lint enforces it. Let the compiler tell you about
  new cases.
- **Exported functions in `.ts` files declare return types.** A reviewer reads
  the contract without tracing the body. Components and hooks in `.tsx` files
  are exempt.
- **Index access may be undefined** (`noUncheckedIndexedAccess`). Handle the
  `undefined` case. Don't assert it away.
- **Named exports only.** Default exports are allowed only in tool config files.
- **Use type-only imports** for types: `import { type Run } from "…"`.

## React

**Write components in a fixed order,** so every file reads the same way:

1. Props (destructured in the signature)
2. Hooks (router, queries, state)
3. Derived values (computed during render)
4. Event handlers (`handleX`)
5. Early returns (loading, error, empty)
6. JSX

**Rules**

- **Don't memoize by hand.** React Compiler handles it, so leave out `useMemo`,
  `useCallback` and `memo` unless profiling proves a need, and leave a comment
  when you add one.
- **Effects are for syncing with something outside React** (DOM APIs,
  subscriptions, timers). Don't use them to derive state, respond to events or
  fetch data. Derive during render, handle events in handlers, and fetch with
  TanStack Query. See React's "You Might Not Need an Effect" guide.
- **Keep JSX flat.** No nested ternaries (lint enforces this). Use early returns
  or extract a component. When the left side of `&&` can be `0` or `""`, use a
  ternary instead.
- **Inline handlers are one-liners.** Anything longer becomes a named `handleX`.
- **Compose instead of configuring.** Prefer `children` and compound components
  to stacks of boolean props. If a component grows mode flags, split it into
  explicit variants.
- **Keep state close to where it's used.** Lift it only when a second consumer
  appears. URL state (filters, tabs, selection) belongs in TanStack Router
  search params.
- **Keys are stable IDs**, never array indexes.
- **Use React 19 APIs:** `use(Context)` instead of `useContext`, `<Context>`
  instead of `<Context.Provider>`, and `ref` as a prop instead of `forwardRef`.
- **Accessibility:** jsx-a11y is on. Use semantic elements, give every input a
  label, and give icon-only buttons an `aria-label`.

## Control flow and comments

- **Guard clauses first.** Return early and keep the happy path unindented. No
  `else` after `return`.
- **Always use braces** on `if` and loops, even for one-liners.
- **Comments explain why, never what.** If code needs a "what" comment, rename
  or extract until it doesn't. A `TODO` must reference an issue: `TODO(#123): …`.
- **Throw `Error` objects** with a message that says what went wrong and where.
- **No `console.log`.** Use `console.warn` or `console.error` only for real
  problems.

## Testing

- **Vitest + Testing Library.** Tests sit next to their file.
- **Test behavior through the UI** the way a user would: query by role and
  label, interact with `userEvent`. Don't assert on implementation details or
  internal state.
- **Test names read as sentences:** `it("persists a theme chosen through setTheme")`.
- New behavior gets a test. A bug fix gets a test that fails without the fix.

## Pull requests

- **Use the `draft-pr` skill** to open PRs. Every PR has three sections: What
  and why, How to review, and Checklist.
- **One logical change per PR.** If the "How to review" section gets long, split
  the PR.
- **Conventional Commit titles:** `feat:`, `fix:`, `refactor:`, `chore:`,
  `docs:`, `test:`.

## Tooling for Claude

Everything below is in `.claude/`, `.mcp.json` and `lefthook.yml`.

- **Hooks:** every file you edit gets Prettier and `eslint --fix`. Remaining
  lint errors come back to you, so fix them before moving on. You can't finish
  while `pnpm typecheck` or `pnpm lint` fails.
- **Skills:** `draft-pr` opens PRs in the team format.
- **Plugins:**
  - `typescript-lsp`: go-to-definition and references. Needs
    `typescript-language-server` on your PATH.
  - `code-simplifier`: removes unnecessary complexity.
  - `pr-review-toolkit`: parallel PR review agents.
  - `security-guidance`: warns about XSS and injection on edit.
  - `context7`: current library docs.
- **MCP:** `shadcn`, for searching and adding components.
- **Git hooks** (Lefthook, installed by `pnpm install`): format and lint
  staged files before each commit, and typecheck before each push.
- **When a lint rule seems wrong for a case,** use
  `// eslint-disable-next-line <rule>` with a comment explaining why. Never
  disable a rule for a whole file.
