/**
 * @fileoverview App-wide adapters for the Svelte port: translated labels,
 * icon sets and the link component, passed down through Svelte context.
 *
 * @module packages/svelte/src/context
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { resolveLabels, type ArkheLabels, type IconSet } from '@arkhe/core';
import { getContext, setContext, type Component } from 'svelte';

/**
 * A drawable icon: Lucide's Svelte components fit, and so does an app's own SVG.
 *
 * @typedef {Component<{ class?: string; 'aria-hidden'?: boolean }>} IconComponent
 */
export type IconComponent = Component<{
  class?: string;
  'aria-hidden'?: boolean;
}>;

/**
 * A link renderer with anchor props; `undefined` means a plain `a`.
 *
 * @typedef {Component<Record<string, unknown>> | undefined} LinkComponent
 */
export type LinkComponent = Component<Record<string, unknown>> | undefined;

/**
 * What components read from the provider.
 *
 * @interface ArkheContextValue
 * @property {ArkheLabels} labels - Complete label templates.
 * @property {readonly IconSet<IconComponent>[]} icons - App icon sets; Icon falls back to Lucide after them.
 * @property {LinkComponent} link - Link renderer.
 */
export interface ArkheContextValue {
  readonly labels: ArkheLabels;
  readonly icons: readonly IconSet<IconComponent>[];
  readonly link: LinkComponent;
}

const KEY = Symbol.for('arkhe.context');

const DEFAULT_CONTEXT: ArkheContextValue = {
  labels: resolveLabels(),
  icons: [],
  link: undefined,
};

/**
 * Publishes adapters to every Arkhé component below the caller.
 *
 * @function provideArkhe
 * @param {() => ArkheContextValue} read - Returns the current adapters.
 * @returns {void}
 */
export function provideArkhe(read: () => ArkheContextValue): void {
  setContext(KEY, read);
}

/**
 * Returns a reader for the nearest provider's adapters, or the defaults
 * outside any provider. Call during component initialisation.
 *
 * @function useArkhe
 * @returns {() => ArkheContextValue} Adapter reader.
 */
export function useArkhe(): () => ArkheContextValue {
  return (
    getContext<(() => ArkheContextValue) | undefined>(KEY) ??
    (() => DEFAULT_CONTEXT)
  );
}
