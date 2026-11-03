/**
 * @fileoverview A touch tap as Chromium on Android dispatches it: the touch
 * pointer's events, `pointerleave` included once the finger lifts, then the
 * compatibility mouse events, focus on `mousedown`, and a `click`. Zag skips
 * touch pointers, so this is what Arkhé's own tap handling sees.
 *
 * @module tests/fixtures/tap
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { fireEvent, getConfig } from '@testing-library/dom';

const TOUCH = { pointerType: 'touch', pointerId: 7, isPrimary: true };

/**
 * Returns the element focus lands on when `target` is pressed: itself or
 * its nearest focusable ancestor.
 *
 * @function focusTarget
 * @param {Element} target - Pressed element.
 * @returns {HTMLElement | null} Element to focus, if any.
 */
function focusTarget(target: Element): HTMLElement | null {
  return target.closest<HTMLElement>(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]',
  );
}

/**
 * Taps `target` with one finger.
 *
 * @function tap
 * @param {Element} target - Element under the finger.
 * @returns {Promise<void>} Resolves a frame after the click.
 */
export async function tap(target: Element): Promise<void> {
  fireEvent.pointerOver(target, TOUCH);
  fireEvent.pointerEnter(target, TOUCH);
  fireEvent.pointerDown(target, { ...TOUCH, button: 0, buttons: 1 });
  fireEvent.pointerUp(target, { ...TOUCH, button: 0 });
  fireEvent.pointerOut(target, TOUCH);
  fireEvent.pointerLeave(target, TOUCH);
  fireEvent.mouseOver(target);
  fireEvent.mouseMove(target);
  fireEvent.mouseDown(target, { button: 0, buttons: 1 });
  const focusable = focusTarget(target);
  if (focusable) {
    getConfig().eventWrapper(() => focusable.focus());
  } else if (target.ownerDocument.activeElement instanceof HTMLElement) {
    const active = target.ownerDocument.activeElement;
    getConfig().eventWrapper(() => active.blur());
  }
  fireEvent.mouseUp(target, { button: 0 });
  fireEvent.click(target, { ...TOUCH, button: 0, detail: 1 });
  await getConfig().asyncWrapper(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve)),
      ),
  );
}
