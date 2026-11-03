# Arkhé

## Packages

| Package         | Mirror                                                        |
| --------------- | ------------------------------------------------------------- |
| `@arkhe/core`   | [typeir/arkhe-core](https://github.com/typeir/arkhe-core)     |
| `@arkhe/react`  | [typeir/arkhe-react](https://github.com/typeir/arkhe-react)   |
| `@arkhe/svelte` | [typeir/arkhe-svelte](https://github.com/typeir/arkhe-svelte) |

## Install

```bash
npm install github:typeir/arkhe-react#v0.1.0
npm install github:typeir/arkhe-svelte#v0.1.0
```

## Use

```tsx
import '@arkhe/core/arkhe.css';
import { ArkheProvider, Button } from '@arkhe/react';

<ArkheProvider
  locale='fi'
  labels={{
    chipRemove: 'Poista {label}',
    results: { one: '{count} tulos', other: '{count} tulosta' },
  }}
  icons={{ x: MyX }}>
  <Button icon='plus'>New</Button>
</ArkheProvider>;
```

## Develop

```bash
npm ci
npm run dev
npm run showcase
npm test
npm run health:check
npm run publish:mirrors
```
