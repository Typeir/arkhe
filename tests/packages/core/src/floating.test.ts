import { FLOATING_GUTTER, floatingMachineProps } from '@arkhe/core';
import { describe, expect, it, vi } from 'vitest';

const base = { id: 'f', getRootNode: () => ({}) as Document };

describe('floatingMachineProps', () => {
  it('passes placement, strategy and the shared gutter', () => {
    expect(
      floatingMachineProps({ ...base, placement: 'top', strategy: 'fixed' })
        .positioning,
    ).toEqual({ placement: 'top', strategy: 'fixed', gutter: FLOATING_GUTTER });
  });

  it('leaves open state to Zag unless given', () => {
    const props = floatingMachineProps(base);
    expect(props).not.toHaveProperty('open');
    expect(props).not.toHaveProperty('defaultOpen');
    expect(
      floatingMachineProps({ ...base, defaultOpen: true }).defaultOpen,
    ).toBe(true);
  });

  it('reports plain open state', () => {
    const onOpenChange = vi.fn();
    floatingMachineProps({ ...base, onOpenChange }).onOpenChange({
      open: true,
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('holds open and swallows close requests', () => {
    const onOpenChange = vi.fn();
    const props = floatingMachineProps({
      ...base,
      open: false,
      hold: true,
      onOpenChange,
    });
    expect(props.open).toBe(true);
    props.onOpenChange({ open: false });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
