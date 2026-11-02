import { resolve } from 'node:path';
import { compile } from 'sass';
import { describe, expect, it } from 'vitest';

function forcedBlocks(css: string): string {
  const blocks: string[] = [];
  let from = css.indexOf('@media (forced-colors: active)');
  while (from !== -1) {
    const open = css.indexOf('{', from);
    let depth = 1;
    let at = open + 1;
    while (depth > 0 && at < css.length) {
      if (css[at] === '{') depth += 1;
      if (css[at] === '}') depth -= 1;
      at += 1;
    }
    blocks.push(css.slice(open, at));
    from = css.indexOf('@media (forced-colors: active)', at);
  }
  return blocks.join('\n');
}

function rule(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) return '';
  return css.slice(start, css.indexOf('}', start));
}

const forced = forcedBlocks(
  compile(resolve('packages/core/styles/arkhe.scss')).css,
);

describe('forced colours', () => {
  it.each([
    ['[data-progress-fill])', 'background: Highlight'],
    [
      '[data-progress-track])',
      'outline: var(--border-width-xs) solid CanvasText',
    ],
    ['[data-progress-marker])', 'background: CanvasText'],
    ['[data-skeleton-root])', 'background: GrayText'],
    ['[data-tabs-indicator])', 'background: Highlight'],
    ['[data-tabs-indicator])::after', 'background: Highlight'],
    ['[data-menu-item])[data-highlighted]', 'background: Highlight'],
    ['[data-combobox-item])[data-highlighted]', 'color: HighlightText'],
    ['[data-combobox-item])[data-state=checked]', 'border-inline-start'],
    ['[data-combobox-control])[data-focus]', 'solid Highlight'],
    ['[data-number-input-control])[data-focus]', 'solid Highlight'],
  ])('%s keeps a system-colour cue', (selector, declaration) => {
    expect(rule(forced, selector)).toContain(declaration);
  });

  it('opts painted parts out of forced adjustment', () => {
    expect(rule(forced, '[data-progress-fill])')).toContain(
      'forced-color-adjust: none',
    );
    expect(rule(forced, '[data-tabs-indicator])')).toContain(
      'forced-color-adjust: none',
    );
  });
});
