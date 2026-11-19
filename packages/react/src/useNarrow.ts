/**
 * @fileoverview useNarrow: whether the environment's window is phone-width,
 * kept current as it crosses. False on the server and during hydration.
 *
 * @module packages/react/src/useNarrow
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

'use client';

import { isNarrow, watchNarrow } from '@arkhe/core';
import { useCallback, useSyncExternalStore } from 'react';
import { useArkheEnvironment } from './ArkheEnvironment.js';

/**
 * Returns whether the window is phone-width now.
 *
 * @function useNarrow
 * @returns {boolean} True at phone width.
 */
export function useNarrow(): boolean {
  const env = useArkheEnvironment();
  const subscribe = useCallback(
    (onChange: () => void) => watchNarrow(env.getRootNode(), onChange),
    [env],
  );
  return useSyncExternalStore(
    subscribe,
    () => isNarrow(env.getRootNode()),
    () => false,
  );
}
