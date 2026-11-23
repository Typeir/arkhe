/**
 * @fileoverview One controlled / uncontrolled state for every component
 * (R2): the host's value when given, else the component's own, seeded by the
 * default. A change runs through core's reducer template, so only a real
 * change is stored and reported.
 *
 * @module packages/react/src/base/useControllable
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

'use client';

import { type Action, dispatch } from '@arkhe/core';
import { useState } from 'react';

/**
 * Replaces the value outright.
 *
 * @interface SetAction
 * @template S
 * @property {'set'} type - Action name.
 * @property {S} next - New value.
 */
interface SetAction<S> extends Action<'set'> {
  readonly next: S;
}

/**
 * What `useControllable` holds and reports.
 *
 * @interface ControllableOptions
 * @template S
 * @property {S | undefined} value - Host value; makes the state controlled. `null` is a value.
 * @property {S} defaultValue - First own value while uncontrolled.
 * @property {((next: S) => void) | undefined} onChange - Reports each change.
 */
export interface ControllableOptions<S> {
  readonly value: S | undefined;
  readonly defaultValue: S;
  readonly onChange: ((next: S) => void) | undefined;
}

/**
 * Current value and the handler that sets and reports it.
 *
 * @interface ControllableHandle
 * @template S
 * @property {S} current - Host value when controlled, else the own one.
 * @property {(next: S) => void} commit - Stores `next` while uncontrolled and reports it; a repeat does nothing.
 */
export interface ControllableHandle<S> {
  readonly current: S;
  readonly commit: (next: S) => void;
}

/**
 * Takes the action's value; the same value keeps the state object, so the
 * dispatch skips the commit.
 *
 * @function settle
 * @template S
 * @param {S} state - Value now.
 * @param {SetAction<S>} action - New value.
 * @returns {S} Next value.
 */
function settle<S>(state: S, action: SetAction<S>): S {
  return Object.is(state, action.next) ? state : action.next;
}

/**
 * Holds a value that is controlled when the host passes one and the
 * component's own otherwise. Own state changes only while uncontrolled;
 * every real change is reported.
 *
 * @function useControllable
 * @template S
 * @param {ControllableOptions<S>} options - Host value, default, callback.
 * @returns {ControllableHandle<S>} Current value and `commit`.
 */
export function useControllable<S>({
  value,
  defaultValue,
  onChange,
}: ControllableOptions<S>): ControllableHandle<S> {
  const [own, setOwn] = useState<S>(defaultValue);
  const current = value === undefined ? own : value;
  const store = (next: S) => {
    if (value === undefined) setOwn(next);
    onChange?.(next);
  };
  const commit = (next: S) => {
    dispatch<S, SetAction<S>, null>(
      settle,
      current,
      { type: 'set', next },
      null,
      store,
    );
  };
  return { current, commit };
}
