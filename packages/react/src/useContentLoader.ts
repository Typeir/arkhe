/**
 * @fileoverview React glue for `ContentLoader`: one loader per component,
 * read through React's external-store hook.
 *
 * @module packages/react/src/useContentLoader
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import { ContentLoader, type LoadState } from '@arkhe/core';
import { useCallback, useState, useSyncExternalStore } from 'react';

const IDLE: LoadState<never> = { status: 'idle' };

function unsubscribeNothing(): void {
  return undefined;
}

/**
 * A loader together with the source it was built from.
 *
 * @interface Held
 * @template T
 * @property {(() => Promise<T>) | undefined} source - Source the loader runs.
 * @property {ContentLoader<T> | undefined} loader - Loader, if there is a source.
 */
interface Held<T> {
  readonly source: (() => Promise<T>) | undefined;
  readonly loader: ContentLoader<T> | undefined;
}

/**
 * Builds a loader for `source`.
 *
 * @function hold
 * @template T
 * @param {(() => Promise<T>) | undefined} source - Fetches the content.
 * @returns {Held<T>} Source and loader.
 */
function hold<T>(source: (() => Promise<T>) | undefined): Held<T> {
  return { source, loader: source ? new ContentLoader(source) : undefined };
}

/**
 * What the hook returns.
 *
 * @interface ContentLoaderHandle
 * @template T
 * @property {LoadState<T>} state - Current load state.
 * @property {() => void} load - Starts the load once.
 */
export interface ContentLoaderHandle<T> {
  readonly state: LoadState<T>;
  readonly load: () => void;
}

/**
 * Keeps one loader per `source`. A new `source` gets a new loader, so keep
 * it stable (`useCallback`) unless what it loads changed. Without a source
 * the state stays idle.
 *
 * @function useContentLoader
 * @template T
 * @param {(() => Promise<T>) | undefined} source - Fetches the content.
 * @returns {ContentLoaderHandle<T>} State and start.
 */
export function useContentLoader<T>(
  source: (() => Promise<T>) | undefined,
): ContentLoaderHandle<T> {
  const [held, setHeld] = useState(() => hold(source));
  const current = held.source === source ? held : hold(source);
  if (current !== held) setHeld(current);
  const { loader } = current;
  const subscribe = useCallback(
    (listener: () => void) => loader?.subscribe(listener) ?? unsubscribeNothing,
    [loader],
  );
  const state = useSyncExternalStore(
    subscribe,
    () => loader?.snapshot() ?? IDLE,
    () => IDLE,
  );
  const load = useCallback(() => void loader?.load(), [loader]);
  return { state, load };
}
