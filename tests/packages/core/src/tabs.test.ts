import { resolveTabValue, slug, tabIds, tabsMachineProps } from '@arkhe/core';
import { describe, expect, it, vi } from 'vitest';

const ITEMS = [
  { value: 'stats', label: 'Stats' },
  { value: 'gear', label: 'Gear', disabled: true },
  { value: 'Spell list', label: 'Spells' },
];

describe('slug', () => {
  it('makes id-safe text and keeps look-alikes apart', () => {
    expect(slug('Spell list')).toMatch(/^spell-list-[a-z0-9]+$/);
    expect(slug('A b')).not.toBe(slug('a-b'));
    expect(slug('!!!')).toMatch(/^tab-/);
  });
});

describe('tabIds', () => {
  it('pairs trigger and content ids by value', () => {
    const ids = tabIds('t');
    expect(ids.trigger('Spell list')).toBe(`t-trigger-${slug('Spell list')}`);
    expect(ids.content('Spell list')).toBe(`t-content-${slug('Spell list')}`);
  });
});

describe('resolveTabValue', () => {
  it('keeps an enabled value', () => {
    expect(resolveTabValue('Spell list', ITEMS)).toBe('Spell list');
  });

  it('falls back to the first enabled tab and warns once per set', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const warned = new Set<string>();
    expect(resolveTabValue('gear', ITEMS, warned)).toBe('stats');
    expect(resolveTabValue('gear', ITEMS, warned)).toBe('stats');
    expect(warn).toHaveBeenCalledOnce();
    resolveTabValue('gear', ITEMS, new Set());
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('keeps no warning state of its own', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    resolveTabValue('lost', ITEMS);
    resolveTabValue('lost', ITEMS);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('uses the first enabled tab silently without a value', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(resolveTabValue(undefined, ITEMS)).toBe('stats');
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('tabsMachineProps', () => {
  const base = {
    id: 't',
    items: ITEMS,
    label: 'Sheet',
    getRootNode: () => ({}) as Document,
  };

  it('is controlled only with a value', () => {
    expect(tabsMachineProps({ ...base, value: 'stats' })).toMatchObject({
      value: 'stats',
    });
    const loose = tabsMachineProps({ ...base, defaultValue: 'Spell list' });
    expect(loose).toMatchObject({ defaultValue: 'Spell list' });
    expect(loose).not.toHaveProperty('value');
  });

  it('names the list and reports plain values', () => {
    const onValueChange = vi.fn();
    const props = tabsMachineProps({ ...base, onValueChange });
    expect(props.translations).toEqual({ listLabel: 'Sheet' });
    props.onValueChange({ value: 'stats' });
    expect(onValueChange).toHaveBeenCalledWith('stats');
  });
});
