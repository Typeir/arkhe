import { HintNode } from '@arkhe/core';
import { flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { useHint } from '../../../../packages/svelte/src/hint.svelte';

describe('useHint', () => {
  it('mounts the body on first open and keeps it after', () => {
    let open = $state(false);
    let hint: { mounted: boolean } | undefined;
    const cleanup = $effect.root(() => {
      hint = useHint(() => ({
        open,
        setOpen: () => undefined,
        trigger: { id: 'trigger' },
        positionerId: 'positioner',
        getRootNode: () => document,
        node: new HintNode(),
        leaving: () => false,
      }));
    });
    flushSync();
    expect(hint?.mounted).toBe(false);
    open = true;
    flushSync();
    expect(hint?.mounted).toBe(true);
    open = false;
    flushSync();
    expect(hint?.mounted).toBe(true);
    cleanup();
  });

  it('closes on a touch outside while open, and wraps the trigger props', () => {
    const setOpen = vi.fn();
    let hint: { trigger: Record<string, unknown> } | undefined;
    const cleanup = $effect.root(() => {
      hint = useHint(() => ({
        open: true,
        setOpen,
        trigger: { id: 'trigger' },
        positionerId: 'positioner',
        getRootNode: () => document,
        node: new HintNode(),
        leaving: () => false,
      }));
    });
    flushSync();
    expect(hint?.trigger.id).toBe('trigger');
    expect(typeof hint?.trigger.onclick).toBe('function');
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }),
    );
    expect(setOpen).toHaveBeenCalledWith(false);
    cleanup();
  });
});
