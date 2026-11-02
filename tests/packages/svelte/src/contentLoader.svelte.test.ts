import { describe, expect, it } from 'vitest';
import { useContentLoader } from '../../../../packages/svelte/src/contentLoader.svelte';

describe('useContentLoader', () => {
  it('stays idle without a source', () => {
    const handle = useContentLoader(undefined);
    handle.load();
    expect(handle.state).toEqual({ status: 'idle' });
  });

  it('mirrors loading and ready into its state', async () => {
    const handle = useContentLoader(async () => 'card');
    handle.load();
    expect(handle.state.status).toBe('loading');
    await Promise.resolve();
    await Promise.resolve();
    expect(handle.state).toEqual({ status: 'ready', value: 'card' });
  });
});
