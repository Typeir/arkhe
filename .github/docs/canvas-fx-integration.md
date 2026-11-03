# Canvas skeleton effect: integration

**Ruled by David, 3 Nov 2026** (P40 in [decisions.md](decisions.md)): names as below, `onRevealed` in v1, spoilers and image placeholders not in v1. It builds on canvas-fx R13 to R16: owner-declared grouping, PDF.js-style banding, the ruled defaults, the final look.

## Shape of it

The effect is not stateful UI, so it gets no Zag machine. The engine is framework-free code in core. Each port's `SkeletonGroup` becomes the owner (R13): it holds the skeleton while loading, swaps in the content when loading ends, and tells the engine to run the reveal. `Skeleton` stays what it is now: a shape declaration (`shape`, `width`, `height`) with no logic.

```tsx
// React
<SkeletonGroup
  loading={!data}
  skeleton={
    <>
      <Skeleton width='40%' />
      <Skeleton />
    </>
  }>
  <Article data={data} />
</SkeletonGroup>
```

```svelte
<!-- Svelte -->
<SkeletonGroup loading={!data}>
  {#snippet skeleton()}<Skeleton width="40%" /><Skeleton />{/snippet}
  <Article {data} />
</SkeletonGroup>
```

`skeleton` takes no parameters, so Astro can pass it as a named slot. The engine finds the shapes by querying the owner's own `skeleton` parts in the DOM. That's declared shape data, not scraped text, so no context has to cross the island boundary (Q1).

## SkeletonGroup props

| Prop         | Type                        | Meaning                                                                        |
| ------------ | --------------------------- | ------------------------------------------------------------------------------ |
| `loading`    | `boolean`                   | True: render `skeleton` and animate. False: render `children` and reveal them. |
| `skeleton`   | React node / Svelte snippet | The shapes to show while loading.                                              |
| `children`   | content                     | The real content. Mounted only once `loading` is false.                        |
| `effect`     | `boolean`, default `true`   | `false` keeps the CSS skeleton for this group only.                            |
| `onRevealed` | `() => void`, optional      | Fires when the reveal has finished, or at once when there is no effect.        |

The current mode, where children are the skeletons and the host removes the group, goes away. Nothing is published, so that breaks nobody.

## Grouping and size

- **Owner:** each `SkeletonGroup` owns its canvases. A nested `SkeletonGroup` is its own owner, and the outer one skips its parts, as in the PoC's `closest()` filter.
- **New owners:** a scroll container or a portal starts a new owner automatically, and gets canvases inside it (`needsInFlowCanvas`). A skeleton inside a Popover or Modal is already portalled.
- **Size:** comes only from `Skeleton`'s `shape`, `width` and `height`. The engine snaps each box to its cell grid, size first (R9). No new size props.
- **Not in v1:** spoilers (R11) and image placeholders (P9). Each would be its own owner type later.

## Engine instance

- `ArkheProvider` gets `effects?: Partial<FxOptions> | false`. Like the announcer, it owns one engine for the app and puts it in context. The engine never sets React or Svelte state, so it triggers no renders.
- Without a provider, a shared default engine is used. `effects={false}` means CSS skeletons everywhere.
- The engine lives behind its own subpath export, `@arkhe/core/fx`. A port loads it with a dynamic `import()` when the first owner mounts on the client, so apps that never show a skeleton never download it, and SSR never runs it. Until it loads, the CSS skeleton shows, and the canvas takes over when it first paints (PoC item 16).

## Port lifecycle

The ports stay thin:

| When                        | React                              | Svelte                                                               | Engine call                                                    |
| --------------------------- | ---------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| Client mount, engine loaded | effect                             | `$effect`                                                            | `attach(host)`                                                 |
| `loading` true → false      | content commits; `useLayoutEffect` | content renders; `$effect` (runs after the DOM update, before paint) | `ready(host)`: the cover paints in the same task (PoC item 12) |
| `loading` false → true      | skeleton commits                   | skeleton renders                                                     | `attach(host)` again, which re-measures                        |
| Unmount                     | effect cleanup                     | effect teardown                                                      | `detach(host)`                                                 |

If the engine hasn't loaded when `loading` turns false, the content simply shows, with no reveal. The engine's `ready` loses its `swap` callback, because the framework has already swapped the DOM by the time it is called; the host's top doesn't move during the swap, so the measured geometry still holds.

## Core layout

Per the [abstractions notes](../../.ignore/canvas-fx-handoff/.ignore/tasks/canvas-fx/ABSTRACTIONS.md):

```text
packages/core/src/canvas/        loop, budget, tiles, display, observers, measure,
                                 probe, managed, tiled, viewport, color, draw/
packages/core/src/fx/skeleton/   group geometry, painter, constants, ramp
packages/core/src/fx/index.ts    createFx → the @arkhe/core/fx entry
```

Every file stays under 250 lines and gets a mirrored test. The names stay generic (sweep, decode, ramp), so no app or game words appear.

## Accessibility and tests

- **Unchanged:** `SkeletonGroup` announces `loading` through the announcer (P38), canvases are `aria-hidden`, reduced motion draws one static frame (R12), and forced colours keep the CSS skeleton.
- **Parity:** the engine adds canvases and sentinels outside framework control, the same in both ports. Parity scenes run with `effects={false}`, and a separate test checks that both ports call `attach`, `ready` and `detach` at the same steps.
- **Engine checks:** the PoC's e2e checks move to the Playwright suite against the showcase.
