import { ContentLoader } from '@arkhe/core';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useContentLoader } from '../../../../packages/react/src/useContentLoader';

describe('useContentLoader', () => {
  it('stays idle without a source', () => {
    const { result } = renderHook(() => useContentLoader(undefined));
    act(() => result.current.load());
    expect(result.current.state).toEqual({ status: 'idle' });
  });

  it('re-renders through loading to ready', async () => {
    const source = vi.fn(async () => 'card');
    const { result } = renderHook(() => useContentLoader(source));
    act(() => result.current.load());
    expect(result.current.state.status).toBe('loading');
    await waitFor(() =>
      expect(result.current.state).toEqual({ status: 'ready', value: 'card' }),
    );
  });

  it('starts afresh when the source changes, or arrives late', async () => {
    const { result, rerender } = renderHook(
      ({ source }) => useContentLoader(source),
      {
        initialProps: {
          source: undefined as (() => Promise<string>) | undefined,
        },
      },
    );
    rerender({ source: async () => 'first' });
    act(() => result.current.load());
    await waitFor(() =>
      expect(result.current.state).toEqual({ status: 'ready', value: 'first' }),
    );
    rerender({ source: async () => 'second' });
    expect(result.current.state).toEqual({ status: 'idle' });
    act(() => result.current.load());
    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: 'ready',
        value: 'second',
      }),
    );
  });

  it('subscribes once while the source stays the same', () => {
    const subscribe = vi.spyOn(ContentLoader.prototype, 'subscribe');
    const source = async () => 'card';
    const { rerender } = renderHook(() => useContentLoader(source));
    rerender();
    rerender();
    expect(subscribe).toHaveBeenCalledOnce();
  });
});
