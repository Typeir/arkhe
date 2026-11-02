/**
 * @fileoverview Svelte glue for `NumericSync`: one sync per field, fed each
 * new controlled value from an effect.
 *
 * @module packages/svelte/src/numericSync.svelte
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import {
  NumericSync,
  type NumericMachineApi,
  type NumericValue,
} from '@arkhe/core';
import { untrack } from 'svelte';

/**
 * Creates the field's sync and feeds it the controlled value on change.
 * Call during component initialisation.
 *
 * @function useNumericSync
 * @param {() => NumericValue | undefined} value - Reads the controlled value.
 * @param {() => NumericMachineApi} api - Reads the live Zag API.
 * @returns {NumericSync} Field sync.
 */
export function useNumericSync(
  value: () => NumericValue | undefined,
  api: () => NumericMachineApi,
): NumericSync {
  const sync = new NumericSync(api);
  $effect(() => {
    const next = value();
    untrack(() => sync.receive(next));
  });
  return sync;
}
