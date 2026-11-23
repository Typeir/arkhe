/**
 * @fileoverview Puts jsdom at phone width or back: a `matchMedia` stub whose
 * phone-width query matches while `narrow` is on, and tells listeners when
 * it flips.
 *
 * @module tests/fixtures/narrow
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

import { NARROW_QUERY } from '@arkhe/core';
import { vi } from 'vitest';

/**
 * Listeners the stubbed media query holds.
 *
 * @constant listeners
 * @type {Set<() => void>}
 */
const listeners = new Set<() => void>();
/**
 * Whether the stubbed viewport is phone width now.
 *
 * @type {boolean}
 */
let narrow = false;

/**
 * Stubs `matchMedia` and sets phone width on or off.
 *
 * @function setNarrow
 * @param {boolean} on - Phone width.
 * @returns {void}
 */
export function setNarrow(on: boolean): void {
  narrow = on;
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === NARROW_QUERY && narrow,
    addEventListener: (_: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      listeners.delete(listener),
  }));
  for (const listener of [...listeners]) listener();
}

/**
 * Removes the stub and forgets every listener.
 *
 * @function resetNarrow
 * @returns {void}
 */
export function resetNarrow(): void {
  narrow = false;
  listeners.clear();
  vi.unstubAllGlobals();
}
