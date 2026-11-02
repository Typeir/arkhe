import type { NumericMachineApi, NumericValue } from '@arkhe/core';
import { flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { useNumericSync } from '../../../../packages/svelte/src/numericSync.svelte';

describe('useNumericSync', () => {
  it('feeds each new controlled value to the sync', () => {
    const api: NumericMachineApi = {
      valueAsNumber: 1,
      setValue: vi.fn(),
      clearValue: vi.fn(),
    };
    let value = $state<NumericValue>(1);
    const cleanup = $effect.root(() => {
      useNumericSync(
        () => value,
        () => api,
      );
    });
    flushSync();
    value = 4;
    flushSync();
    expect(api.setValue).toHaveBeenCalledWith(4);
    value = null;
    flushSync();
    expect(api.clearValue).toHaveBeenCalled();
    cleanup();
  });
});
