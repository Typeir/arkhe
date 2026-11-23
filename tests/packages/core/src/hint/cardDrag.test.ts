// @vitest-environment jsdom
import { CardDrag, KEY_STEP, SETTLE_MS } from '@arkhe/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function setUp() {
  document.body.innerHTML = `
    <button id="trigger">charge</button>
    <div data-part="frame">
      <div data-part="positioner">
        <div id="card" role="dialog">
          <div data-part="header">
            <button data-scope="menu" data-part="trigger" id="grip">grip</button>
            <span id="title">Charge</span>
            <button id="close">Close</button>
          </div>
        </div>
      </div>
    </div>`;
  const byId = (id: string) => document.getElementById(id) as HTMLElement;
  const frame = document.querySelector('[data-part="frame"]') as HTMLElement;
  const header = document.querySelector('[data-part="header"]') as HTMLElement;
  vi.spyOn(byId('card'), 'getBoundingClientRect').mockReturnValue(
    new DOMRect(100, 50, 200, 100),
  );
  let detached = false;
  const calls = { detach: 0, pin: 0, moved: 0 };
  const drag = new CardDrag({
    frame: () => frame,
    header: () => header,
    grip: () => byId('grip'),
    card: () => byId('card'),
    trigger: () => byId('trigger'),
    detached: () => detached,
    detach: () => {
      detached = true;
      calls.detach += 1;
    },
    pin: () => {
      calls.pin += 1;
    },
    moved: () => {
      calls.moved += 1;
    },
  });
  const stop = drag.attach();
  const at = () => [
    frame.style.getPropertyValue('--card-x'),
    frame.style.getPropertyValue('--card-y'),
  ];
  return { drag, stop, frame, header, byId, calls, at };
}

function pointer(target: EventTarget, type: string, x: number, y: number) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      button: 0,
      pointerId: 1,
      clientX: x,
      clientY: y,
    }),
  );
}

beforeEach(() => {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    value: 1000,
  });
  Object.defineProperty(document.documentElement, 'clientHeight', {
    configurable: true,
    value: 800,
  });
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('CardDrag: pointer', () => {
  it('waits 4px, then detaches and follows the grab point', () => {
    const { header, calls, at, stop } = setUp();
    pointer(header, 'pointerdown', 120, 60);
    pointer(window, 'pointermove', 122, 61);
    expect(calls.detach).toBe(0);
    pointer(window, 'pointermove', 220, 160);
    expect(calls.detach).toBe(1);
    expect(header.hasAttribute('data-dragging')).toBe(true);
    expect(at()).toEqual(['200px', '150px']);
    pointer(window, 'pointerup', 220, 160);
    expect(header.hasAttribute('data-dragging')).toBe(false);
    expect(calls.moved).toBe(1);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    header.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    stop();
  });

  it('ends a drag when the header loses pointer capture', () => {
    const { header, calls, stop } = setUp();
    pointer(header, 'pointerdown', 120, 60);
    pointer(window, 'pointermove', 220, 160);
    pointer(header, 'lostpointercapture', 220, 160);
    expect(header.hasAttribute('data-dragging')).toBe(false);
    expect(calls.moved).toBe(1);
    pointer(window, 'pointermove', 400, 300);
    expect(calls.detach).toBe(1);
    stop();
  });

  it('keeps the card inside the viewport', () => {
    const { header, at, stop } = setUp();
    pointer(header, 'pointerdown', 120, 60);
    pointer(window, 'pointermove', 5000, -400);
    expect(at()).toEqual(['800px', '0px']);
    stop();
  });

  it('never starts from a press on a header control other than the grip', () => {
    const { byId, calls, stop } = setUp();
    pointer(byId('close'), 'pointerdown', 280, 60);
    pointer(window, 'pointermove', 400, 200);
    expect(calls.detach).toBe(0);
    stop();
  });

  it('pins on a press of the grip that does not drag', () => {
    const { byId, calls, stop } = setUp();
    byId('grip').click();
    expect(calls.pin).toBe(1);
    stop();
  });
});

describe('CardDrag: keyboard, corners, Shift', () => {
  it('moves by 8px on an arrow, 32px with Shift, and announces once settled', () => {
    vi.useFakeTimers();
    const { byId, calls, at, stop } = setUp();
    const grip = byId('grip');
    const right = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    grip.dispatchEvent(right);
    expect(right.defaultPrevented).toBe(true);
    expect(calls.detach).toBe(1);
    expect(at()).toEqual([`${100 + KEY_STEP.small}px`, '50px']);
    grip.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        shiftKey: true,
        bubbles: true,
      }),
    );
    expect(at()).toEqual([
      `${100 + KEY_STEP.small}px`,
      `${50 + KEY_STEP.large}px`,
    ]);
    expect(calls.moved).toBe(0);
    vi.advanceTimersByTime(SETTLE_MS);
    expect(calls.moved).toBe(1);
    stop();
  });

  it('ignores arrows away from the grip', () => {
    const { byId, calls, stop } = setUp();
    byId('close').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    );
    expect(calls.detach).toBe(0);
    stop();
  });

  it('sends the card to a corner', () => {
    const { drag, calls, at, stop } = setUp();
    drag.moveToCorner('bottom-right');
    expect(calls.detach).toBe(1);
    expect(at()).toEqual(['792px', '692px']);
    stop();
  });

  it('pins when the pointer leaves the trigger or the card with Shift held', () => {
    const { byId, calls, stop } = setUp();
    byId('trigger').dispatchEvent(
      new PointerEvent('pointerleave', { shiftKey: true }),
    );
    byId('card').dispatchEvent(
      new PointerEvent('pointerleave', { shiftKey: true }),
    );
    byId('card').dispatchEvent(new PointerEvent('pointerleave'));
    expect(calls.pin).toBe(2);
    stop();
  });
});
