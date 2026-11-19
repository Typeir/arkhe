/**
 * @fileoverview Gives a jsdom element the box a browser would: a visible
 * height and a scroll offset that can be set. Tests fire the scroll event
 * through their own framework's `fireEvent`.
 *
 * @module tests/fixtures/scrollBox
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

/**
 * Sets `box`'s visible height and makes its scroll offset writable.
 *
 * @function sizeBox
 * @param {Element} box - Scroll box.
 * @param {number} height - Visible height in px.
 * @returns {HTMLElement} The box.
 */
export function sizeBox(box: Element, height: number): HTMLElement {
  Object.defineProperty(box, 'clientHeight', {
    value: height,
    configurable: true,
  });
  Object.defineProperty(box, 'scrollTop', {
    value: 0,
    writable: true,
    configurable: true,
  });
  return box as HTMLElement;
}
