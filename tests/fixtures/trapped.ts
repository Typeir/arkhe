/**
 * @fileoverview Waits for a dialog's focus trap. Zag arms the trap one frame
 * after the dialog mounts, and only an armed trap returns focus on close, so
 * a test that closes the dialog sooner races the frame.
 *
 * @module tests/fixtures/trapped
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.1
 */

import { expect, vi } from 'vitest';

/**
 * Resolves once `dialog` holds focus, which the armed trap gives it.
 *
 * @function trapped
 * @param {HTMLElement} dialog - The open dialog.
 * @returns {Promise<void>} Settles when focus is inside `dialog`.
 */
export async function trapped(dialog: HTMLElement): Promise<void> {
  await vi.waitFor(() => {
    expect(dialog.contains(dialog.ownerDocument.activeElement)).toBe(true);
  });
}
