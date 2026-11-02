import { describe, expect, it } from 'vitest';
import {
  AUTHORED,
  codeLines,
  stripBlockComments,
} from '../../../.github/scripts/health/files.mjs';

describe('codeLines', () => {
  it('skips blanks and comments', () => {
    const text = '/**\n * Doc.\n */\nconst a = 1;\n\n// note\n<!-- x -->\nb();';
    expect(codeLines(text)).toBe(2);
  });
});

describe('stripBlockComments', () => {
  it('keeps the line count', () => {
    const text = 'a\n/* b\nc */\nd';
    expect(stripBlockComments(text).split('\n')).toHaveLength(4);
  });
});

describe('AUTHORED', () => {
  it.each([
    ['packages/core/src/a.ts', true],
    ['packages/core/styles/_a.scss', true],
    ['.github/scripts/x.mjs', true],
    ['vitest.config.ts', true],
    ['package-lock.json', false],
    ['apps/showcase/index.html', false],
  ])('%s → %s', (file, expected) => {
    expect(AUTHORED.test(file)).toBe(expected);
  });
});
