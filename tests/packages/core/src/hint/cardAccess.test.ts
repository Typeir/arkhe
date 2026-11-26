// @vitest-environment jsdom
import {
  CardAccess,
  cardContentProps,
  cardTriggerAria,
  elementById,
  HintNode,
  REACT_EVENTS,
  SVELTE_EVENTS,
  tabbables,
} from '@arkhe/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

function page() {
  document.body.innerHTML = `
    <button id="before">Before</button>
    <button id="trigger">Trigger</button>
    <button id="after">After</button>
    <div id="positioner">
      <div id="card"><button id="pin">Pin</button><a id="more" href="#x">More</a></div>
    </div>`;
  const byId = (id: string) => {
    const element = elementById(document, id);
    if (!element) throw new Error(`No #${id}`);
    return element;
  };
  const node = new HintNode();
  const close = vi.fn();
  const release = vi.fn();
  const access = new CardAccess({
    getRootNode: () => document,
    trigger: () => byId('trigger'),
    content: () => byId('card'),
    node,
    close,
    release,
  });
  const stop = access.attach();
  return { byId, access, close, release, stop };
}

function press(target: Element, key: string, shiftKey = false) {
  const event = new KeyboardEvent('keydown', {
    key,
    shiftKey,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('cardContentProps', () => {
  it('drops the pointer leave only while pinned', () => {
    const leave = () => undefined;
    const props = { id: 'c', onPointerLeave: leave, onpointerleave: leave };
    expect(cardContentProps(props, false, REACT_EVENTS)).toBe(props);
    expect(cardContentProps(props, true, REACT_EVENTS)).toEqual({
      id: 'c',
      onpointerleave: leave,
    });
    expect(cardContentProps(props, true, SVELTE_EVENTS)).toEqual({
      id: 'c',
      onPointerLeave: leave,
    });
  });
});

describe('cardTriggerAria', () => {
  it('describes a link by the open body and never says expanded', () => {
    const base = { contentId: 'c', bodyId: 'b', inline: false };
    expect(cardTriggerAria({ ...base, link: true, open: true })).toEqual({
      'aria-describedby': 'b',
    });
    expect(cardTriggerAria({ ...base, link: true, open: false })).toEqual({
      'aria-describedby': undefined,
    });
  });

  it('gives buttons and inline text an expanded state', () => {
    expect(
      cardTriggerAria({
        link: false,
        inline: true,
        open: true,
        contentId: 'c',
        bodyId: 'b',
      }),
    ).toEqual({ role: 'button', 'aria-expanded': true, 'aria-controls': 'c' });
  });
});

describe('tabbables', () => {
  it('skips disabled, untabbable and hidden elements', () => {
    document.body.innerHTML = `
      <button id="a">A</button><button disabled>B</button>
      <span tabindex="-1">C</span><div hidden><button>D</button></div>
      <span id="e" tabindex="0">E</span>`;
    expect(tabbables(document).map((el) => el.id)).toEqual(['a', 'e']);
  });
});

describe('CardAccess', () => {
  it('proxies Tab into the card, back to the trigger, and on past it', () => {
    const { byId, stop } = page();
    byId('trigger')?.focus();
    expect(press(byId('trigger'), 'Tab').defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(byId('pin'));
    press(byId('pin'), 'Tab', true);
    expect(document.activeElement).toBe(byId('trigger'));
    byId('more')?.focus();
    press(byId('more'), 'Tab');
    expect(document.activeElement).toBe(byId('after'));
    stop();
  });

  it('closes an unpinned card when focus leaves it, not when it goes home', () => {
    const { byId, close, stop } = page();
    byId('pin')?.focus();
    byId('trigger')?.focus();
    expect(close).not.toHaveBeenCalled();
    byId('pin')?.focus();
    byId('before')?.focus();
    expect(close).toHaveBeenCalledOnce();
    stop();
  });

  it('releases the last pinned card on Escape and returns focus', () => {
    const { byId, access, release, stop } = page();
    access.pin(true);
    byId('more')?.focus();
    press(byId('more'), 'Escape');
    expect(release).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(byId('trigger'));
    stop();
  });

  it('leaves Escape to a menu open in the card before the menu takes focus', () => {
    const { byId, access, release, stop } = page();
    access.pin(true);
    const pin = byId('pin');
    pin.setAttribute('aria-haspopup', 'menu');
    pin.setAttribute('aria-expanded', 'true');
    pin.focus();
    press(pin, 'Escape');
    expect(release).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(pin);
    pin.setAttribute('aria-expanded', 'false');
    press(pin, 'Escape');
    expect(release).toHaveBeenCalledOnce();
    stop();
  });

  it('leaves Escape to an unpinned card and to the card pinned last', () => {
    const { byId, access, release, stop } = page();
    press(byId('trigger'), 'Escape');
    expect(release).not.toHaveBeenCalled();
    access.pin(true);
    const other = new CardAccess({
      getRootNode: () => document,
      trigger: () => byId('before'),
      content: () => byId('card'),
      node: new HintNode(),
      close: () => undefined,
      release: () => undefined,
    });
    other.pin(true);
    press(byId('trigger'), 'Escape');
    expect(release).not.toHaveBeenCalled();
    other.pin(false);
    stop();
  });
});
