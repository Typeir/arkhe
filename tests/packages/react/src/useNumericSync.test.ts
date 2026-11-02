import type { NumericMachineApi } from '@arkhe/core';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useNumericSync } from '../../../../packages/react/src/useNumericSync';

function fakeApi(value: number): NumericMachineApi {
  return { valueAsNumber: value, setValue: vi.fn(), clearValue: vi.fn() };
}

describe('useNumericSync', () => {
  it('keeps one sync and feeds it new values against the tracked api', () => {
    const api = fakeApi(1);
    const { result, rerender } = renderHook(
      ({ value }) => {
        const handle = useNumericSync(value);
        handle.track(api);
        return handle;
      },
      { initialProps: { value: 1 as number | null } },
    );
    const first = result.current.sync;
    rerender({ value: 4 });
    expect(result.current.sync).toBe(first);
    expect(api.setValue).toHaveBeenCalledWith(4);
  });

  it('returns the api it tracks', () => {
    const api = fakeApi(0);
    const { result } = renderHook(() => useNumericSync(undefined));
    expect(result.current.track(api)).toBe(api);
  });
});
