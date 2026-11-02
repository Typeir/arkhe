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

  it('keeps frameworks out of core', () => {
    expect(
      scan('core-purity', 'packages/core/src/a.ts', "import x from 'react';"),
    ).toHaveLength(1);
    expect(
      scan('core-purity', 'packages/react/src/a.ts', "import x from 'react';"),
    ).toEqual([]);
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
});
