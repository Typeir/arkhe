import { describe, expect, it } from 'vitest';
import { CODE_CHECKS } from '../../../.github/scripts/health/codeChecks.mjs';

function scan(name: string, file: string, content: string) {
  const check = CODE_CHECKS.find((candidate) => candidate.name === name);
  if (!check) throw new Error(`No check ${name}`);
  return check.applies(file) ? check.scan(file, content) : [];
}

describe('code checks', () => {
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

  it('reads no # private member as a colour, even in hex letters', () => {
    const file = 'packages/core/src/a.ts';
    for (const line of [
      '  readonly #caf: () => void;',
      '    this.#caf = caf;',
      '  #bad = 1;',
    ]) {
      expect(scan('color-literals', file, line), line).toEqual([]);
    }
    expect(scan('color-literals', file, "const c = '#caf';")).toHaveLength(1);
  });

  it('wants # private members, not TypeScript private or protected', () => {
    const file = 'packages/core/src/a.ts';
    for (const bad of [
      '  private x = 1;',
      '  private static readonly y = 2;',
      '  protected run(): void {}',
      '  constructor(private readonly api: Api) {}',
    ]) {
      expect(scan('private-fields', file, bad), bad).toHaveLength(1);
    }
    expect(
      scan(
        'private-fields',
        file,
        '  #x = 1;\n  static #y = 2;\n  readonly #z = 3;',
      ),
    ).toEqual([]);
    expect(
      scan('private-fields', 'tests/a.test.ts', '  private x = 1;'),
    ).toEqual([]);
  });
});
