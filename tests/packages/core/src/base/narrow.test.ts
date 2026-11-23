// @vitest-environment jsdom
import { isNarrow, NARROW_QUERY, watchNarrow } from '@arkhe/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

function fakeQuery(matches: boolean) {
  const listeners = new Set<() => void>();
  const query = {
    matches,
    addEventListener: (_: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      listeners.delete(listener),
  };
  const matchMedia = vi.fn(() => query);
  vi.stubGlobal('matchMedia', matchMedia);
  return { query, listeners, matchMedia };
}

afterEach(() => vi.unstubAllGlobals());

describe('narrow', () => {
  it('reads phone width from the window', () => {
    const { matchMedia } = fakeQuery(true);
    expect(isNarrow(document)).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith(NARROW_QUERY);
  });

  it('watches crossings and stops', () => {
    const { listeners } = fakeQuery(false);
    const onChange = vi.fn();
    const stop = watchNarrow(document, onChange);
    for (const listener of listeners) listener();
    expect(onChange).toHaveBeenCalledOnce();
    stop();
    expect(listeners.size).toBe(0);
  });

  it('is wide where the window has no matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(isNarrow(document)).toBe(false);
    expect(() => watchNarrow(document, () => undefined)()).not.toThrow();
  });
});
