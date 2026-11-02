/**
 * @fileoverview Svelte glue for `ContentLoader`: one loader per component,
 * its state mirrored into a rune.
 *
 * @module packages/svelte/src/contentLoader.svelte
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { ContentLoader, type LoadState } from '@arkhe/core';

/**
 * What `useContentLoader` returns.
 *
 * @interface ContentLoaderHandle
 * @template T
 * @property {LoadState<T>} state - Current load state; reactive.
 * @property {() => void} load - Starts the load once.
 */
export interface ContentLoaderHandle<T> {
  readonly state: LoadState<T>;
  readonly load: () => void;
}

/**
 * Keeps one loader for `source`. Without a source the state stays idle.
 * Call during component initialisation.
 *
 * @function useContentLoader
 * @template T
 * @param {(() => Promise<T>) | undefined} source - Fetches the content.
 * @returns {ContentLoaderHandle<T>} State and start.
 */
export function useContentLoader<T>(
  source: (() => Promise<T>) | undefined,
): ContentLoaderHandle<T> {
  const loader = source ? new ContentLoader(source) : undefined;
  let state = $state<LoadState<T>>({ status: 'idle' });
  loader?.subscribe(() => {
    state = loader.snapshot();
  });
  return {
    get state() {
      return state;
    },
    load: () => void loader?.load(),
  };
}
