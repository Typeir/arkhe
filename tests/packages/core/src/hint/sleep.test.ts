import {
  REACT_EVENTS,
  sleepingTrigger,
  SVELTE_EVENTS,
  wakeHandlers,
  wakeOf,
} from '@arkhe/core';
import { describe, expect, it, vi } from 'vitest';

describe('sleepingTrigger', () => {
  it("builds Zag's closed trigger attributes", () => {
    expect(sleepingTrigger('tooltip', 'r1')).toEqual({
      id: 'tooltip:r1:trigger',
      'data-scope': 'tooltip',
      'data-part': 'trigger',
      'data-ownedby': 'r1',
      'data-state': 'closed',
    });
  });
});

describe('wakeOf', () => {
  it.each([
    [{ type: 'pointerover', pointerType: 'mouse' }, 'hover'],
    [{ type: 'pointerover', pointerType: 'pen' }, 'hover'],
    [{ type: 'pointerover', pointerType: 'touch' }, null],
    [{ type: 'pointerdown', pointerType: 'touch' }, 'touch'],
    [{ type: 'pointerdown', nativeEvent: { pointerType: 'touch' } }, 'touch'],
    [{ type: 'pointerdown', pointerType: 'mouse' }, 'hover'],
    [{ type: 'focus' }, 'focus'],
    [{ type: 'focusin' }, 'focus'],
    [{ type: 'click' }, null],
  ])('maps %o to %s', (event, expected) => {
    expect(wakeOf(event)).toBe(expected);
  });
});

describe('wakeHandlers', () => {
  it.each([
    [REACT_EVENTS, ['onPointerOver', 'onFocus', 'onPointerDown']],
    [SVELTE_EVENTS, ['onpointerover', 'onfocusin', 'onpointerdown']],
  ])('listens on the framework names', (names, keys) => {
    expect(Object.keys(wakeHandlers(names, () => undefined))).toEqual(keys);
  });

  it('wakes only for events that wake', () => {
    const wake = vi.fn();
    const handlers = wakeHandlers(REACT_EVENTS, wake);
    handlers.onPointerOver?.({ type: 'pointerover', pointerType: 'touch' });
    expect(wake).not.toHaveBeenCalled();
    handlers.onFocus?.({ type: 'focus' });
    expect(wake).toHaveBeenCalledWith('focus');
  });
});
