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
      'select',
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

  it('frames both select scopes alike and turns each open indicator', () => {
    for (const scope of ['combobox', 'select']) {
      expect(declarations(scope, 'control'), scope).toContain('display: flex');
      expect(declarations(scope, 'content'), scope).toContain(
        'min-width: var(--reference-width)',
      );
    }
    expect(declarations('combobox', 'trigger', '[data-state=open]')).toContain(
      'rotate: 180deg',
    );
    expect(declarations('select', 'indicator', '[data-state=open]')).toContain(
      'rotate: 180deg',
    );
  });

  it('scales the button glyph per size and keeps a labelled rhombus a ghost', () => {
    for (const [size, edge] of [
      ['xs', '0.625rem'],
      ['m', '1rem'],
      ['xl', '1.5rem'],
    ]) {
      expect(declarations('button', 'root', `[data-size=${size}]`)).toContain(
        `--button-glyph: ${edge}`,
      );
    }
    expect(
      declarations(
        'button',
        'root',
        '[data-shape=rhombus]:not([data-icon-only])',
      ),
    ).toMatch(/border-color: transparent;\s+background: transparent/);
  });

  it('lights a button in its tone and keeps a plain one boxless', () => {
    expect(declarations('button', 'root', '[data-tone=danger]')).toContain(
      '--button-tone: var(--color-danger)',
    );
    expect(
      declarations('button', 'root', '[data-icon-only][data-shape=plain]'),
    ).toMatch(/border-color: transparent;\s+background: transparent/);
    expect(declarations('button', 'root', '[data-dashed]')).toContain(
      'border-style: dashed',
    );
    expect(declarations('button', 'root', '[data-icon-side=end]')).toContain(
      'flex-direction: row-reverse',
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

  it('holds virtual rows at one pitch with spacers for the rows not drawn', () => {
    for (const [scope, part] of [
      ['combobox', 'content'],
      ['select', 'content'],
      ['virtual-list', 'root'],
    ] as const) {
      expect(
        declarations(scope, part, '[data-virtual]::before'),
        scope,
      ).toContain('block-size: var(--virtual-before)');
      expect(
        declarations(scope, part, '[data-virtual]::after'),
        scope,
      ).toContain('block-size: var(--virtual-after)');
      expect(declarations(scope, part, '[data-virtual] > *'), scope).toContain(
        'block-size: var(--row-pitch)',
      );
    }
    expect(declarations('virtual-list', 'root')).toContain(
      'max-block-size: var(--virtual-max, 37.5rem)',
    );
  });

  it('marks a control invalid once the user has met its constraint', () => {
    expect(CSS).toMatch(
      /:user-invalid\s*\{\s*border-color: var\(--color-error\)/,
    );
    expect(CSS).toContain(':has(input:user-invalid)');
    expect(CSS).toContain(':has(> select:user-invalid) > [data-part=control]');
  });

  it('keeps overlay scroll off the page and fits menus to the viewport', () => {
    for (const [scope, part] of [
      ['dialog', 'content'],
      ['menu', 'content'],
      ['popover', 'content'],
      ['combobox', 'content'],
      ['select', 'content'],
    ] as const) {
      expect(declarations(scope, part), scope).toContain(
        'overscroll-behavior: contain',
      );
    }
    const menu = declarations('menu', 'content');
    expect(menu).toContain('max-height: var(--available-height, none)');
    expect(menu).toContain('opacity var(--dur-1)');
  });

  it('fades without travel and slows the spinner under reduced motion', () => {
    const still = CSS.split('@media (prefers-reduced-motion: reduce)')
      .slice(1)
      .join(' ');
    expect(still).toContain('animation-duration: 6s');
    expect(still).toMatch(/translate: 0 0/);
  });
});
