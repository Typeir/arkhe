import { dialogMachineProps } from '@arkhe/core';
import { describe, expect, it, vi } from 'vitest';

const base = {
  id: 'd',
  onOpenChange: () => undefined,
  getRootNode: () => ({}) as Document,
};

describe('dialogMachineProps', () => {
  it('stays closed until ready', () => {
    expect(dialogMachineProps({ ...base, open: true, ready: false }).open).toBe(
      false,
    );
    expect(dialogMachineProps({ ...base, open: true }).open).toBe(true);
  });

  it('passes the role only when set', () => {
    expect(dialogMachineProps({ ...base, open: false })).not.toHaveProperty(
      'role',
    );
    expect(
      dialogMachineProps({ ...base, open: false, role: 'alertdialog' }).role,
    ).toBe('alertdialog');
  });

  it('reports plain open state', () => {
    const onOpenChange = vi.fn();
    dialogMachineProps({ ...base, open: false, onOpenChange }).onOpenChange({
      open: true,
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
