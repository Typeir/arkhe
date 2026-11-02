import { describe, expect, it } from 'vitest';
import { FILE_CHECKS } from '../../../.github/scripts/health/fileChecks.mjs';

const HEADING = `/**
 * @fileoverview Thing.
 *
 * @module x
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */
`;

function scan(name: string, file: string, content: string) {
  const check = FILE_CHECKS.find((candidate) => candidate.name === name);
  if (!check) throw new Error(`No check ${name}`);
  return check.applies(file) ? check.scan(file, content) : [];
}

describe('file checks', () => {
  it('flags files at the code line limit', () => {
    const long = Array.from({ length: 250 }, (_, i) => `a${i};`).join('\n');
    expect(scan('file-length', 'packages/core/src/a.ts', long)).toHaveLength(1);
    expect(scan('file-length', 'packages/core/src/a.ts', 'a;')).toEqual([]);
  });

  it('wants a full heading on scripts and a component doc on Svelte', () => {
    expect(scan('jsdoc-heading', 'packages/core/src/a.ts', HEADING)).toEqual(
      [],
    );
    expect(
      scan('jsdoc-heading', 'packages/core/src/a.ts', 'export {};'),
    ).toHaveLength(1);
    expect(
      scan('jsdoc-heading', 'packages/svelte/src/A.svelte', '<div></div>'),
    ).toHaveLength(1);
    expect(
      scan(
        'jsdoc-heading',
        'packages/svelte/src/A.svelte',
        '<!--\n@component\nA.\n-->',
      ),
    ).toEqual([]);
  });

  it('flags exports without JSDoc', () => {
    const bare = `${HEADING}\nexport const A = 1;\n`;
    const documented = `${HEADING}\n/** A. */\nexport const A = 1;\n`;
    expect(scan('jsdoc-exports', 'packages/core/src/a.ts', bare)).toHaveLength(
      1,
    );
    expect(scan('jsdoc-exports', 'packages/core/src/a.ts', documented)).toEqual(
      [],
    );
    expect(
      scan(
        'jsdoc-exports',
        'packages/core/src/a.ts',
        "export { a } from './a';",
      ),
    ).toEqual([]);
  });

  it('flags inline comments but allows tool directives', () => {
    expect(
      scan('no-inline-comments', 'packages/core/src/a.ts', '// why'),
    ).toHaveLength(1);
    expect(
      scan(
        'no-inline-comments',
        'packages/core/src/a.ts',
        '// eslint-disable-next-line',
      ),
    ).toEqual([]);
  });

  it.each([
    ['packages/core/src/a.ts', 'const a = 1; // trailing note'],
    ['packages/core/src/a.ts', 'function f() {\n  /* inner note */\n}'],
    ['packages/svelte/src/A.svelte', '<div><!-- markup note --></div>'],
    ['packages/core/src/a.ts', "const g = '**/x/**';\n// why\nconst h = '*/';"],
  ])('flags the inline comment in %s: %j', (file, content) => {
    expect(scan('no-inline-comments', file, content)).toHaveLength(1);
  });

  it.each([
    ['packages/core/src/a.ts', '/**\n * Doc.\n */\nexport const a = 1;'],
    ['packages/core/src/a.ts', "const u = 'http://x/*';\nconst r = /\\/\\//g;"],
    ['packages/svelte/src/A.svelte', '<!--\n@component\nA.\n-->\n<div></div>'],
    [
      'packages/svelte/src/A.svelte',
      '<!-- svelte-ignore a11y_x -->\n<div></div>',
    ],
  ])(
    'allows JSDoc, docs, directives and literals in %s: %j',
    (file, content) => {
      expect(scan('no-inline-comments', file, content)).toEqual([]);
    },
  );

  it('flags browser dialogs in sources', () => {
    expect(
      scan('no-browser-dialogs', 'apps/showcase/src/a.ts', 'confirm("x");'),
    ).toHaveLength(1);
  });

  it('flags colour literals outside the token file', () => {
    expect(
      scan('color-literals', 'packages/core/styles/_x.scss', 'color: #fff;'),
    ).toHaveLength(1);
    expect(
      scan(
        'color-literals',
        'packages/core/styles/_x.scss',
        'color: rgb(1 2 3);',
      ),
    ).toHaveLength(1);
    expect(
      scan(
        'color-literals',
        'packages/core/styles/_x.scss',
        'color: rgb(var(--a));',
      ),
    ).toEqual([]);
    expect(
      scan(
        'color-literals',
        'packages/core/styles/_x.scss',
        '[data-#{$s}-x] {',
      ),
    ).toEqual([]);
    expect(
      scan(
        'color-literals',
        'packages/core/styles/_tokens.scss',
        'color: #fff;',
      ),
    ).toEqual([]);
  });

  it('keeps game words out of packages only', () => {
    expect(
      scan('banned-words', 'packages/core/src/a.ts', "'Bloodline'"),
    ).toHaveLength(1);
    expect(
      scan('banned-words', 'apps/showcase/src/a.ts', "'Bloodline'"),
    ).toEqual([]);
  });

  it('finds game words in comments too', () => {
    expect(
      scan(
        'banned-words',
        'packages/core/src/a.ts',
        '/**\n * As in Flamelost.\n */',
      ),
    ).toEqual([expect.objectContaining({ line: 2 })]);
    expect(
      scan('banned-words', 'packages/core/styles/_a.scss', '/* Ikuisuus */'),
    ).toHaveLength(1);
  });

  it('keeps frameworks out of core', () => {
    expect(
      scan('core-purity', 'packages/core/src/a.ts', "import x from 'react';"),
    ).toHaveLength(1);
    expect(
      scan('core-purity', 'packages/react/src/a.ts', "import x from 'react';"),
    ).toEqual([]);
  });

  it.each([
    "import { writable } from 'svelte/store';",
    "import { normalizeProps } from '@zag-js/react';",
    "import { jsx } from 'react/jsx-runtime';",
    "import { X } from 'lucide-svelte';",
    "import 'react';",
    "export * from 'react-dom/client';",
    "const fs = await import('node:fs');",
    "import { readFileSync } from 'fs';",
    "import {\n  x,\n} from\n  'svelte';",
  ])('flags the core import %j', (content) => {
    expect(scan('core-purity', 'packages/core/src/a.ts', content)).toHaveLength(
      1,
    );
  });

  it('allows framework-free core imports', () => {
    const content = [
      "import { x } from '@zag-js/core';",
      "import { y } from './react.js';",
      "const note = 'from react';",
    ].join('\n');
    expect(scan('core-purity', 'packages/core/src/a.ts', content)).toEqual([]);
  });

  it('enforces function style', () => {
    const file = 'packages/core/src/a.ts';
    expect(
      scan('function-style', file, 'const helper = (a: number) => a;'),
    ).toHaveLength(1);
    expect(scan('function-style', file, 'const Part = () => null;')).toEqual(
      [],
    );
    expect(scan('function-style', file, 'const total = (a + b) * 2;')).toEqual(
      [],
    );
    expect(
      scan('function-style', file, 'function f() {\n  function g() {}\n}'),
    ).toHaveLength(1);
    expect(
      scan(
        'function-style',
        'packages/react/src/A.tsx',
        'export function Button() {}',
      ),
    ).toHaveLength(1);
    expect(
      scan(
        'function-style',
        'packages/svelte/src/A.svelte',
        '<script>\n  function go() {}\n</script>',
      ),
    ).toHaveLength(1);
  });

  it.each([
    'const helper = x => x;',
    'const helper: (n: number) => number = (n) => n;',
    'const helper = <T,>(x: T) => x;',
    'let helper = () => 1;',
    'const _helper = () => 1;',
    'export const helper = async (a: number) =>\n  a;',
    'const helper = function () {};',
  ])('flags the top-level helper %j', (content) => {
    expect(
      scan('function-style', 'packages/core/src/a.ts', content),
    ).toHaveLength(1);
  });

  it.each([
    'const f: () => void = noop;',
    'const total: number = (a + b) * 2;',
    'const Part = <T,>(x: T) => x;',
  ])('allows the non-helper %j', (content) => {
    expect(scan('function-style', 'packages/core/src/a.ts', content)).toEqual(
      [],
    );
  });

  it.each([
    'function Button() {}\nexport { Button };',
    'export default function Button() {}',
  ])('flags the function component %j', (content) => {
    expect(
      scan('function-style', 'packages/react/src/A.tsx', content),
    ).toHaveLength(1);
  });
});
