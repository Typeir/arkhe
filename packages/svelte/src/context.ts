/**
 * @fileoverview App-wide adapters for the Svelte port: translated labels,
 * icon sets, the link component, the announcer and the canvas effect
 * engine, passed down through Svelte context. Without a provider the
 * announcer makes its regions on first use, and a shared default engine is
 * used.
 *
 * @module packages/svelte/src/context
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import {
  Announcer,
  FxLoader,
  DEFAULT_LOCALE,
  resolveLabels,
  type ArkheLabels,
  type FxModule,
  type IconSet,
} from '@arkhe/core';
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
 * @property {string} locale - BCP 47 locale for plurals and numbers.
 * @property {readonly IconSet<IconComponent>[]} icons - App icon sets; Icon falls back to Lucide after them.
 * @property {LinkComponent} link - Link renderer.
 * @property {Announcer} announcer - Speaks text through the app's live regions.
 * @property {FxLoader} effects - The canvas effect engine, loaded on first use.
 */
export interface ArkheContextValue {
  readonly labels: ArkheLabels;
  readonly locale: string;
  readonly icons: readonly IconSet<IconComponent>[];
  readonly link: LinkComponent;
  readonly announcer: Announcer;
  readonly effects: FxLoader;
}

const KEY = Symbol.for('arkhe.context');

/**
 * Imports the effect engine, a chunk of its own.
 *
 * @function loadFx
 * @returns {Promise<FxModule>} Engine module.
 */
export function loadFx(): Promise<FxModule> {
  return import('@arkhe/core/fx');
}

const DEFAULT_CONTEXT: ArkheContextValue = {
  labels: resolveLabels(),
  locale: DEFAULT_LOCALE,
  icons: [],
  link: undefined,
  announcer: new Announcer(),
  effects: new FxLoader({}, loadFx),
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
