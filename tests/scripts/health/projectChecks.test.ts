import { describe, expect, it } from 'vitest';
import {
  PROJECT_CHECKS,
  expectedTests,
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
});
