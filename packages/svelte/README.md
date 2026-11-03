# @arkhe/svelte

Arkhé's Svelte 5 components on Zag state machines, shipped as `.svelte` sources and styled by `@arkhe/core/arkhe.css`. They render the same DOM as `@arkhe/react`.

```svelte
<script>
  import '@arkhe/core/arkhe.css';
  import { ArkheProvider, Button } from '@arkhe/svelte';
</script>

<ArkheProvider>
  <Button icon="plus">New</Button>
</ArkheProvider>
```

`ArkheProvider` takes `labels`, `icons`, `link` and `effects`, all optional.

## Source

This repo is a read-only mirror, split from the [Arkhé monorepo](https://github.com/typeir/arkhe) with `git subtree`. Changes go to the monorepo. The `release/svelte` branch carries the built `dist`; `split/svelte` carries only the sources. It depends on `@arkhe/core` at the same version.

```bash
npm install
npm run build   # svelte-package → dist/ (run from a path without non-ASCII characters)
```
