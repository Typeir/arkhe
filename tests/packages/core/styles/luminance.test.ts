import { resolve } from 'node:path';
import { compile, compileString } from 'sass';
import { describe, expect, it } from 'vitest';

const STYLES = resolve('packages/core/styles');
const CSS = compile(resolve(STYLES, 'arkhe.scss')).css;

const TEXT = [
  'text',
  'text-secondary',
  'accent',
  'accent-hover',
  'emphasis',
  'success',
  'warning',
  'error',
  'info',
  'danger',
];
const PARTS = ['secondary', 'border-secondary', 'actionable'];

function channels(value: string): number[] {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value.trim());
  const rgb = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(value);
  const parts = hex ? hex.slice(1, 4) : rgb?.slice(1, 4);
  if (!parts) throw new Error(`Not an opaque colour: ${value}`);
  return parts.map((part) => (hex ? parseInt(part, 16) : Number(part)));
}

function luminance(value: string): number {
  const weights = [0.2126, 0.7152, 0.0722];
  return channels(value).reduce((sum, channel, at) => {
    const s = channel / 255;
    const light = s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    return sum + (weights[at] ?? 0) * light;
  }, 0);
}

function ratio(a: string, b: string): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function palette(theme: 'light' | 'dark'): Record<string, string> {
  const start = CSS.indexOf(':root {');
  const body = CSS.slice(start, CSS.indexOf('}', start));
  return Object.fromEntries(
    [
      ...body.matchAll(
        /--color-([a-z-]+): light-dark\(\s*(#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\s*\);/gi,
      ),
    ].map((match) => [match[1], theme === 'light' ? match[2] : match[3]]),
  );
}

function evaluate(expression: string): string {
  const css = compileString(
    `@use 'luminance' as *;\nout { value: ${expression}; }`,
    { loadPaths: [STYLES] },
  ).css;
  return /value: ([^;]+);/.exec(css)?.[1] ?? '';
}

describe('luminance', () => {
  it('measures the WCAG ratio', () => {
    expect(Number(evaluate('contrast(#000, #fff)'))).toBeCloseTo(21, 5);
    expect(Number(evaluate('contrast(#777, #777)'))).toBe(1);
  });

  it('leaves a colour that already meets the ratio untouched', () => {
    expect(evaluate('contrast-floor(#000, (#fff,), 4.5)')).toBe('#000');
  });

  it('moves a failing colour just past the ratio, keeping its side', () => {
    const dark = evaluate('contrast-floor(#f87171, (#fdfdf7, #eeecec), 4.5)');
    expect(ratio(dark, '#fdfdf7')).toBeGreaterThanOrEqual(4.5);
    expect(ratio(dark, '#eeecec')).toBeGreaterThanOrEqual(4.5);
    expect(ratio(dark, '#eeecec')).toBeLessThan(4.6);
    const light = evaluate('contrast-floor(#545d6a, (#111217,), 3)');
    expect(luminance(light)).toBeGreaterThan(luminance('#111217'));
    expect(ratio(light, '#111217')).toBeGreaterThanOrEqual(3);
  });

  it('keeps the hue: chromaticity holds while the colour darkens', () => {
    const [r = -1, g = 1, b = 0] = channels(
      evaluate('contrast-floor(#0070f3, (#fdfdf7, #eeecec), 4.5)'),
    );
    expect(r).toBe(0);
    expect(b / g).toBeCloseTo(0xf3 / 0x70, 1);
  });

  it('crosses to the other side when its own side cannot reach', () => {
    const value = evaluate('contrast-floor(#808080, (#777777,), 4.6)');
    expect(luminance(value)).toBeLessThan(luminance('#777777'));
    expect(ratio(value, '#777777')).toBeGreaterThanOrEqual(4.6);
  });

  it('refuses a ratio neither side can reach', () => {
    expect(() => evaluate('contrast-floor(#808080, (#777,), 7)')).toThrow(
      /No colour reaches 7:1/,
    );
  });
});

describe('token contrast', () => {
  it.each(['dark', 'light'] as const)(
    '%s meets 4.5:1 for text and 3:1 for parts on page, surface and card',
    (theme) => {
      const colours = palette(theme);
      expect(Object.keys(colours).length).toBeGreaterThan(15);
      const grounds = [
        colours['bg'] ?? '',
        colours['surface'] ?? '',
        colours['bg-tertiary'] ?? '',
      ];
      for (const [names, floor] of [
        [TEXT, 4.5],
        [PARTS, 3],
      ] as const) {
        for (const name of names) {
          for (const ground of grounds) {
            expect(
              ratio(colours[name] ?? '', ground),
              name,
            ).toBeGreaterThanOrEqual(floor);
          }
        }
      }
    },
  );
});
