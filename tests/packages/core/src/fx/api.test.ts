import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_FX_OPTIONS,
  InertFx,
  PAINTED_ATTR,
  canRunFx,
} from '../../../../../packages/core/src/fx/api';

describe('DEFAULT_FX_OPTIONS', () => {
  it('holds the ruled defaults', () => {
    expect(DEFAULT_FX_OPTIONS).toEqual({
      surface: 'auto',
      maxFps: 30,
      watchdog: true,
      painter: 'path',
      sleep: 'keep',
      wakeMargin: 1,
      maxCanvases: 24,
      pixelBudget: 4,
      bandScale: 1,
      maxDpr: 2,
    });
  });
});

describe('canRunFx', () => {
  it('is false outside a browser', () => {
    expect(canRunFx()).toBe(false);
  });
});

describe('InertFx', () => {
  it('reveals at once and touches nothing', () => {
    const fx = new InertFx();
    const done = vi.fn();
    const host = {} as HTMLElement;
    fx.attach();
    fx.ready(host, done);
    fx.ready(host);
    fx.detach();
    fx.resetStats();
    fx.destroy();
    expect(done).toHaveBeenCalledTimes(1);
    expect(fx.stats()).toMatchObject({ running: 0, liveCanvases: 0 });
    expect(PAINTED_ATTR).toBe('data-painted');
  });
});
