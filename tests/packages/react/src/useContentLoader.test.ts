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
});
