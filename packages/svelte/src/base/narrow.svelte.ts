/**
 * @fileoverview useNarrow: whether the environment's window is phone-width,
 * kept current as it crosses. False on the server and until mounted.
 *
 * @module packages/svelte/src/narrow.svelte
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

import { isNarrow, watchNarrow } from '@arkhe/core';
import { useArkheEnvironment } from './environment.js';

/**
 * Reactive phone-width flag; read `current`.
 *
 * @interface Narrow
 * @property {boolean} current - True at phone width.
 */
export interface Narrow {
  readonly current: boolean;
}

/**
 * Tracks phone width. Call during component init.
 *
 * @function useNarrow
 * @returns {Narrow} Reactive flag.
 */
export function useNarrow(): Narrow {
  const env = useArkheEnvironment();
  let narrow = $state(false);
  $effect(() => {
    const root = env().getRootNode();
    narrow = isNarrow(root);
    return watchNarrow(root, () => (narrow = isNarrow(root)));
  });
  return {
    get current() {
      return narrow;
    },
  };
}
