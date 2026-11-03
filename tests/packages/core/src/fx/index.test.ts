// @vitest-environment jsdom
import { FxEngine, InertFx, createFx } from '@arkhe/core/fx';
import { stubBrowser, stubCanvas } from '@tests/fixtures/canvas';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe('createFx', () => {
  it('gives an inert engine where observers are missing', () => {
    expect(createFx()).toBeInstanceOf(InertFx);
  });

  it('gives an inert engine under forced colours', () => {
    stubBrowser((query) => query.includes('forced-colors'));
    expect(createFx()).toBeInstanceOf(InertFx);
  });

  it('builds the engine over the ruled defaults', () => {
    stubBrowser();
    stubCanvas();
    const fx = createFx({ maxFps: 60, surface: 'grouped' });
    expect(fx).toBeInstanceOf(FxEngine);
    expect((fx as FxEngine).opts).toMatchObject({
      maxFps: 60,
      surface: 'grouped',
      maxCanvases: 24,
    });
    fx.destroy();
  });
});
