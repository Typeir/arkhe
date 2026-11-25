/**
 * @fileoverview Svelte glue for `ContentLoader`: one loader per source, read
 * through a Svelte subscriber.
 *
 * @module packages/svelte/src/feedback/contentLoader.svelte
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { type ContentLoader, loaderFor, type LoadState } from '@arkhe/core';
import { createSubscriber } from 'svelte/reactivity';

/**
 * State of a handle without a source.
 *
 * @constant IDLE
 * @type {LoadState<never>}
 */
const IDLE: LoadState<never> = { status: 'idle' };

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
 * Wraps a loader so reading its state inside an effect subscribes to it.
 *
 * @function watch
 * @template T
 * @param {ContentLoader<T>} loader - Loader.
 * @returns {() => LoadState<T>} Reads the state.
 */
function watch<T>(loader: ContentLoader<T>): () => LoadState<T> {
  const track = createSubscriber((update) => loader.subscribe(update));
  return () => {
    track();
    return loader.snapshot();
  };
}

/**
 * Keeps one loader per source. A new source gets a new loader. Without a
 * source the state stays idle. Call during component initialisation.
 *
 * @function useContentLoader
 * @template T
 * @param {() => (() => Promise<T>) | undefined} source - Reads the current source.
 * @returns {ContentLoaderHandle<T>} State and start.
 */
export function useContentLoader<T>(
  source: () => (() => Promise<T>) | undefined,
): ContentLoaderHandle<T> {
  const current = $derived.by(() => {
    const next = source();
    if (!next) return null;
    const loader = loaderFor(next);
    return { loader, read: watch(loader) };
  });
  return {
    get state() {
      return current?.read() ?? IDLE;
    },
    load: () => void current?.loader.load(),
  };
}
