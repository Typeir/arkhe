# Agents: Arkhé

> [Decisions](.github/docs/decisions.md): rulings, proposals, open questions.

Component library: one markup and style contract, ported to React and Svelte, built on Zag state machines. It serves Ikuisuus and Flamelost first. Nothing is rounded.

## Hard Rules (David's rulings)

| Rule                                                                                            | Acceptance Check                                                |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Caveman speak: concise, technical, no filler                                                    | Replies carry no filler                                         |
| JSDoc on exports only, no inline comments. Ikuisuus is the golden                               | `npm run health:check` → jsdoc-\*, no-inline-\*                 |
| Components as `const`; other top-level functions as `function`; locals as `const` arrows        | `health:check` → function-style                                 |
| Nothing rounded: square corners, hexagon pills, rhombus, knotwork. No circles, no radius tokens | Review; `_shape.scss`: only `pill` bevels, falls back to square |
| Zag directly; no Ark UI                                                                         | No `@ark-ui/*` in any manifest                                  |
| Labels and accessible names are Arkhé's own and translatable                                    | Every string comes from `ArkheLabels`                           |
| Icons go through the adapter, named as in Lucide. Never generate SVG art                        | `IconSet` only; no hand-drawn paths                             |
| CSS exit animations first; Zag presence only where CSS cannot                                   | Review                                                          |
| Styling hook: `part()` mixin under `.arkhe`, all in `@layer arkhe`                              | `packages/core/styles/arkhe.scss`                               |
| Floating parts use Zag's placement. If it blows up, CSS anchoring                               | Review                                                          |
| No `alert()` / `confirm()` / `prompt()`                                                         | `health:check` → no-browser-dialogs                             |
| Files < 250 code lines                                                                          | `health:check` → file-length                                    |
| Proposals stay marked as Claude's until David rules on them                                     | No unruled item outside a Proposed section                      |
| Pre-existing errors? Fix anyway.                                                                | `health:check` all PASS                                         |
| Every source module has a mirrored test under `tests/`                                          | `health:check` → test-gaps                                      |
| Colour literals only in `packages/core/styles/_tokens.scss`                                     | `health:check` → color-literals                                 |
| `packages/core/src` stays pure: no React, Svelte, Lucide, Node                                  | `health:check` → core-purity                                    |
| No app or game words in `packages/`                                                             | `health:check` → banned-words                                   |
| React and Svelte export the same value names                                                    | `health:check` → export-parity                                  |
| React and Svelte render the same DOM, step by step                                              | `npm test` → `tests/parity`                                     |
| Exact version pins in every manifest                                                            | `health:check` → exact-pins                                     |
| Zero act() and console warnings in tests                                                        | `npm test` → no warnings                                        |

## Proposed Rules (Claude, pending David)

None. New proposals go in [Decisions](.github/docs/decisions.md) first.

## Completion Gate

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run test:e2e
npm run health:check
npm run build
```

Any failure → no completion. Node 22.23.4 (`.node-version`, fnm).

## Layout

| Path                   | Holds                                                                   |
| ---------------------- | ----------------------------------------------------------------------- |
| `packages/core/src`    | Framework-free logic: parts, labels, icons, field ids, progress, status |
| `packages/core/styles` | Tokens, mixins, component styles. `arkhe.scss` → `dist/arkhe.css`       |
| `packages/react`       | React port. Components only map props and render                        |
| `packages/svelte`      | Svelte 5 port, shipped as `.svelte` sources                             |
| `apps/showcase`        | Same-origin landing that frames every target                            |
| `tests/`               | Tests mirroring the repo: `tests/packages/react/src/Button.test.tsx`    |
| `.github/scripts`      | Health check, showcase screenshots, ASCII-cwd shim                      |

## Documentation Rules

Root markdown: `AGENTS.md`, `CLAUDE.md`, `README.md` only. Docs → `.github/docs/`. Task files → `.ignore/tasks/`. Reports → `.ignore/reports/`.

Commit messages: `[action]: imperative text`, e.g. `[feat]: add tabs`. Commit only when David asks.
