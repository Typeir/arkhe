import {
  DEFAULT_LABELS,
  REACT_EVENTS,
  comboboxMachineProps,
  filterOptions,
  guardComboboxKeys,
  isGrouped,
  matchOption,
  optionCollection,
  queryAfterChange,
} from '@arkhe/core';
import { describe, expect, it, vi } from 'vitest';

const OPTIONS = [
  { value: 'fireball', label: 'Fireball', description: 'Level 3 evocation' },
  { value: 'paa', label: 'Pää', description: 'Head' },
  { value: 'ward', label: 'Ward', disabled: true },
];

describe('matching', () => {
  it('folds case and accents, and reads descriptions', () => {
    expect(matchOption(OPTIONS[1], 'paa')).toBe(true);
    expect(matchOption(OPTIONS[0], 'EVOC')).toBe(true);
    expect(matchOption(OPTIONS[0], 'ward')).toBe(false);
  });

  it('matches literally on a lone combining mark', () => {
    expect(matchOption(OPTIONS[0], '́')).toBe(false);
  });

  it('keeps everything for an empty query or a host-side filter', () => {
    expect(filterOptions(OPTIONS, '  ')).toHaveLength(3);
    expect(filterOptions(OPTIONS, 'zzz', false)).toHaveLength(3);
    expect(
      filterOptions(OPTIONS, 'fire').map((option) => option.value),
    ).toEqual(['fireball']);
    expect(
      filterOptions(OPTIONS, 'x', (option) => option.value === 'ward'),
    ).toEqual([OPTIONS[2]]);
  });

  it('filters only on typed text', () => {
    expect(queryAfterChange({ inputValue: 'fi', reason: 'input-change' })).toBe(
      'fi',
    );
    expect(
      queryAfterChange({ inputValue: 'Fireball', reason: 'item-select' }),
    ).toBe('');
  });
});

describe('optionCollection', () => {
  it('maps values, labels and disabled state', () => {
    const options = optionCollection(OPTIONS);
    expect(options.itemToValue(OPTIONS[0])).toBe('fireball');
    expect(options.itemToString(OPTIONS[0])).toBe('Fireball');
    expect(options.isItemDisabled(OPTIONS[2])).toBe(true);
    expect(options).not.toHaveProperty('groupBy');
  });

  it('groups only when an option names a group', () => {
    const grouped = [{ value: 'a', label: 'A', group: 'Spells' }, OPTIONS[0]];
    expect(isGrouped(grouped)).toBe(true);
    expect(isGrouped(OPTIONS)).toBe(false);
    expect(optionCollection(grouped).groupBy?.(OPTIONS[0])).toBe('');
  });
});

describe('comboboxMachineProps', () => {
  const base = {
    id: 'c',
    label: 'Spell',
    labels: DEFAULT_LABELS,
    getRootNode: () => ({}) as Document,
  };

  it('picks behaviour per job', () => {
    expect(comboboxMachineProps(base)).toMatchObject({
      selectionBehavior: 'replace',
      inputBehavior: 'autohighlight',
    });
    expect(
      comboboxMachineProps({ ...base, clearOnSelect: true, submits: true }),
    ).toMatchObject({ selectionBehavior: 'clear', inputBehavior: 'none' });
  });

  it('maps a single value to Zag arrays', () => {
    expect(comboboxMachineProps({ ...base, value: 'a' }).value).toEqual(['a']);
    expect(comboboxMachineProps({ ...base, value: null }).value).toEqual([]);
    expect(comboboxMachineProps(base)).not.toHaveProperty('value');
  });

  it('announces with Arkhé labels', () => {
    const { translations } = comboboxMachineProps(base);
    expect(translations.clearTriggerLabel).toBe('Clear Spell');
    expect(translations.resultsCount(1)).toBe('1 result');
    expect(translations.resultsCount(4)).toBe('4 results');
  });
});

describe('guardComboboxKeys', () => {
  function setup(highlighted: string | null, submit?: (text: string) => void) {
    const zag = vi.fn();
    const select = vi.fn();
    const props = guardComboboxKeys(
      { onKeyDown: zag },
      {
        highlighted: () => highlighted,
        inputValue: () => 'fire',
        select,
        submit,
      },
      REACT_EVENTS,
    ) as { onKeyDown: (event: Partial<KeyboardEvent>) => void };
    const press = (key: string, shiftKey = false, isComposing = false) => {
      const event = { key, shiftKey, isComposing, preventDefault: vi.fn() };
      props.onKeyDown(event);
      return event;
    };
    return { zag, select, press };
  }

  it('completes the highlighted option on Tab', () => {
    const { zag, select, press } = setup('fireball');
    expect(press('Tab').preventDefault).toHaveBeenCalled();
    expect(select).toHaveBeenCalledWith('fireball');
    expect(zag).not.toHaveBeenCalled();
  });

  it('lets Tab and Shift+Tab move focus when nothing is highlighted', () => {
    const { zag, select, press } = setup(null);
    press('Tab');
    expect(select).not.toHaveBeenCalled();
    expect(zag).toHaveBeenCalled();
    const highlighted = setup('fireball');
    highlighted.press('Tab', true);
    expect(highlighted.select).not.toHaveBeenCalled();
  });

  it('submits free text on Enter when nothing is highlighted', () => {
    const submit = vi.fn();
    const { zag, press } = setup(null, submit);
    press('Enter');
    expect(submit).toHaveBeenCalledWith('fire');
    expect(zag).not.toHaveBeenCalled();
  });

  it('leaves keys to Zag while an IME composes', () => {
    const submit = vi.fn();
    const { zag, select, press } = setup('fireball', submit);
    press('Tab', false, true);
    expect(select).not.toHaveBeenCalled();
    const empty = setup(null, submit);
    expect(
      empty.press('Enter', false, true).preventDefault,
    ).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
    expect(zag).toHaveBeenCalled();
  });

  it('leaves Enter to Zag when an option is highlighted', () => {
    const submit = vi.fn();
    const { zag, press } = setup('fireball', submit);
    press('Enter');
    expect(submit).not.toHaveBeenCalled();
    expect(zag).toHaveBeenCalled();
  });
});
