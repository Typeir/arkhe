# @arkhe/svelte

Arkhé's Svelte 5 components on Zag state machines, shipped as `.svelte` sources and styled by `@arkhe/svelte/arkhe.css`. They render the same DOM as `@arkhe/react`.

```svelte
<script>
  import '@arkhe/svelte/arkhe.css';
  import { ArkheProvider, Button } from '@arkhe/svelte';
</script>

<ArkheProvider>
  <Button icon="plus">New</Button>
</ArkheProvider>
```

`ArkheProvider` takes `labels`, `icons`, `link` and `effects`, all optional.

## Source

This repo is split from the Arkhé monorepo with `git subtree`. Changes go to the monorepo. The `release/svelte` branch carries the built `dist` with `@arkhe/core` bundled in `dist/core`, so it installs as one package; the stylesheet is `@arkhe/svelte/arkhe.css`. `split/svelte` carries only the sources and depends on `@arkhe/core`.

```bash
npm install
npm run build   # svelte-package → dist/ (run from a path without non-ASCII characters)
```
