# Arkhé

One component contract, two ports. Arkhé gives Ikuisuus and Flamelost the same buttons, fields, chips, progress rails and status lines, in React and in Svelte, styled by one stylesheet. Corners are square; pills have hexagon ends. Nothing is rounded.

## Packages

| Package         | What it is                                                         |
| --------------- | ------------------------------------------------------------------ |
| `@arkhe/core`   | Framework-free logic plus the stylesheet (`@arkhe/core/arkhe.css`) |
| `@arkhe/react`  | React 19 components                                                |
| `@arkhe/svelte` | Svelte 5 components                                                |

Every component renders `class="arkhe"` and `data-scope` / `data-part` attributes. The stylesheet targets only those, inside `@layer arkhe`, so unlayered app CSS wins.

## Use

```tsx
import '@arkhe/core/arkhe.css';
import { ArkheProvider, Button } from '@arkhe/react';

<ArkheProvider labels={{ chipRemove: 'Poista {label}' }} icons={{ x: MyX }}>
  <Button icon='plus'>New</Button>
</ArkheProvider>;
```

The provider takes three adapters, all optional:

- `labels` sets translated templates, with `{name}` placeholders.
- `icons` sets the app's own art, by Lucide name. Lucide fills any gap.
- `link` sets the app router's link component.

Theme: dark by default; `data-theme="light"` on `<html>` switches.

## Develop

```bash
npm ci
npm run dev           # showcase with hot reload
npm run showcase      # build everything, serve the showcase
npm test
npm run health:check
```

The showcase frames the React, Svelte and static HTML targets side by side, all from one origin. Its toolbar changes theme, text size and layout in every frame at once.

## Splits

Each package splits into its own repo with `git subtree`. Build, then run `node .github/scripts/split-package.mjs <core|react|svelte>`. That updates two local branches: `split/<name>` (the package's own history) and `release/<name>` (the same plus a commit holding its built `dist`, so consumers install without build tools).
