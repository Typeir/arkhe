// @vitest-environment jsdom
import {
  afterExit,
  REACT_EVENTS,
  sleepingTrigger,
  SVELTE_EVENTS,
  wakeOf,
  WakeWatch,
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

describe('WakeWatch', () => {
  it.each([
    [
      REACT_EVENTS,
      ['onPointerOver', 'onFocus', 'onPointerDown', 'onPointerOut'],
    ],
    [
      SVELTE_EVENTS,
      ['onpointerover', 'onfocusin', 'onpointerdown', 'onpointerout'],
    ],
  ])('listens on the framework names', (names, keys) => {
    expect(Object.keys(new WakeWatch(names, () => undefined).handlers)).toEqual(
      keys,
    );
  });

  it('wakes only for events that wake, and tracks the hovering pointer', () => {
    const wake = vi.fn();
    const watch = new WakeWatch(REACT_EVENTS, wake);
    const { onPointerOver, onPointerOut, onFocus } = watch.handlers;
    const trigger = document.createElement('span');
    const child = trigger.appendChild(document.createElement('b'));
    onPointerOver?.({ type: 'pointerover', pointerType: 'touch' });
    expect(wake).not.toHaveBeenCalled();
    expect(watch.hovering).toBe(false);
    onPointerOver?.({ type: 'pointerover', pointerType: 'mouse' });
    expect(wake).toHaveBeenCalledWith('hover');
    expect(watch.hovering).toBe(true);
    onPointerOut?.({
      type: 'pointerout',
      currentTarget: trigger,
      relatedTarget: child,
    });
    expect(watch.hovering).toBe(true);
    onPointerOut?.({
      type: 'pointerout',
      currentTarget: trigger,
      relatedTarget: document.body,
    });
    expect(watch.hovering).toBe(false);
    onFocus?.({ type: 'focus' });
    expect(wake).toHaveBeenLastCalledWith('focus');
  });

  it('leaves events from a nested trigger to that trigger', () => {
    const outer = document.createElement('span');
    outer.dataset.scope = 'tooltip';
    outer.dataset.part = 'trigger';
    const inner = outer.appendChild(document.createElement('span'));
    inner.dataset.scope = 'tooltip';
    inner.dataset.part = 'trigger';
    const wake = vi.fn();
    const { onPointerOver } = new WakeWatch(REACT_EVENTS, wake).handlers;
    onPointerOver?.({
      type: 'pointerover',
      pointerType: 'mouse',
      target: inner,
      currentTarget: outer,
    });
    expect(wake).not.toHaveBeenCalled();
    onPointerOver?.({
      type: 'pointerover',
      pointerType: 'mouse',
      target: outer,
      currentTarget: outer,
    });
    expect(wake).toHaveBeenCalledWith('hover');
  });
});

describe('WakeWatch press', () => {
  it('remembers the pointer kind of a waking press until reset', () => {
    const watch = new WakeWatch(REACT_EVENTS, () => undefined);
    expect(watch.press).toBeNull();
    watch.handlers.onPointerDown?.({
      type: 'pointerdown',
      pointerType: 'touch',
    });
    expect(watch.press).toBe('touch');
    watch.reset();
    expect(watch.press).toBeNull();
    expect(watch.hovering).toBe(false);
  });
});

describe('afterExit', () => {
  it('waits a frame and every running animation, and can be cancelled', async () => {
    const el = document.body.appendChild(document.createElement('div'));
    el.id = 'exit';
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    Object.assign(el, { getAnimations: () => [{ finished }] });
    const done = vi.fn();
    afterExit(document, 'exit', done);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await Promise.resolve();
    expect(done).not.toHaveBeenCalled();
    finish();
    await vi.waitFor(() => expect(done).toHaveBeenCalledTimes(1));
    const cancelled = vi.fn();
    afterExit(document, 'missing', cancelled)();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(cancelled).not.toHaveBeenCalled();
    el.remove();
  });
});
