import {
  DEFAULT_LABELS,
  LIVE_REGION_DELAY,
  STATUS_KINDS,
  announceOnMount,
  statusLook,
} from '@arkhe/core';
import { describe, expect, it, vi } from 'vitest';

function fakeRegion(isConnected = true) {
  const childNodes = ['icon', 'text'];
  return { isConnected, childNodes, append: vi.fn() };
}

describe('statusLook', () => {
  it.each([
    ['empty', 'inbox', 'status', DEFAULT_LABELS.statusEmpty],
    ['loading', 'loader', 'status', DEFAULT_LABELS.statusLoading],
    ['error', 'triangle-alert', 'alert', DEFAULT_LABELS.statusError],
    ['info', 'info', 'status', ''],
  ] as const)('maps %s', (kind, icon, role, text) => {
    expect(statusLook(kind, DEFAULT_LABELS)).toEqual({ icon, role, text });
  });

  it('covers every kind', () => {
    for (const kind of STATUS_KINDS)
      expect(statusLook(kind, DEFAULT_LABELS).icon).toBeTruthy();
  });
});

describe('announceOnMount', () => {
  it('re-inserts the children in order once the delay passes', () => {
    vi.useFakeTimers();
    const region = fakeRegion();
    announceOnMount(region as unknown as Element);
    vi.advanceTimersByTime(LIVE_REGION_DELAY - 1);
    expect(region.append).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(region.append).toHaveBeenCalledWith('icon', 'text');
    vi.useRealTimers();
  });

  it('does nothing once cancelled or detached', () => {
    vi.useFakeTimers();
    const cancelled = fakeRegion();
    announceOnMount(cancelled as unknown as Element, 10)();
    const detached = fakeRegion(false);
    announceOnMount(detached as unknown as Element, 10);
    vi.advanceTimersByTime(10);
    expect(cancelled.append).not.toHaveBeenCalled();
    expect(detached.append).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
