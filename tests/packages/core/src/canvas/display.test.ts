// @vitest-environment jsdom
import { stubBrowser } from '@tests/fixtures/canvas';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DisplayWatcher,
  type DisplayChange,
} from '../../../../../packages/core/src/canvas/display';

const resize = (w: number, h: number) => {
  vi.stubGlobal('innerWidth', w);
  vi.stubGlobal('innerHeight', h);
  window.dispatchEvent(new Event('resize'));
};

let seen: DisplayChange[];
let watcher: DisplayWatcher;

beforeEach(() => {
  stubBrowser();
  vi.stubGlobal('devicePixelRatio', 3);
  vi.stubGlobal('innerWidth', 400);
  vi.stubGlobal('innerHeight', 800);
  seen = [];
  watcher = new DisplayWatcher(2, (change) => seen.push(change));
});

afterEach(() => {
  watcher.destroy();
  document.documentElement.removeAttribute('data-theme');
  vi.unstubAllGlobals();
});

describe('DisplayWatcher', () => {
  it('caps the DPR and caches the viewport', () => {
    expect(watcher.dpr).toBe(2);
    expect([watcher.viewW, watcher.viewH]).toEqual([400, 800]);
    expect(watcher.screenPixels).toBe(400 * 800 * 4);
  });

  it('tells a height-only resize from a width change', () => {
    resize(400, 700);
    expect(seen).toEqual(['height']);
    expect(watcher.viewH).toBe(700);
    resize(500, 700);
    expect(seen).toEqual(['height', 'size']);
    expect(watcher.viewW).toBe(500);
  });

  it('reports a theme attribute change', async () => {
    document.documentElement.dataset.theme = 'light';
    await Promise.resolve();
    expect(seen).toEqual(['theme']);
  });

  it('stops listening once destroyed', () => {
    watcher.destroy();
    resize(300, 300);
    expect(seen).toEqual([]);
  });
});
