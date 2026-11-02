/**
 * @fileoverview Reads what the app announcer's live regions hold, for
 * component tests in both ports.
 *
 * @module tests/fixtures/announced
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import type { Politeness } from '@arkhe/core';

/**
 * Returns the text of every announcer region of `politeness`.
 *
 * @function announced
 * @param {Politeness} [politeness] - Region urgency. Defaults to `polite`.
 * @returns {string} Lines held, joined.
 */
export function announced(politeness: Politeness = 'polite'): string {
  const regions = document.querySelectorAll(
    `[data-live-announcer][data-politeness="${politeness}"]`,
  );
  return Array.from(regions, (region) => region.textContent).join('');
}
