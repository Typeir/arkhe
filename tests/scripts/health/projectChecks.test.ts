import { describe, expect, it } from 'vitest';
import {
  PROJECT_CHECKS,
  expectedTests,
  overrideRanges,
  starExports,
  valueExports,
} from '../../../.github/scripts/health/projectChecks.mjs';

function run(
  name: string,
  files: string[],
  contents: Record<string, string> = {},
) {
  const check = PROJECT_CHECKS.find((candidate) => candidate.name === name);
  if (!check) throw new Error(`No check ${name}`);
  return check.run(files, (file: string) => contents[file] ?? '').failures;
}

describe('expectedTests', () => {
  it('mirrors sources under tests', () => {
    expect(expectedTests('packages/svelte/src/Button.svelte')).toEqual([
      'tests/packages/svelte/src/Button.test.ts',
      'tests/packages/svelte/src/Button.test.tsx',
    ]);
  });
});

describe('valueExports', () => {
  it('collects value names and skips types', () => {
    const barrel = [
      "export { default as Button } from './Button.svelte';",
      "export { useArkhe, type Thing } from './context';",
      "export type { Labels } from '@arkhe/core';",
    ].join('\n');
    expect(valueExports(barrel)).toEqual(['Button', 'useArkhe']);
  });

  it('collects declarations and namespace re-exports', () => {
    const barrel = [
      'export const VERSION = 1;',
      'export function useThing() {}',
      'export class Store {}',
      'export const enum Mode { A }',
      "export * as hooks from './hooks';",
      'export interface Shape {}',
      'export type Size = number;',
    ].join('\n');
    expect(valueExports(barrel)).toEqual([
      'Store',
      'VERSION',
      'hooks',
      'useThing',
    ]);
  });
});

describe('starExports', () => {
  it('lists bare star re-exports only', () => {
    const barrel = [
      "export * from './hooks';",
      "export * as ns from './ns';",
      "export type * from './types';",
    ].join('\n');
    expect(starExports(barrel)).toEqual(['./hooks']);
  });
});

describe('overrideRanges', () => {
  it('walks npm, yarn and pnpm overrides', () => {
    const manifest = {
      overrides: {
        a: '1.0.0',
        b: '^1.0.0',
        c: { '.': '~2.0.0', d: '3.0.0' },
        e: '$e',
      },
      resolutions: { 'x/**/y': '>=1' },
      pnpm: { overrides: { z: 'latest' } },
    };
    expect(overrideRanges(manifest)).toEqual([
      { path: 'overrides.b', version: '^1.0.0' },
      { path: 'overrides.c..', version: '~2.0.0' },
      { path: 'resolutions.x/**/y', version: '>=1' },
      { path: 'pnpm.overrides.z', version: 'latest' },
    ]);
  });
});

describe('project checks', () => {
  it('flags sources without tests, exempting barrels and entries', () => {
    const files = [
      'packages/core/src/a.ts',
      'packages/core/src/b.ts',
      'packages/core/src/index.ts',
      'apps/showcase/src/react/main.tsx',
      'tests/packages/core/src/a.test.ts',
    ];
    expect(run('test-gaps', files).map((failure) => failure.file)).toEqual([
      'packages/core/src/b.ts',
    ]);
  });

  it('flags ranged versions', () => {
    const manifest = JSON.stringify({
      dependencies: { a: '1.2.3', b: '^1.2.3' },
      devDependencies: { c: '~2.0.0' },
    });
    expect(
      run('exact-pins', ['package.json'], { 'package.json': manifest }),
    ).toHaveLength(2);
  });

  it('wants caret ranges on peers', () => {
    const manifest = JSON.stringify({
      peerDependencies: { a: '^1.2.3', b: '1.2.3', c: '>=1' },
    });
    expect(
      run('exact-pins', ['package.json'], { 'package.json': manifest }),
    ).toHaveLength(2);
  });

  it('flags exports one port lacks', () => {
    const files = [
      'packages/react/src/index.ts',
      'packages/svelte/src/index.ts',
    ];
    const failures = run('export-parity', files, {
      'packages/react/src/index.ts': "export { Button, Tabs } from './x';",
      'packages/svelte/src/index.ts':
        "export { default as Button } from './Button.svelte';",
    });
    expect(failures.map((failure) => failure.message)).toEqual([
      'Exports Tabs; the other port does not.',
    ]);
  });

  it('flags star re-exports and one-sided declarations in barrels', () => {
    const files = [
      'packages/react/src/index.ts',
      'packages/svelte/src/index.ts',
    ];
    const failures = run('export-parity', files, {
      'packages/react/src/index.ts': "export * from './hooks';",
      'packages/svelte/src/index.ts': 'export const useThing = 1;',
    });
    expect(failures.map((failure) => failure.message)).toEqual([
      "export * from './hooks' hides its names; list them.",
      'Exports useThing; the other port does not.',
    ]);
  });

  it('flags ranged overrides', () => {
    const manifest = JSON.stringify({ overrides: { a: '^1.0.0' } });
    expect(
      run('exact-pins', ['package.json'], { 'package.json': manifest }),
    ).toEqual([
      {
        file: 'package.json',
        message: 'overrides.a is "^1.0.0"; pin an exact version.',
      },
    ]);
  });
});
