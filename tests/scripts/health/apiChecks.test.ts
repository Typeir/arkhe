import { describe, expect, it } from 'vitest';
import {
  API_CHECKS,
  modulePath,
} from '../../../.github/scripts/health/apiChecks.mjs';

function scan(name: string, file: string, content: string) {
  const check = API_CHECKS.find((candidate) => candidate.name === name);
  if (!check) throw new Error(`No check ${name}`);
  return check.applies(file) ? check.scan(file, content) : [];
}

describe('api checks', () => {
  it('wants part attributes through partAttrs() in the ports', () => {
    const file = 'packages/react/src/a/A.tsx';
    expect(scan('part-attrs', file, "<div data-scope='x'>")).toHaveLength(1);
    expect(scan('part-attrs', file, "{ 'data-scope': 'x' }")).toHaveLength(1);
    expect(scan('part-attrs', file, "{...partAttrs('x', 'y')}")).toEqual([]);
    expect(
      scan('part-attrs', 'packages/core/src/a.ts', "'data-scope'"),
    ).toEqual([]);
  });

  it('wants @module to name its own file', () => {
    expect(modulePath('packages/svelte/src/hint/cardDrag.svelte.ts')).toBe(
      'packages/svelte/src/hint/cardDrag.svelte',
    );
    const file = 'packages/core/src/a/b.ts';
    expect(
      scan('module-tag', file, '/**\n * @module packages/core/src/a/b\n */'),
    ).toEqual([]);
    expect(
      scan('module-tag', file, '/**\n * @module packages/core/src/old/b\n */'),
    ).toHaveLength(1);
  });

  it("wants 'use client' on every React module but the barrel", () => {
    expect(scan('use-client', 'packages/react/src/a/A.tsx', 'x;')).toHaveLength(
      1,
    );
    expect(
      scan('use-client', 'packages/react/src/a/A.tsx', "'use client';\nx;"),
    ).toEqual([]);
    expect(scan('use-client', 'packages/react/src/index.ts', 'x;')).toEqual([]);
  });

  it('wants defaults phrased "Defaults to X."', () => {
    const file = 'packages/core/src/a.ts';
    expect(
      scan(
        'jsdoc-defaults',
        file,
        ' * @property {boolean} [a] - Off by default.',
      ),
    ).toHaveLength(1);
    expect(
      scan(
        'jsdoc-defaults',
        file,
        ' * @property {boolean} [a] - Defaults to off.',
      ),
    ).toEqual([]);
  });

  it('wants readonly arrays out of core, readonly ones passing', () => {
    const file = 'packages/core/src/a.ts';
    expect(
      scan('readonly-returns', file, 'export function a(): T[] {'),
    ).toHaveLength(1);
    expect(
      scan('readonly-returns', file, 'export function a(): readonly T[] {'),
    ).toEqual([]);
    expect(scan('readonly-returns', file, '): readonly string[] {')).toEqual(
      [],
    );
  });
});
