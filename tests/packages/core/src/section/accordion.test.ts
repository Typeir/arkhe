import {
  accordionAllOpen,
  accordionHeld,
  accordionReduce,
  type AccordionItem,
  type AccordionRules,
} from '@arkhe/core';
import { describe, expect, it } from 'vitest';

const ITEMS: readonly AccordionItem[] = [
  { value: 'a', title: 'A' },
  { value: 'b', title: 'B' },
  { value: 'c', title: 'C', disabled: true },
];
const [A, B, C] = ITEMS as [AccordionItem, AccordionItem, AccordionItem];
const RULES: AccordionRules = { items: ITEMS };
const set = (item: AccordionItem, open: boolean) =>
  ({ type: 'set', item, open }) as const;
const ALL = { type: 'toggle-all' } as const;

describe('accordionReduce: set', () => {
  it('opens and closes independently by default', () => {
    expect(accordionReduce(['a'], set(B, true), RULES)).toEqual(['a', 'b']);
    expect(accordionReduce(['a', 'b'], set(A, false), RULES)).toEqual(['b']);
  });

  it('closes the rest when one opens without multiple', () => {
    expect(
      accordionReduce(['a'], set(B, true), { ...RULES, multiple: false }),
    ).toEqual(['b']);
  });

  it('holds the last open section when not collapsible', () => {
    const open = ['a'];
    const held = { ...RULES, collapsible: false };
    expect(accordionReduce(open, set(A, false), held)).toBe(open);
    expect(accordionHeld(open, 'a', held)).toBe(true);
    expect(accordionHeld(open, 'a', RULES)).toBe(false);
  });

  it('leaves disabled sections and unchanged requests alone', () => {
    const open = ['a'];
    expect(accordionReduce(open, set(C, true), RULES)).toBe(open);
    expect(accordionReduce(open, set(A, true), RULES)).toBe(open);
  });
});

describe('accordionReduce: toggle-all', () => {
  it('opens every enabled section, then closes them', () => {
    expect(accordionAllOpen(ITEMS, ['a'])).toBe(false);
    const all = accordionReduce(['a'], ALL, RULES);
    expect(all).toEqual(['a', 'b']);
    expect(accordionAllOpen(ITEMS, all)).toBe(true);
    expect(accordionReduce(all, ALL, RULES)).toEqual([]);
  });

  it('keeps disabled sections as they were and one open when held', () => {
    expect(accordionReduce(['a', 'b', 'c'], ALL, RULES)).toEqual(['c']);
    expect(
      accordionReduce(['b', 'a'], ALL, { ...RULES, collapsible: false }),
    ).toEqual(['b']);
  });
});
