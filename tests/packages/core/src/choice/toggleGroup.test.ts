import {
  type ToggleItem,
  toggleReduce,
  toggleRootAttrs,
  toggleShown,
} from '@arkhe/core';
import { describe, expect, it } from 'vitest';

const ITEMS: readonly ToggleItem[] = [
  { value: 'fire', label: 'Fire' },
  { value: 'frost', label: 'Frost' },
  { value: 'storm', label: 'Storm' },
  { value: 'void', label: 'Void', disabled: true },
];
const [FIRE, FROST, , VOID] = ITEMS as [
  ToggleItem,
  ToggleItem,
  ToggleItem,
  ToggleItem,
];

describe('toggleRootAttrs', () => {
  it('makes a horizontal toolbar with a wrapping focusgroup', () => {
    expect(toggleRootAttrs('Aspects')).toEqual({
      role: 'toolbar',
      'aria-label': 'Aspects',
      'aria-orientation': undefined,
      focusgroup: 'toolbar wrap',
      'data-orientation': 'horizontal',
    });
  });

  it('moves along the block axis when vertical', () => {
    expect(toggleRootAttrs('Tools', 'vertical')).toMatchObject({
      'aria-orientation': 'vertical',
      focusgroup: 'toolbar wrap block',
    });
  });
});

describe('toggleReduce', () => {
  const press = (item: ToggleItem) => ({ type: 'press', item }) as const;

  it('adds and removes under multiple', () => {
    const on = toggleReduce([], press(FIRE), { multiple: true });
    expect(on).toEqual(['fire']);
    expect(toggleReduce(on, press(FROST), { multiple: true })).toEqual([
      'fire',
      'frost',
    ]);
    expect(
      toggleReduce(['fire', 'frost'], press(FIRE), { multiple: true }),
    ).toEqual(['frost']);
  });

  it('takes over when single, releasing only when deselectable', () => {
    expect(toggleReduce(['fire'], press(FROST), {})).toEqual(['frost']);
    const held = ['fire'];
    expect(toggleReduce(held, press(FIRE), {})).toBe(held);
    expect(toggleReduce(held, press(FIRE), { deselectable: true })).toEqual([]);
  });

  it('ignores a disabled toggle', () => {
    const held = ['fire'];
    expect(toggleReduce(held, press(VOID), { multiple: true })).toBe(held);
  });

  it('clears, returning the same array when nothing is pressed', () => {
    expect(toggleReduce(['fire', 'frost'], { type: 'clear' }, {})).toEqual([]);
    const none: readonly string[] = [];
    expect(toggleReduce(none, { type: 'clear' }, {})).toBe(none);
  });
});
describe('toggleShown', () => {
  it('shows everything without a limit or once expanded', () => {
    expect(toggleShown(ITEMS, [], undefined, false)).toBe(ITEMS);
    expect(toggleShown(ITEMS, [], 2, true)).toBe(ITEMS);
  });

  it('keeps pressed items past the limit, in order', () => {
    expect(
      toggleShown(ITEMS, ['void'], 2, false).map((item) => item.value),
    ).toEqual(['fire', 'frost', 'void']);
  });
});
