import {
  accordionAllOpen,
  accordionHeld,
  accordionToggle,
  accordionToggleAll,
  type AccordionItem,
} from '@arkhe/core';
import { describe, expect, it } from 'vitest';

const ITEMS: readonly AccordionItem[] = [
  { value: 'a', title: 'A' },
  { value: 'b', title: 'B' },
  { value: 'c', title: 'C', disabled: true },
];
const [A, B, C] = ITEMS as [AccordionItem, AccordionItem, AccordionItem];

describe('accordionToggle', () => {
  it('opens and closes independently by default', () => {
    expect(accordionToggle(['a'], B, true, {})).toEqual(['a', 'b']);
    expect(accordionToggle(['a', 'b'], A, false, {})).toEqual(['b']);
  });

  it('closes the rest when one opens without multiple', () => {
    expect(accordionToggle(['a'], B, true, { multiple: false })).toEqual(['b']);
  });

  it('holds the last open section when not collapsible', () => {
    const open = ['a'];
    expect(accordionToggle(open, A, false, { collapsible: false })).toBe(open);
    expect(accordionHeld(open, 'a', { collapsible: false })).toBe(true);
    expect(accordionHeld(open, 'a', {})).toBe(false);
  });

  it('leaves disabled sections and unchanged requests alone', () => {
    const open = ['a'];
    expect(accordionToggle(open, C, true, {})).toBe(open);
    expect(accordionToggle(open, A, true, {})).toBe(open);
  });
});

describe('accordionToggleAll', () => {
  it('opens every enabled section, then closes them', () => {
    expect(accordionAllOpen(ITEMS, ['a'])).toBe(false);
    const all = accordionToggleAll(ITEMS, ['a'], {});
    expect(all).toEqual(['a', 'b']);
    expect(accordionAllOpen(ITEMS, all)).toBe(true);
    expect(accordionToggleAll(ITEMS, all, {})).toEqual([]);
  });

  it('keeps disabled sections as they were and one open when held', () => {
    expect(accordionToggleAll(ITEMS, ['a', 'b', 'c'], {})).toEqual(['c']);
    expect(
      accordionToggleAll(ITEMS, ['b', 'a'], { collapsible: false }),
    ).toEqual(['b']);
  });
});
