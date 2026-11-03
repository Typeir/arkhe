# @arkhe/react

Arkhé's React 19 components on Zag state machines, styled by `@arkhe/core/arkhe.css`.

```tsx
import '@arkhe/core/arkhe.css';
import { ArkheProvider, Button } from '@arkhe/react';

<ArkheProvider>
  <Button icon='plus'>New</Button>
</ArkheProvider>;
```

`ArkheProvider` takes `labels`, `icons`, `link` and `effects`, all optional.

## Source

This repo is a read-only mirror, split from the [Arkhé monorepo](https://github.com/typeir/arkhe) with `git subtree`. Changes go to the monorepo. The `release/react` branch carries the built `dist`; `split/react` carries only the sources. It depends on `@arkhe/core` at the same version.

```bash
npm install
npm run build   # tsc → dist/
```
