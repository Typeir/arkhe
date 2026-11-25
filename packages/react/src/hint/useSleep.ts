/**
 * @fileoverview A hint trigger that sleeps until its first hover, focus or
 * tap. Asleep, it carries Zag's closed trigger attributes and wake handlers.
 * Awake, the machine runs in a child that reports its trigger props back:
 * attributes re-render the trigger only when they change, handlers go
 * through stable proxies, so the trigger node, and its focus, survive.
 * Zag's focus-visible tracking starts with the first sleeping trigger, as it
 * would with the first machine, so the press that wakes a hint still counts
 * as a pointer and the focus after it does not open the hint.
 *
 * @module packages/react/src/hint/useSleep
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

'use client';

import {
  type HintScope,
  type HintWake,
  REACT_EVENTS,
  sleepingTrigger,
  wakeHandlers,
} from '@arkhe/core';
import { trackFocusVisible } from '@zag-js/focus-visible';
import {
  type HTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useArkheEnvironment } from '../base/ArkheEnvironment.js';

/**
 * Why the machine runs: what woke it, or `open` when it started open.
 *
 * @typedef {HintWake | 'open'} Waking
 */
export type Waking = HintWake | 'open';

/**
 * Trigger props as a port spreads them.
 *
 * @typedef {Record<string, unknown>} TriggerProps
 */
type TriggerProps = Record<string, unknown>;

/**
 * What `useSleep` returns.
 *
 * @interface Sleep
 * @property {Waking | null} waking - Why the machine runs; null while asleep.
 * @property {HTMLAttributes<HTMLElement>} attrs - Trigger props to spread.
 * @property {(props: object) => void} report - The live machine hands its trigger props here after each render.
 */
export interface Sleep {
  readonly waking: Waking | null;
  readonly attrs: HTMLAttributes<HTMLElement>;
  readonly report: (props: object) => void;
}

/**
 * Whether two attribute records hold the same values.
 *
 * @function same
 * @param {TriggerProps} one - One record.
 * @param {TriggerProps} other - The other.
 * @returns {boolean} Equal.
 */
function same(one: TriggerProps, other: TriggerProps): boolean {
  const keys = Object.keys(one);
  return (
    keys.length === Object.keys(other).length &&
    keys.every((key) => one[key] === other[key])
  );
}

/**
 * Sleeping trigger state for one hint.
 *
 * @function useSleep
 * @param {HintScope} scope - Machine scope.
 * @param {string} id - Machine id.
 * @param {boolean} open - Starts, or is held, open; wakes at once.
 * @returns {Sleep} Wake state, trigger props, report callback.
 */
export function useSleep(scope: HintScope, id: string, open: boolean): Sleep {
  const env = useArkheEnvironment();
  useEffect(() => {
    trackFocusVisible({ root: env.getRootNode() })();
  }, [env]);
  const [waking, setWaking] = useState<Waking | null>(open ? 'open' : null);
  if (waking === null && open) setWaking('open');
  const [view, setView] = useState<TriggerProps>(
    () => ({ ...sleepingTrigger(scope, id) }) as TriggerProps,
  );
  const [keys, setKeys] = useState<readonly string[]>([]);
  const handlers = useRef<TriggerProps>({});
  const [report] = useState(() => (props: object) => {
    const attrs: TriggerProps = {};
    const fns: TriggerProps = {};
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'function') fns[key] = value;
      else if (value !== undefined) attrs[key] = value;
    }
    handlers.current = fns;
    setView((prev) => (same(prev, attrs) ? prev : attrs));
    const names = Object.keys(fns);
    setKeys((prev) =>
      prev.length === names.length && names.every((k, i) => prev[i] === k)
        ? prev
        : names,
    );
  });
  const proxies = useMemo(
    () =>
      Object.fromEntries(
        keys.map((key) => [
          key,
          (event: unknown) => {
            (handlers.current[key] as ((e: unknown) => void) | undefined)?.(
              event,
            );
          },
        ]),
      ),
    [keys],
  );
  const wake = useMemo(
    () =>
      wakeHandlers(REACT_EVENTS, (kind) => {
        setWaking(kind);
      }),
    [],
  );
  const attrs = { ...view, ...(waking === null ? wake : proxies) };
  return { waking, attrs: attrs as HTMLAttributes<HTMLElement>, report };
}
