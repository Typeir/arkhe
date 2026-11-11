import { DEFAULT_LABELS, selectMachineProps } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

const BASE = {
  id: 's',
  label: 'Size',
  labels: DEFAULT_LABELS,
  getRootNode: () => document,
};

describe('selectMachineProps', () => {
  it('wraps the value, names the clear button and loops focus', () => {
    const props = selectMachineProps({ ...BASE, value: 'small' });
    expect(props.value).toEqual(['small']);
    expect(props.loopFocus).toBe(true);
    expect(props.translations.clearTriggerLabel).toBe('Clear Size');
    expect(props.positioning).toMatchObject({ placement: 'bottom-start' });
  });

  it('leaves unset props out so Zag keeps its defaults', () => {
    const props = selectMachineProps(BASE);
    expect('value' in props).toBe(false);
    expect('name' in props).toBe(false);
    expect(selectMachineProps({ ...BASE, value: null }).value).toEqual([]);
  });

  it('passes form and state props through', () => {
    expect(
      selectMachineProps({
        ...BASE,
        name: 'size',
        required: true,
        disabled: true,
        placement: 'top',
      }),
    ).toMatchObject({
      name: 'size',
      required: true,
      disabled: true,
      positioning: { placement: 'top' },
    });
  });
});
