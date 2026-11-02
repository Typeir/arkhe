/**
 * @fileoverview App-wide adapters: translated labels, icon sets and the
 * link component. Components read them through `useArkhe`.
 *
 * @module packages/react/src/ArkheProvider
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import { resolveLabels, type ArkheLabels, type IconSet } from '@arkhe/core';
import {
  createContext,
  useContext,
  useMemo,
  type AnchorHTMLAttributes,
  type ComponentType,
  type JSX,
  type ReactNode,
} from 'react';

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
 * @property {readonly IconSet<IconComponent>[]} icons - App icon sets; Icon falls back to Lucide after them.
 * @property {LinkComponent} link - Link renderer.
 */
export interface ArkheContextValue {
  readonly labels: ArkheLabels;
  readonly icons: readonly IconSet<IconComponent>[];
  readonly link: LinkComponent;
}

const DEFAULT_CONTEXT: ArkheContextValue = {
  labels: resolveLabels(),
  icons: [],
  link: 'a',
};

const ArkheContext = createContext<ArkheContextValue>(DEFAULT_CONTEXT);

/**
 * Props of ArkheProvider.
 *
 * @interface ArkheProviderProps
 * @property {Partial<ArkheLabels>} [labels] - Translated label templates.
 * @property {IconSet<IconComponent>} [icons] - Icons by Lucide name; win over Lucide.
 * @property {LinkComponent} [link] - Link renderer. Defaults to `a`.
 * @property {ReactNode} children - App subtree.
 */
export interface ArkheProviderProps {
  readonly labels?: Partial<ArkheLabels>;
  readonly icons?: IconSet<IconComponent>;
  readonly link?: LinkComponent;
  readonly children: ReactNode;
}

/**
 * Supplies labels, icons and the link renderer to every Arkhé component below.
 *
 * @component
 * @param {ArkheProviderProps} props - Component props.
 * @param {Partial<ArkheLabels>} [props.labels] - Translated label templates.
 * @param {IconSet<IconComponent>} [props.icons] - Icons by Lucide name.
 * @param {LinkComponent} [props.link] - Link renderer.
 * @param {ReactNode} props.children - App subtree.
 * @returns {JSX.Element} Provider.
 */
export const ArkheProvider = ({
  labels,
  icons,
  link,
  children,
}: ArkheProviderProps): JSX.Element => {
  const value = useMemo<ArkheContextValue>(
    () => ({
      labels: resolveLabels(labels),
      icons: icons ? [icons] : [],
      link: link ?? 'a',
    }),
    [labels, icons, link],
  );
  return (
    <ArkheContext.Provider value={value}>{children}</ArkheContext.Provider>
  );
};

/**
 * Returns the nearest provider's labels, icons and link renderer, or the
 * defaults outside any provider.
 *
 * @function useArkhe
 * @returns {ArkheContextValue} Adapters.
 */
export function useArkhe(): ArkheContextValue {
  return useContext(ArkheContext);
}
