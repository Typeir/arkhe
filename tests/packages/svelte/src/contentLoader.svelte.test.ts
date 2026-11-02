import type { LoadState } from '@arkhe/core';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import { useContentLoader } from '../../../../packages/svelte/src/contentLoader.svelte';

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('useContentLoader', () => {
  it('stays idle without a source', () => {
    const handle = useContentLoader(() => undefined);
    handle.load();
    expect(handle.state).toEqual({ status: 'idle' });
  });

  it('mirrors loading and ready into its state', async () => {
    const handle = useContentLoader(() => async () => 'card');
    handle.load();
    expect(handle.state.status).toBe('loading');
    await settle();
    expect(handle.state).toEqual({ status: 'ready', value: 'card' });
  });

  it('redraws an effect as the load moves on', async () => {
    const seen: LoadState<string>['status'][] = [];
    const source = async () => 'card';
    const cleanup = $effect.root(() => {
      const handle = useContentLoader(() => source);
      $effect(() => {
        seen.push(handle.state.status);
      });
      $effect(() => handle.load());
    });
    flushSync();
    await settle();
    flushSync();
    expect(seen.at(-1)).toBe('ready');
    expect(seen).toContain('loading');
    cleanup();
  });

  it('starts afresh when the source changes', async () => {
    let source = $state<() => Promise<string>>(async () => 'first');
    const handle = useContentLoader(() => source);
    handle.load();
    await settle();
    expect(handle.state).toEqual({ status: 'ready', value: 'first' });
    source = async () => 'second';
    expect(handle.state).toEqual({ status: 'idle' });
    handle.load();
    await settle();
    expect(handle.state).toEqual({ status: 'ready', value: 'second' });
  });
});
