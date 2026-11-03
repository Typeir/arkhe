// @vitest-environment jsdom
import {
  FakeIntersectionObserver,
  FakeResizeObserver,
  placeAt,
  stubBrowser,
} from '@tests/fixtures/canvas';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ObserverHub,
  SizeWatcher,
  sizeOf,
} from '../../../../../packages/core/src/canvas/observers';

beforeEach(() => stubBrowser());
afterEach(() => vi.unstubAllGlobals());

describe('ObserverHub', () => {
  it('keeps one observer per margin and dispatches per element', () => {
    const hub = new ObserverHub();
    const [a, b] = [document.createElement('i'), document.createElement('b')];
    const seen: string[] = [];
    hub.observe(a, '100% 0px', (v) => seen.push(`a ${v}`));
    hub.observe(b, '100% 0px', (v) => seen.push(`b ${v}`));
    hub.observe(a, '0px', (v) => seen.push(`a0 ${v}`));
    expect(
      FakeIntersectionObserver.all.map((io) => io.init.rootMargin),
    ).toEqual(['100% 0px', '0px']);
    FakeIntersectionObserver.all[0]?.report(a, true);
    FakeIntersectionObserver.all[1]?.report(a, false);
    expect(seen).toEqual(['a true', 'a0 false']);
    hub.unobserve(a, '100% 0px');
    FakeIntersectionObserver.all[0]?.report(a, true);
    expect(seen).toHaveLength(2);
    hub.disconnect();
    expect(FakeIntersectionObserver.all[1]?.targets.size).toBe(0);
  });
});

describe('SizeWatcher', () => {
  it('skips the first report and reports only real changes, in one batch', () => {
    const changed = vi.fn();
    const watcher = new SizeWatcher(changed);
    const [a, b] = [document.createElement('i'), document.createElement('b')];
    placeAt(a, 0, 0, 10, 10);
    placeAt(b, 0, 0, 20, 20);
    watcher.watch(a);
    watcher.watch(b, sizeOf(b));
    const ro = FakeResizeObserver.all[0];
    ro?.fire();
    expect(changed).not.toHaveBeenCalled();
    placeAt(a, 0, 0, 11, 10);
    placeAt(b, 0, 0, 20, 21);
    ro?.fire();
    expect(changed).toHaveBeenCalledWith([a, b]);
    watcher.unwatch(a);
    expect(ro?.targets.has(a)).toBe(false);
    watcher.disconnect();
    expect(ro?.targets.size).toBe(0);
  });

  it('takes a size as known on update', () => {
    const watcher = new SizeWatcher(() => undefined);
    const a = document.createElement('i');
    placeAt(a, 0, 0, 1, 1);
    watcher.watch(a);
    expect(watcher.update(a)).toBe(false);
    placeAt(a, 0, 0, 2, 1);
    expect(watcher.update(a)).toBe(true);
    expect(watcher.update(a)).toBe(false);
  });
});
