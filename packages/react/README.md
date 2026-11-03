# @arkhe/react

Arkhé's React 19 components on Zag state machines, styled by `@arkhe/react/arkhe.css`.

```tsx
import '@arkhe/react/arkhe.css';
import { ArkheProvider, Button } from '@arkhe/react';

<ArkheProvider>
  <Button icon='plus'>New</Button>
</ArkheProvider>;
```

`ArkheProvider` takes `labels`, `icons`, `link` and `effects`, all optional.

## Source

This repo is split from the Arkhé monorepo with `git subtree`. Changes go to the monorepo. The `release/react` branch carries the built `dist` with `@arkhe/core` bundled in `dist/core`, so it installs as one package; the stylesheet is `@arkhe/react/arkhe.css`. `split/react` carries only the sources and depends on `@arkhe/core`.

```bash
npm install
npm run build   # tsc → dist/
```
