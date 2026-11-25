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
  afterExit,
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
 * @property {boolean} fresh - It has not slept yet, so `defaultOpen` still counts.
 * @property {string | null} press - Pointer kind of the press that woke it; null when none did.
 * @property {() => void} sleep - The live machine closed and finished its exit; back to sleep.
 */
export interface Sleep {
  readonly waking: Waking | null;
  readonly attrs: HTMLAttributes<HTMLElement>;
  readonly report: (props: object) => void;
  readonly hovering: () => boolean;
  readonly fresh: boolean;
  readonly press: string | null;
  readonly sleep: () => void;
}

/**
 * Sleeping trigger state for one hint.
 *
 * @function useSleep
 * @param {HintScope} scope - Machine scope.
 * @param {string} id - Machine id.
 * @param {() => boolean} open - Held open by the host; wakes at once.
 * @param {() => boolean} defaultOpen - Starts open; counts until the first sleep.
 * @returns {Sleep} Wake state, trigger props, report and sleep callbacks.
 */
export function useSleep(
  scope: HintScope,
  id: string,
  open: () => boolean,
  defaultOpen: () => boolean,
): Sleep {
  const env = useArkheEnvironment();
  onMount(() => {
    trackFocusVisible({ root: env().getRootNode() })();
  });
  let slept = $state(false);
  const held = () => open() || (defaultOpen() && !slept);
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
    get fresh() {
      return !slept;
    },
    get press() {
      return watch.press;
    },
    sleep: () => {
      watch.reset();
      live = null;
      waking = null;
      slept = true;
    },
  };
}

/**
 * What `useSleepAgain` reads from a live hint.
 *
 * @interface SleepAgainInput
 * @property {boolean} closed - Nothing asks it open, and the machine is closed and shows nothing.
 * @property {() => boolean} idle - The machine is closed right now, read live.
 * @property {boolean} opened - It opened since it woke.
 * @property {() => boolean} pressing - A press is waiting for its click.
 * @property {() => boolean} hovering - The waking pointer is still over the trigger.
 * @property {string} positionerId - Id of the hint's positioner, whose exit is awaited.
 * @property {() => void} sleep - Puts the trigger back to sleep.
 */
export interface SleepAgainInput {
  readonly closed: boolean;
  readonly idle: () => boolean;
  readonly opened: boolean;
  readonly pressing: () => boolean;
  readonly hovering: () => boolean;
  readonly positionerId: string;
  readonly sleep: () => void;
}

/**
 * Sends a live hint back to sleep once it is closed and its exit animations
 * have ended, unless a press still waits for its click, or it never opened
 * and the pointer is still on the trigger.
 *
 * @function useSleepAgain
 * @param {() => SleepAgainInput} read - Machine state and the sleep callback.
 * @returns {void}
 */
export function useSleepAgain(read: () => SleepAgainInput): void {
  const env = useArkheEnvironment();
  $effect(() => {
    const { closed, positionerId } = read();
    if (!closed) return undefined;
    return afterExit(env().getRootNode(), positionerId, () => {
      untrack(() => {
        const now = read();
        const ready =
          now.closed &&
          now.idle() &&
          !now.pressing() &&
          (now.opened || !now.hovering());
        if (ready) now.sleep();
      });
    });
  });
}
