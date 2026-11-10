# Arkhé

## Packages

| Package         | Mirror                                                        |
| --------------- | ------------------------------------------------------------- |
| `@arkhe/core`   | [Typeir/arkhe-core](https://github.com/Typeir/arkhe-core)     |
| `@arkhe/react`  | [Typeir/arkhe-react](https://github.com/Typeir/arkhe-react)   |
| `@arkhe/svelte` | [Typeir/arkhe-svelte](https://github.com/Typeir/arkhe-svelte) |

## Install

```bash
npm install github:Typeir/arkhe-react#v0.2.0
npm install github:Typeir/arkhe-svelte#v0.2.0
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
