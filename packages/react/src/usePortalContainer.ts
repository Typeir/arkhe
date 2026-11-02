/**
 * @fileoverview The environment's portal target as the ref object Zag's
 * React `Portal` expects, read lazily so a pop-out window can swap it.
 *
 * @module packages/react/src/usePortalContainer
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import { useMemo, type RefObject } from 'react';
import { useArkheEnvironment } from './ArkheEnvironment';

/**
 * Returns a ref whose `current` is the environment's portal target.
 *
 * @function usePortalContainer
 * @returns {RefObject<HTMLElement>} Lazy container ref.
 */
export function usePortalContainer(): RefObject<HTMLElement> {
  const env = useArkheEnvironment();
  return useMemo(
    () =>
      ({
        get current() {
          return env.container() ?? null;
        },
      }) as RefObject<HTMLElement>,
    [env],
  );
}
