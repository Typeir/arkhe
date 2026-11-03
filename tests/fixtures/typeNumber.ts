/**
 * @fileoverview Types into a number field one input event per prefix, the
 * way a browser reports typed text, a frame apart. Zag writes the input's
 * value and caret back one animation frame after each change; user-event
 * types faster than a frame and tracks its own caret, so in jsdom it drops
 * or reorders characters at random. Real Chromium does not, at any speed.
 *
 * @module tests/fixtures/typeNumber
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

/**
 * Fires an input event that sets the field's value; the framework's own
 * `fireEvent.input`, so React wraps it in `act` and Svelte flushes.
 *
 * @typedef {Function} FireInput
 */
export type FireInput = (
  element: Element,
  init: { target: { value: string } },
) => unknown;

/**
 * Appends `text` to the field's value, one character per input event. It
 * waits a frame before the first and after each, so Zag's write-back lands
 * between keystrokes as it does for a person typing.
 *
 * @function typeNumber
 * @param {HTMLElement} input - Number field input.
 * @param {string} text - Text to type.
 * @param {FireInput} fire - The test library's `fireEvent.input`.
 * @returns {Promise<void>} Resolves after the last event.
 */
export async function typeNumber(
  input: HTMLElement,
  text: string,
  fire: FireInput,
): Promise<void> {
  const frame = () =>
    new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
  await frame();
  const start = (input as HTMLInputElement).value;
  for (let end = 1; end <= text.length; end += 1) {
    await fire(input, { target: { value: start + text.slice(0, end) } });
    await frame();
  }
}
