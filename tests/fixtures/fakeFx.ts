/**
 * @fileoverview Stand-in for `@arkhe/core/fx`: an engine that only logs the
 * calls owners make, so port tests can check when each port calls
 * `attach`, `ready` and `detach`. Mock the module with it:
 * `vi.mock('@arkhe/core/fx', () => import('@tests/fixtures/fakeFx'))`.
 *
 * @module tests/fixtures/fakeFx
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import type { Fx } from '../../packages/core/src/fx/api';

/**
 * Every engine call, in order, as `name` or `name:host-text`.
 *
 * @constant FX_LOG
 * @type {string[]}
 */
export const FX_LOG: string[] = [];

/**
 * Whether `ready` reports the reveal at once (true) or holds it until
 * `finishReveals` (false).
 *
 * @constant FX_MODE
 * @type {{ instant: boolean }}
 */
export const FX_MODE = { instant: true };

const held: (() => void)[] = [];

/**
 * Ends every held reveal.
 *
 * @function finishReveals
 * @returns {void}
 */
export function finishReveals(): void {
  for (const done of held.splice(0)) done();
}

/**
 * Empties the log and the held reveals.
 *
 * @function resetFx
 * @returns {void}
 */
export function resetFx(): void {
  FX_LOG.length = 0;
  held.length = 0;
  FX_MODE.instant = true;
}

/**
 * Makes a logging engine.
 *
 * @function createFx
 * @returns {Fx} Engine.
 */
export function createFx(): Fx {
  return {
    attach: () => void FX_LOG.push('attach'),
    ready: (_host, onRevealed) => {
      FX_LOG.push('ready');
      if (!onRevealed) return;
      if (FX_MODE.instant) onRevealed();
      else held.push(onRevealed);
    },
    detach: () => void FX_LOG.push('detach'),
    stats: () => ({}),
    resetStats: () => undefined,
    destroy: () => void FX_LOG.push('destroy'),
  };
}
