/**
 * @fileoverview What Tooltip and HoverCard share in the Svelte port: a body
 * mounted on first open and kept after, and tap handling on the trigger.
 *
 * @module packages/svelte/src/hint.svelte
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import {
  SVELTE_EVENTS,
  hintTriggerProps,
  watchOutsideTap,
  type PointerMemory,
  type RootNode,
} from '@arkhe/core';
import { untrack } from 'svelte';

/**
 * What `useHint` reads.
 *
 * @interface HintInput
 * @template {object} P
 * @property {boolean} open - Whether Zag shows the hint.
 * @property {(open: boolean) => void} setOpen - Opens or closes it from a tap.
 * @property {P & { id?: string | null }} trigger - Zag's trigger props.
 * @property {string} positionerId - Id of the hint's positioner.
 * @property {() => RootNode} getRootNode - Root node holding trigger and hint.
 */
export interface HintInput<P extends object> {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly trigger: P & { readonly id?: string | null };
  readonly positionerId: string;
  readonly getRootNode: () => RootNode;
}

/**
 * What `useHint` returns; both fields are reactive.
 *
 * @interface Hint
 * @template {object} P
 * @property {P} trigger - Trigger props with tap handling.
 * @property {boolean} mounted - Whether the body renders: from the first open on.
 */
export interface Hint<P extends object> {
  readonly trigger: P;
  readonly mounted: boolean;
}

/**
 * Wires a hint's trigger for taps and closes it on a tap outside. The body
 * mounts on first open, so server markup holds none and CSS exit
 * transitions still run after. Call inside a component or effect root.
 *
 * @function useHint
 * @template {object} P
 * @param {() => HintInput<P>} read - Reads open state, trigger props, positioner id, root node.
 * @returns {Hint<P>} Trigger props and mount flag.
 */
export function useHint<P extends object>(read: () => HintInput<P>): Hint<P> {
  const memory: PointerMemory = { current: undefined };
  let opened = false;
  const mounted = $derived.by(() => {
    if (read().open) opened = true;
    return opened;
  });
  $effect(() => {
    const { open, trigger, positionerId, getRootNode } = read();
    if (!open) return undefined;
    const ids = [trigger.id ?? '', positionerId];
    const root = getRootNode();
    return untrack(() =>
      watchOutsideTap(root, ids, () => read().setOpen(false)),
    );
  });
  return {
    get trigger() {
      const { open, setOpen, trigger } = read();
      return hintTriggerProps(trigger, {
        open,
        setOpen,
        memory,
        names: SVELTE_EVENTS,
      });
    },
    get mounted() {
      return mounted;
    },
  };
}
