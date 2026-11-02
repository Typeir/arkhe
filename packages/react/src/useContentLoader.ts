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
import { useState, useSyncExternalStore } from 'react';

const IDLE: LoadState<never> = { status: 'idle' };

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
 * Keeps one loader for `source`. Without a source the state stays idle.
 *
 * @function useContentLoader
 * @template T
 * @param {(() => Promise<T>) | undefined} source - Fetches the content.
 * @returns {ContentLoaderHandle<T>} State and start.
 */
export function useContentLoader<T>(
  source: (() => Promise<T>) | undefined,
): ContentLoaderHandle<T> {
  const [loader] = useState(() =>
    source ? new ContentLoader(source) : undefined,
  );
  const state = useSyncExternalStore(
    (listener) => loader?.subscribe(listener) ?? (() => undefined),
    () => loader?.snapshot() ?? IDLE,
    () => IDLE,
  );
  return { state, load: () => void loader?.load() };
}
