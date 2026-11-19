import { SEARCH_DEBOUNCE, SearchRequest, type SearchState } from '@arkhe/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function setup() {
  const states: SearchState<string>[] = [];
  const request = new SearchRequest<string>((state) => states.push(state));
  const run = vi.fn(async (query: string, signal: AbortSignal) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (signal.aborted) throw new Error('aborted');
    return [`${query}!`];
  });
  return { states, request, run };
}

describe('SearchRequest', () => {
  it('waits out the debounce, then reports the results', async () => {
    const { states, request, run } = setup();
    request.query('gob', run);
    expect(states.at(-1)).toEqual({ items: [], loading: true, failed: false });
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE - 1);
    expect(run).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(100);
    expect(run).toHaveBeenCalledOnce();
    expect(states.at(-1)).toEqual({
      items: ['gob!'],
      loading: false,
      failed: false,
    });
  });

  it('runs only the latest of quick keystrokes and aborts a running one', async () => {
    const { states, request, run } = setup();
    request.query('g', run);
    request.query('go', run);
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE + 10);
    expect(run).toHaveBeenCalledTimes(1);
    const signal = run.mock.calls[0]?.[1];
    request.query('gob', run);
    expect(signal?.aborted).toBe(true);
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE + 100);
    expect(run.mock.calls.map(([query]) => query)).toEqual(['go', 'gob']);
    expect(states.at(-1)?.items).toEqual(['gob!']);
    expect(states.some((state) => state.items.includes('go!'))).toBe(false);
  });

  it('keeps the old results while the next ones load, and reports a failure', async () => {
    const { states, request } = setup();
    request.query('a', async () => ['A']);
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE);
    request.query('b', async () => Promise.reject(new Error('down')));
    expect(states.at(-1)).toEqual({
      items: ['A'],
      loading: true,
      failed: false,
    });
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE);
    expect(states.at(-1)).toEqual({ items: [], loading: false, failed: true });
  });

  it('reports nothing once disposed', async () => {
    const { states, request, run } = setup();
    request.query('gob', run);
    const count = states.length;
    request.dispose();
    await vi.advanceTimersByTimeAsync(1000);
    expect(run).not.toHaveBeenCalled();
    expect(states).toHaveLength(count);
  });
});
