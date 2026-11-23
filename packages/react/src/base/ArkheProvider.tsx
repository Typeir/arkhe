/**
 * @fileoverview App-wide adapters: translated labels, icon sets, the link
 * component, the announcer and the canvas effect engine. Components read
 * them through `useArkhe`. Without a provider the announcer makes its
 * regions on first use, and a shared default engine is used.
 *
 * @module packages/react/src/base/ArkheProvider
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  Announcer,
  type ArkheLabels,
  DEFAULT_LOCALE,
  type EffectsSetting,
  FxLoader,
  type FxModule,
  type IconSet,
  resolveLabels,
} from '@arkhe/core';
import {
  type AnchorHTMLAttributes,
  type ComponentType,
  createContext,
  type JSX,
  type ReactNode,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useStableRecord } from './useStableRecord.js';

/**
 * A drawable icon: Lucide's components fit, and so does an app's own SVG.
 *
 * @typedef {ComponentType<{ className?: string; 'aria-hidden'?: boolean }>} IconComponent
 */
export type IconComponent = ComponentType<{
  className?: string;
  'aria-hidden'?: boolean;
}>;

/**
 * A link renderer, such as Next's `Link`. Receives anchor attributes.
 *
 * @typedef {ComponentType<AnchorHTMLAttributes<HTMLAnchorElement>>} LinkComponent
 */
export type LinkComponent =
  ComponentType<AnchorHTMLAttributes<HTMLAnchorElement>> | 'a';

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
 * @property {boolean} hoverCards - Hover cards open on hover and focus; when false, only a click opens one.
 */
export interface ArkheContextValue {
  readonly labels: ArkheLabels;
  readonly locale: string;
  readonly icons: readonly IconSet<IconComponent>[];
  readonly link: LinkComponent;
  readonly announcer: Announcer;
  readonly effects: FxLoader;
  readonly hoverCards: boolean;
}

/**
 * Imports the effect engine, a chunk of its own.
 *
 * @function loadFx
 * @returns {Promise<FxModule>} Engine module.
 */
function loadFx(): Promise<FxModule> {
  return import('@arkhe/core/fx');
}

/**
 * What components read outside any provider: English labels, Lucide icons,
 * plain anchors, an unmounted announcer.
 *
 * @constant DEFAULT_CONTEXT
 * @type {ArkheContextValue}
 */
const DEFAULT_CONTEXT: ArkheContextValue = {
  labels: resolveLabels(),
  locale: DEFAULT_LOCALE,
  icons: [],
  link: 'a',
  announcer: new Announcer(),
  effects: new FxLoader({}, loadFx),
  hoverCards: true,
};

/**
 * Adapters of the subtree, from the nearest provider.
 *
 * @constant ArkheContext
 * @type {import('react').Context<ArkheContextValue>}
 */
const ArkheContext = createContext<ArkheContextValue>(DEFAULT_CONTEXT);

/**
 * Props of ArkheProvider.
 *
 * @interface ArkheProviderProps
 * @property {Partial<ArkheLabels>} [labels] - Translated label templates.
 * @property {string} [locale] - BCP 47 locale for plurals and numbers. Defaults to `en`.
 * @property {IconSet<IconComponent>} [icons] - Icons by Lucide name; win over Lucide.
 * @property {LinkComponent} [link] - Link renderer. Defaults to `a`.
 * @property {EffectsSetting} [effects] - Canvas effect options, or `false` for CSS skeletons everywhere. Read once.
 * @property {boolean} [hoverCards] - `false` opens hover cards on click only. Defaults to true.
 * @property {ReactNode} children - App subtree.
 */
export interface ArkheProviderProps {
  readonly labels?: Partial<ArkheLabels>;
  readonly locale?: string;
  readonly icons?: IconSet<IconComponent>;
  readonly link?: LinkComponent;
  readonly effects?: EffectsSetting;
  readonly hoverCards?: boolean;
  readonly children: ReactNode;
}

/**
 * Supplies labels, icons, the link renderer, the announcer and the effect
 * engine to every Arkhé component below. Mounts the announcer's live
 * regions with itself, and destroys its engine with itself. Labels and
 * icons written inline keep one identity while their contents hold, so a
 * re-render of the app does not re-render every Arkhé component.
 *
 * @component
 * @param {ArkheProviderProps} props - Component props.
 * @param {Partial<ArkheLabels>} [props.labels] - Translated label templates.
 * @param {string} [props.locale] - BCP 47 locale for plurals and numbers.
 * @param {IconSet<IconComponent>} [props.icons] - Icons by Lucide name.
 * @param {LinkComponent} [props.link] - Link renderer.
 * @param {EffectsSetting} [props.effects] - Canvas effect options, or `false`.
 * @param {boolean} [props.hoverCards] - `false` opens hover cards on click only.
 * @param {ReactNode} props.children - App subtree.
 * @returns {JSX.Element} Provider.
 */
export const ArkheProvider = ({
  labels,
  locale,
  icons,
  link,
  effects,
  hoverCards,
  children,
}: ArkheProviderProps): JSX.Element => {
  const [announcer] = useState(() => new Announcer());
  const [engine] = useState(() => new FxLoader(effects ?? {}, loadFx));
  const stableLabels = useStableRecord(labels);
  const iconSet = useStableRecord(icons);
  useLayoutEffect(() => announcer.mount(), [announcer]);
  useLayoutEffect(() => engine.mount(), [engine]);
  const value = useMemo<ArkheContextValue>(
    () => ({
      labels: resolveLabels(stableLabels),
      locale: locale ?? DEFAULT_LOCALE,
      icons: iconSet ? [iconSet] : [],
      link: link ?? 'a',
      announcer,
      effects: engine,
      hoverCards: hoverCards ?? true,
    }),
    [stableLabels, locale, iconSet, link, announcer, engine, hoverCards],
  );
  return <ArkheContext value={value}>{children}</ArkheContext>;
};

/**
 * Returns the nearest provider's adapters, or the defaults outside any
 * provider.
 *
 * @function useArkhe
 * @returns {ArkheContextValue} Adapters.
 */
export function useArkhe(): ArkheContextValue {
  return useContext(ArkheContext);
}
