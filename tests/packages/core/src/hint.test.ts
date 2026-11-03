// @vitest-environment jsdom
import {
  REACT_EVENTS,
  hintTriggerProps,
  ownsEvent,
  watchOutsideTap,
  type HintEvent,
  type PointerMemory,
} from '@arkhe/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => document.body.replaceChildren());

function trigger(tag = 'span', scope = 'tooltip'): HTMLElement {
  const node = document.createElement(tag);
  node.dataset.scope = scope;
  node.dataset.part = 'trigger';
  document.body.append(node);
  return node;
}

function event(
  type: string,
  at: Element,
  pointerType?: string,
  target: Element = at,
): HintEvent & { prevented: boolean } {
  const record = {
    type,
    target,
    currentTarget: at,
    pointerType,
    prevented: false,
    preventDefault: () => {
      record.prevented = true;
    },
  };
  return record;
}

type Handler = (event: HintEvent) => void;

function setup(open: boolean, zag: Record<string, Handler> = {}) {
  const memory: PointerMemory = { current: undefined };
  const setOpen = vi.fn();
  const props = hintTriggerProps(zag, {
    open,
    setOpen,
    memory,
    names: REACT_EVENTS,
  }) as Record<string, Handler>;
  const fire = (name: string, hint: HintEvent) => props[name]?.(hint);
  return { props, setOpen, fire, memory };
}

describe('ownsEvent', () => {
  it('owns events from its own content', () => {
    const outer = trigger();
    const text = document.createElement('b');
    outer.append(text);
    expect(ownsEvent(event('pointermove', outer, 'mouse', text))).toBe(true);
  });

  it('leaves events from a nested trigger or hint to them', () => {
    const outer = trigger();
    const inner = trigger('span', 'hover-card');
    const card = document.createElement('span');
    card.dataset.scope = 'tooltip';
    card.dataset.part = 'positioner';
    outer.append(inner, card);
    expect(ownsEvent(event('focus', outer, undefined, inner))).toBe(false);
    expect(ownsEvent(event('pointermove', outer, 'mouse', card))).toBe(false);
  });
});

describe('hintTriggerProps', () => {
  it('passes mouse and keyboard events to Zag', () => {
    const onPointerMove = vi.fn();
    const onClick = vi.fn();
    const node = trigger();
    const { fire, setOpen } = setup(false, { onPointerMove, onClick });
    fire('onPointerMove', event('pointermove', node, 'mouse'));
    fire('onPointerDown', event('pointerdown', node, 'mouse'));
    fire('onClick', event('click', node));
    expect(onPointerMove).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
    expect(setOpen).not.toHaveBeenCalled();
  });

  it('keeps touch pointer events from Zag and toggles on the tap click', () => {
    const onPointerLeave = vi.fn();
    const onClick = vi.fn();
    const node = trigger();
    const { fire, setOpen } = setup(false, { onPointerLeave, onClick });
    fire('onPointerDown', event('pointerdown', node, 'touch'));
    fire('onPointerLeave', event('pointerleave', node, 'touch'));
    const click = event('click', node);
    fire('onClick', click);
    expect(onPointerLeave).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
    expect(setOpen).toHaveBeenCalledWith(true);
    expect(click.prevented).toBe(true);
  });

  it("reads the pointer kind from React's native click", () => {
    const node = trigger();
    const { fire, setOpen } = setup(true);
    fire('onClick', {
      ...event('click', node),
      nativeEvent: { pointerType: 'touch' },
    });
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('opens a link trigger on the first tap and follows it on the second', () => {
    const link = trigger('a', 'hover-card');
    link.setAttribute('href', '#rule');
    const closed = setup(false);
    const first = event('click', link, 'touch');
    closed.fire('onClick', first);
    expect(first.prevented).toBe(true);
    expect(closed.setOpen).toHaveBeenCalledWith(true);
    const opened = setup(true);
    const second = event('click', link, 'touch');
    opened.fire('onClick', second);
    expect(second.prevented).toBe(false);
    expect(opened.setOpen).not.toHaveBeenCalled();
  });

  it('ignores a tap that started on a nested trigger', () => {
    const outer = trigger();
    const inner = trigger();
    outer.append(inner);
    const { fire, setOpen } = setup(false);
    fire('onPointerDown', event('pointerdown', outer, 'touch', inner));
    fire('onClick', event('click', outer, undefined, inner));
    expect(setOpen).not.toHaveBeenCalled();
  });
});

describe('watchOutsideTap', () => {
  const touch = (target: Element, pointerType = 'touch') =>
    target.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerType }),
    );

  it('closes on a touch outside its elements, until stopped', () => {
    const own = trigger();
    own.id = 'own';
    const outside = document.createElement('p');
    document.body.append(outside);
    const close = vi.fn();
    const stop = watchOutsideTap(document, ['own', 'missing'], close);
    touch(own);
    touch(outside, 'mouse');
    expect(close).not.toHaveBeenCalled();
    touch(outside);
    expect(close).toHaveBeenCalledOnce();
    stop();
    touch(outside);
    expect(close).toHaveBeenCalledOnce();
  });
});
