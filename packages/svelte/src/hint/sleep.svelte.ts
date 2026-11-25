/**
 * @fileoverview A hint trigger that sleeps until its first hover, focus or
 * tap. Asleep, it carries Zag's closed trigger attributes and wake handlers.
 * Awake, the machine runs in a child that reports its trigger props back;
 * the spread updates the same trigger node, so its focus survives. Waking
 * flushes at once, so the press's click already meets the live machine.
 * Zag's focus-visible tracking starts with the first sleeping trigger, as it
 * would with the first machine, so the press that wakes a hint still counts
 * as a pointer and the focus after it does not open the hint.
 *
 * @module packages/svelte/src/hint/sleep.svelte
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import type { HTMLAttributes } from 'svelte/elements';
import {
  type HintScope,
  type HintWake,
  sleepingTrigger,
  SVELTE_EVENTS,
  WakeWatch,
} from '@arkhe/core';
import { trackFocusVisible } from '@zag-js/focus-visible';
import { flushSync, onMount, untrack } from 'svelte';
import { useArkheEnvironment } from '../base/environment.js';

/**
 * Why the machine runs: what woke it, or `open` when it started open.
 *
 * @typedef {HintWake | 'open'} Waking
 */
export type Waking = HintWake | 'open';

/**
 * What `useSleep` returns.
 *
 * @interface Sleep
 * @property {Waking | null} waking - Why the machine runs; null while asleep.
 * @property {HTMLAttributes<HTMLElement>} attrs - Trigger props to spread.
 * @property {(props: object) => void} report - The live machine hands its trigger props here.
 * @property {() => boolean} hovering - The pointer that woke the hint is still over the trigger.
 */
export interface Sleep {
  readonly waking: Waking | null;
  readonly attrs: HTMLAttributes<HTMLElement>;
  readonly report: (props: object) => void;
  readonly hovering: () => boolean;
}

/**
 * Sleeping trigger state for one hint.
 *
 * @function useSleep
 * @param {HintScope} scope - Machine scope.
 * @param {string} id - Machine id.
 * @param {() => boolean} held - Starts, or is held, open; wakes at once.
 * @returns {Sleep} Wake state, trigger props, report callback.
 */
export function useSleep(
  scope: HintScope,
  id: string,
  held: () => boolean,
): Sleep {
  const env = useArkheEnvironment();
  onMount(() => {
    trackFocusVisible({ root: env().getRootNode() })();
  });
  let waking = $state<Waking | null>(untrack(held) ? 'open' : null);
  let live = $state.raw<HTMLAttributes<HTMLElement> | null>(null);
  $effect.pre(() => {
    if (held() && untrack(() => waking) === null) waking = 'open';
  });
  const watch = new WakeWatch(SVELTE_EVENTS, (kind) => {
    flushSync(() => {
      waking = kind;
    });
  });
  const asleep = {
    ...sleepingTrigger(scope, id),
    ...watch.handlers,
  } as HTMLAttributes<HTMLElement>;
  const leave = (event: PointerEvent) => {
    watch.leave();
    (live?.onpointerleave as ((e: PointerEvent) => void) | null | undefined)?.(
      event,
    );
  };
  return {
    get waking() {
      return waking;
    },
    get attrs() {
      return live === null ? asleep : { ...live, onpointerleave: leave };
    },
    report: (props: object) => {
      live = props as HTMLAttributes<HTMLElement>;
    },
    hovering: () => watch.hovering,
  };
}
