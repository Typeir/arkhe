// @vitest-environment jsdom
import {
  DEFAULT_FX_OPTIONS,
  PAINTED_ATTR,
  type FxOptions,
} from '@arkhe/core/fx';
import {
  FakeResizeObserver,
  placeAt,
  reportAll,
  stubBrowser,
  stubCanvas,
} from '@tests/fixtures/canvas';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SENTINEL_ATTR } from '../../../../../packages/core/src/canvas/tile';
import { VIEWPORT_ATTR } from '../../../../../packages/core/src/canvas/viewport';
import { FxEngine } from '../../../../../packages/core/src/fx/engine';

const SHAPE = 'data-scope="skeleton" data-part="root"';
let frames: FrameRequestCallback[];
let engine: FxEngine | null;

const make = (over: Partial<FxOptions> = {}) =>
  (engine = new FxEngine({
    ...DEFAULT_FX_OPTIONS,
    surface: 'grouped',
    ...over,
  }));

const owner = () => {
  document.body.innerHTML = `<div id="h" data-scope="skeleton" data-part="group"><span id="a" ${SHAPE}></span><span id="b" ${SHAPE}></span></div>`;
  const host = document.getElementById('h') as HTMLElement;
  placeAt(host, 0, 0, 300, 100);
  placeAt(document.getElementById('a') as HTMLElement, 0, 0, 120, 12);
  placeAt(document.getElementById('b') as HTMLElement, 0, 20, 300, 12);
  return host;
};

const sentinel = (host: HTMLElement) =>
  host.querySelector(`[${SENTINEL_ATTR}]`) as HTMLElement;

const step = () => {
  const next = frames.splice(0);
  for (const cb of next) cb(performance.now());
};

const flush = () => new Promise((resolve) => setTimeout(resolve));

beforeEach(() => {
  frames = [];
  engine = null;
  stubCanvas();
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) =>
    frames.push(cb),
  );
  vi.stubGlobal('cancelAnimationFrame', () => (frames = []));
});

afterEach(() => {
  engine?.destroy();
  vi.unstubAllGlobals();
  sessionStorage.clear();
  document.body.replaceChildren();
});

describe('FxEngine', () => {
  beforeEach(() => stubBrowser());

  it('measures an owner on attach, positioned, with one sentinel per tile', () => {
    const host = owner();
    make().attach(host);
    expect(host.style.position).toBe('relative');
    expect(host.querySelectorAll(`[${SENTINEL_ATTR}]`)).toHaveLength(1);
    expect(host.querySelector('canvas')).toBeNull();
    expect(engine?.stats()).toMatchObject({ regions: 1, viewport: 0 });
  });

  it('marks the owner painted once a canvas has drawn it, not before', async () => {
    const host = owner();
    make().attach(host);
    reportAll(sentinel(host), true);
    expect(host.querySelector('canvas')).not.toBeNull();
    await flush();
    expect(host.hasAttribute(PAINTED_ATTR)).toBe(false);
    step();
    await flush();
    expect(host.hasAttribute(PAINTED_ATTR)).toBe(true);
  });

  it('drops an owner on detach without revealing', async () => {
    const host = owner();
    const revealed = vi.fn();
    make().attach(host);
    reportAll(sentinel(host), true);
    engine?.ready(host, revealed);
    engine?.detach(host);
    await flush();
    expect(revealed).not.toHaveBeenCalled();
    expect(host.querySelector('canvas,[data-canvas-sentinel]')).toBeNull();
    expect(engine?.stats().regions).toBe(0);
  });

  it('reveals at once when it never attached', () => {
    const revealed = vi.fn();
    make().ready(owner(), revealed);
    expect(revealed).toHaveBeenCalledTimes(1);
  });

  it('re-measures on a second attach', () => {
    const host = owner();
    make().attach(host);
    const first = sentinel(host);
    engine?.attach(host);
    expect(first.isConnected).toBe(false);
    expect(host.querySelectorAll(`[${SENTINEL_ATTR}]`)).toHaveLength(1);
  });

  it('snaps a running reveal to its end when the owner resizes after the swap', async () => {
    const host = owner();
    const revealed = vi.fn();
    make().attach(host);
    reportAll(sentinel(host), true);
    engine?.ready(host, revealed);
    placeAt(host, 0, 0, 300, 140);
    for (const ro of FakeResizeObserver.all) ro.fire();
    step();
    await flush();
    expect(revealed).toHaveBeenCalledTimes(1);
    expect(engine?.stats().regions).toBe(0);
  });

  it('puts page-level owners on the viewport canvas on software raster', () => {
    const host = owner();
    make({ surface: 'auto' }).attach(host);
    expect(document.querySelector(`[${VIEWPORT_ATTR}]`)).not.toBeNull();
    expect(host.querySelector(`[${SENTINEL_ATTR}]`)).toBeNull();
    expect(engine?.stats().viewport).toBe(1);
  });

  it('leaves nothing behind on destroy', async () => {
    const host = owner();
    make({ surface: 'viewport' }).attach(host);
    reportAll(host, true);
    step();
    await flush();
    expect(host.hasAttribute(PAINTED_ATTR)).toBe(true);
    engine?.destroy();
    engine = null;
    expect(host.hasAttribute(PAINTED_ATTR)).toBe(false);
    expect(document.querySelector('canvas')).toBeNull();
  });
});

describe('FxEngine under reduced motion', () => {
  beforeEach(() => stubBrowser((query) => query.includes('reduced-motion')));

  it('reveals in the ready task and reports it once the canvas is gone', async () => {
    const host = owner();
    const revealed = vi.fn();
    make().attach(host);
    reportAll(sentinel(host), true);
    engine?.ready(host, revealed);
    await flush();
    expect(revealed).toHaveBeenCalledTimes(1);
    expect(host.querySelector('canvas,[data-canvas-sentinel]')).toBeNull();
    expect(frames.length === 0 || engine?.stats().running === 1).toBe(true);
  });
});
