// @vitest-environment jsdom
import { FxLoader, type FxModule } from '@arkhe/core';
import { InertFx } from '@arkhe/core/fx';
import { describe, expect, it, vi } from 'vitest';

const module = () => {
  const engine = new InertFx();
  const destroy = vi.spyOn(engine, 'destroy');
  const createFx = vi.fn(() => engine);
  const load = vi.fn(async (): Promise<FxModule> => ({ createFx }));
  return { engine, destroy, createFx, load };
};

describe('FxLoader', () => {
  it('loads the engine once, with its options, on first request', async () => {
    const { engine, createFx, load } = module();
    const loader = new FxLoader({ maxFps: 60 }, load);
    expect(loader.engine).toBeNull();
    expect(load).not.toHaveBeenCalled();
    const [a, b] = await Promise.all([loader.request(), loader.request()]);
    expect(a).toBe(engine);
    expect(b).toBe(engine);
    expect(await loader.request()).toBe(engine);
    expect(loader.engine).toBe(engine);
    expect(load).toHaveBeenCalledTimes(1);
    expect(createFx).toHaveBeenCalledWith({ maxFps: 60 });
  });

  it('never loads when effects are off', async () => {
    const { load } = module();
    const loader = new FxLoader(false, load);
    expect(await loader.request()).toBeNull();
    expect(load).not.toHaveBeenCalled();
  });

  it('resolves to null when loading fails, and may retry', async () => {
    const { engine, createFx } = module();
    const load = vi
      .fn<() => Promise<FxModule>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ createFx });
    const loader = new FxLoader({}, load);
    expect(await loader.request()).toBeNull();
    expect(await loader.request()).toBe(engine);
  });

  it('destroys the engine once the last mount undoes', async () => {
    const { destroy, load } = module();
    const loader = new FxLoader({}, load);
    const first = loader.mount();
    const second = loader.mount();
    await loader.request();
    first();
    first();
    expect(destroy).not.toHaveBeenCalled();
    second();
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(loader.engine).toBeNull();
  });
});
