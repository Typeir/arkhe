/**
 * @fileoverview Client flags of a component: whether it has mounted, and
 * whether a condition has held once. Both stay false on the server, so
 * server markup and the first client render agree.
 *
 * @module packages/svelte/src/base/mounted.svelte
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

/**
 * A reactive flag; read `current`.
 *
 * @interface Flag
 * @property {boolean} current - The flag.
 */
export interface Flag {
  readonly current: boolean;
}

/**
 * A flag that turns on once and stays on; read `current`.
 *
 * @interface Latch
 * @property {boolean} current - True from the first time the condition held or the latch was raised.
 * @property {() => void} raise - Turns the latch on now.
 */
export interface Latch extends Flag {
  readonly raise: () => void;
}

/**
 * Turns on once the component has mounted on the client. Call during
 * component initialisation.
 *
 * @function useMounted
 * @returns {Flag} Mount flag.
 */
export function useMounted(): Flag {
  let mounted = $state(false);
  const mount = () => {
    mounted = true;
  };
  $effect(mount);
  return {
    get current() {
      return mounted;
    },
  };
}

/**
 * Turns on the first time `read()` is true, before the DOM updates, and
 * stays on. Call during component initialisation.
 *
 * @function useLatch
 * @param {() => boolean} read - Reads the condition.
 * @returns {Latch} Latch.
 */
export function useLatch(read: () => boolean): Latch {
  let raised = $state(false);
  $effect.pre(() => {
    if (read()) raised = true;
  });
  return {
    get current() {
      return raised;
    },
    raise: () => {
      raised = true;
    },
  };
}
