import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useStableRecord } from '../../../../../packages/react/src/base/useStableRecord';

describe('useStableRecord', () => {
  it('keeps the first of equal records', () => {
    const first = { close: 'Sulje' };
    const { result, rerender } = renderHook(
      ({ record }) => useStableRecord(record),
      { initialProps: { record: first } },
    );
    rerender({ record: { close: 'Sulje' } });
    expect(result.current).toBe(first);
  });

  it('takes a record whose contents changed at once', () => {
    const { result, rerender } = renderHook(
      ({ record }: { record: object | undefined }) => useStableRecord(record),
      { initialProps: { record: { close: 'Sulje' } as object | undefined } },
    );
    const next = { close: 'Stäng' };
    rerender({ record: next });
    expect(result.current).toBe(next);
    rerender({ record: undefined });
    expect(result.current).toBeUndefined();
  });
});
