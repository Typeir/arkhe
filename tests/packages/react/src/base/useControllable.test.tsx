import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useControllable } from '../../../../../packages/react/src/base/useControllable';

describe('useControllable', () => {
  it('keeps its own state from the default and reports changes once', () => {
    const report = vi.fn();
    const { result } = renderHook(() =>
      useControllable({
        value: undefined,
        defaultValue: true,
        onChange: report,
      }),
    );
    expect(result.current.current).toBe(true);
    act(() => result.current.commit(true));
    expect(report).not.toHaveBeenCalled();
    act(() => result.current.commit(false));
    expect(result.current.current).toBe(false);
    expect(report).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('follows the value when controlled and reports without storing', () => {
    const report = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: boolean | undefined }) =>
        useControllable({ value, defaultValue: false, onChange: report }),
      { initialProps: { value: true as boolean | undefined } },
    );
    act(() => result.current.commit(false));
    expect(result.current.current).toBe(true);
    expect(report).toHaveBeenCalledExactlyOnceWith(false);
    rerender({ value: undefined });
    expect(result.current.current).toBe(false);
  });

  it('treats null as a controlled value', () => {
    const report = vi.fn();
    const { result } = renderHook(() =>
      useControllable<string | null>({
        value: null,
        defaultValue: 'a',
        onChange: report,
      }),
    );
    expect(result.current.current).toBeNull();
    act(() => result.current.commit('b'));
    expect(result.current.current).toBeNull();
    expect(report).toHaveBeenCalledExactlyOnceWith('b');
  });

  it('works without a callback', () => {
    const { result } = renderHook(() =>
      useControllable<readonly string[]>({
        value: undefined,
        defaultValue: [],
        onChange: undefined,
      }),
    );
    const next = ['a'];
    act(() => result.current.commit(next));
    expect(result.current.current).toBe(next);
  });
});
