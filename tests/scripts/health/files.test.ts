import { describe, expect, it } from 'vitest';
import {
  AUTHORED,
  codeLines,
  comments,
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

  it('leaves comment markers inside literals alone', () => {
    const text = [
      "const g = '**/x/**';",
      'alert(1);',
      'const t = `*/`;',
      'const r = /\\/\\*/;',
      'b();',
      'const h = "*/";',
    ].join('\n');
    expect(stripBlockComments(text)).toBe(text);
  });

  it('blanks markup comments', () => {
    expect(stripBlockComments('<b><!-- x --></b>')).toBe(
      `<b>${' '.repeat(10)}</b>`,
    );
  });
});

describe('comments', () => {
  it('lists line, block and markup comments with their lines', () => {
    const text = "const a = '//'; // one\n/* two */\n<!-- three -->";
    expect(
      comments(text).map(({ kind, line, text: body }) => [kind, line, body]),
    ).toEqual([
      ['line', 1, '// one'],
      ['block', 2, '/* two */'],
      ['markup', 3, '<!-- three -->'],
    ]);
  });

  it('tells a regular expression from division', () => {
    expect(comments('const r = /[\'"]/; // c')).toHaveLength(1);
    expect(comments('const q = a / b; // c')).toHaveLength(1);
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
