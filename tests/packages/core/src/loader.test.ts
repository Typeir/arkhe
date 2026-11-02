import { ContentLoader } from '@arkhe/core';
import { describe, expect, it, vi } from 'vitest';

describe('ContentLoader', () => {
  it('moves from idle through loading to ready, once', async () => {
    const source = vi.fn(async () => 'card');
    const loader = new ContentLoader(source);
    const seen: string[] = [];
    loader.subscribe(() => seen.push(loader.snapshot().status));
    expect(loader.snapshot()).toEqual({ status: 'idle' });
    await Promise.all([loader.load(), loader.load()]);
    await loader.load();
    expect(loader.snapshot()).toEqual({ status: 'ready', value: 'card' });
    expect(seen).toEqual(['loading', 'ready']);
    expect(source).toHaveBeenCalledOnce();
  });

  it('makes a second caller wait for the load in flight', async () => {
    let finish: (value: string) => void = () => undefined;
    const loader = new ContentLoader(
      () => new Promise<string>((resolve) => (finish = resolve)),
    );
    const first = loader.load();
    const second = loader.load().then(() => loader.snapshot().status);
    finish('card');
    await first;
    expect(await second).toBe('ready');
  });

  it('keeps the snapshot object until the state changes', async () => {
    const loader = new ContentLoader(async () => 1);
    const first = loader.snapshot();
    expect(loader.snapshot()).toBe(first);
    await loader.load();
    expect(loader.snapshot()).not.toBe(first);
  });

  it('records a failure and retries on the next load', async () => {
    const source = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce('card');
    const loader = new ContentLoader(source);
    await loader.load();
    expect(loader.snapshot().status).toBe('error');
    await loader.load();
    expect(loader.snapshot()).toEqual({ status: 'ready', value: 'card' });
  });

  it('stops calling a listener after unsubscribe', async () => {
    const loader = new ContentLoader(async () => 1);
    const listener = vi.fn();
    loader.subscribe(listener)();
    await loader.load();
    expect(listener).not.toHaveBeenCalled();
  });
});
