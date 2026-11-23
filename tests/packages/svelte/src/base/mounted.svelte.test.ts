import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import {
  useLatch,
  useMounted,
} from '../../../../../packages/svelte/src/base/mounted.svelte';

describe('useMounted', () => {
  it('turns on once effects run', () => {
    let mounted: { current: boolean } | undefined;
    const cleanup = $effect.root(() => {
      mounted = useMounted();
    });
    expect(mounted?.current).toBe(false);
    flushSync();
    expect(mounted?.current).toBe(true);
    cleanup();
  });
});

describe('useLatch', () => {
  it('turns on the first time the condition holds and stays on', () => {
    let on = $state(false);
    let latch: { current: boolean } | undefined;
    const cleanup = $effect.root(() => {
      latch = useLatch(() => on);
    });
    flushSync();
    expect(latch?.current).toBe(false);
    on = true;
    flushSync();
    expect(latch?.current).toBe(true);
    on = false;
    flushSync();
    expect(latch?.current).toBe(true);
    cleanup();
  });

  it('turns on when raised', () => {
    let latch: { current: boolean; raise: () => void } | undefined;
    const cleanup = $effect.root(() => {
      latch = useLatch(() => false);
    });
    latch?.raise();
    flushSync();
    expect(latch?.current).toBe(true);
    cleanup();
  });
});
