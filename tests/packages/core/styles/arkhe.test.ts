import { resolve } from 'node:path';
import { compile } from 'sass';
import { describe, expect, it } from 'vitest';

const CSS = compile(resolve('packages/core/styles/arkhe.scss')).css;

function declarations(scope: string, part: string, state = ''): string {
  const anchor = `[data-${scope}-${part}])${state} {`;
  const blocks: string[] = [];
  let at = CSS.indexOf(anchor);
  while (at !== -1) {
    const open = at + anchor.length;
    blocks.push(CSS.slice(open, CSS.indexOf('}', open)));
    at = CSS.indexOf(anchor, open);
  }
  return blocks.join('\n');
}

function token(name: string): number {
  const match = new RegExp(`${name}:\\s*(\\d+)`).exec(CSS);
  return Number(match?.[1]);
}

describe('arkhe.css', () => {
  it('stacks every floating positioner above a modal', () => {
    expect(token('--layer-floating')).toBeGreaterThan(token('--layer-modal'));
    for (const scope of [
      'popover',
      'menu',
      'combobox',
      'tooltip',
      'hover-card',
    ]) {
      expect(declarations(scope, 'positioner'), scope).toContain(
        'z-index: var(--layer-floating)',
      );
    }
  });

  it('keeps hint positioners shown until the exit transition ends', () => {
    for (const scope of ['tooltip', 'hover-card']) {
      expect(declarations(scope, 'positioner'), scope).toMatch(
        /display: block;\s+transition: display var\(--dur-3\) allow-discrete/,
      );
      expect(declarations(scope, 'positioner', '[hidden]'), scope).toContain(
        'display: none',
      );
    }
  });

  it('dims a disabled control frame and drops its hover light', () => {
    expect(declarations('combobox', 'control', '[data-disabled]')).toMatch(
      /opacity: 0\.6;\s+cursor: not-allowed/,
    );
    expect(CSS).toContain(
      '[data-combobox-control]):hover:not([data-disabled])',
    );
    expect(declarations('combobox', 'trigger', ':disabled')).toContain(
      'cursor: not-allowed',
    );
    expect(declarations('combobox', 'input', ':disabled')).toContain(
      'cursor: not-allowed',
    );
  });

  it('lays out floating headers with logical properties', () => {
    for (const scope of ['popover', 'hover-card']) {
      expect(declarations(scope, 'header'), scope).toMatch(
        /padding-block: var\(--space-1\);\s+padding-inline: var\(--space-3\) var\(--space-1\)/,
      );
    }
    const close = declarations('popover', 'close-trigger');
    expect(close).toContain('margin-inline-start: auto');
    expect(close).not.toContain('margin-left');
  });
});
