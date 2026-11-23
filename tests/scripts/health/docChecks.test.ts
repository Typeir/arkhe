import { describe, expect, it } from 'vitest';
import { DOC_CHECKS } from '../../../.github/scripts/health/docChecks.mjs';

const HEADING = `/**
 * @fileoverview Thing.
 *
 * @module x
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */
`;

function scan(file: string, content: string) {
  const [check] = DOC_CHECKS;
  if (!check) throw new Error('No doc check');
  return check.applies(file) ? check.scan(file, content) : [];
}

describe('jsdoc-declarations', () => {
  const file = 'packages/core/src/a.ts';

  it('wants JSDoc on every top-level declaration, exported or not', () => {
    expect(scan(file, `${HEADING}\nexport const A = 1;\n`)).toHaveLength(1);
    expect(scan(file, `${HEADING}\nconst A = 1;\n`)).toHaveLength(1);
    expect(scan(file, `${HEADING}\nfunction a() {}\n`)).toHaveLength(1);
    expect(scan(file, `${HEADING}\n/** A. */\nconst A = 1;\n`)).toEqual([]);
    expect(scan(file, "export { a } from './a';")).toEqual([]);
  });

  it('wants JSDoc on every class member, private or not', () => {
    const bare = `${HEADING}\n/** C. */\nexport class C {\n  #a = 1;\n  b = 2;\n  constructor() {}\n  get c(): number {\n    return 1;\n  }\n}\n`;
    expect(scan(file, bare).map((failure) => failure.line)).toEqual([
      12, 13, 14, 15,
    ]);
    const documented = `${HEADING}\n/** C. */\nexport class C {\n  /** A. */\n  #a = 1;\n\n  /** Makes one. */\n  constructor() {\n    const local = 1;\n  }\n}\n`;
    expect(scan(file, documented)).toEqual([]);
  });

  it('leaves tests and markup alone', () => {
    expect(scan('tests/a.test.ts', 'const A = 1;')).toEqual([]);
    expect(scan('packages/svelte/src/A.svelte', 'const A = 1;')).toEqual([]);
  });
});
