# Tiger Team Hub

A hub of artifacts the team uses to plan and build agents into our platform.

## Getting started

```bash
pnpm install   # also installs git hooks (Lefthook)
pnpm dev
```

For full TypeScript code intelligence in Claude Code, install the language
server once:

```bash
npm install -g typescript-language-server typescript
```

## Conventions

All conventions for architecture, naming, TypeScript, React, testing and PRs
are in [`CLAUDE.md`](./CLAUDE.md). The same file guides both people and Claude
Code. Lint enforces most of it. Run `pnpm check` before opening a PR.
