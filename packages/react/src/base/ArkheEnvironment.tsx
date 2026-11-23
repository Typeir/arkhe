/**
 * @fileoverview Sets where the Arkhé components below it live: the root node
 * Zag queries, and the element portals mount into.
 *
 * @module packages/react/src/base/ArkheEnvironment
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  type ArkheEnvironmentValue,
  createEnvironment,
  DEFAULT_ENVIRONMENT,
  type RootNode,
} from '@arkhe/core';
import {
  createContext,
  type JSX,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';

/**
 * Environment of the subtree; the main document's when no provider is above.
 *
 * @constant EnvironmentContext
 * @type {import('react').Context<ArkheEnvironmentValue>}
 */
const EnvironmentContext =
  createContext<ArkheEnvironmentValue>(DEFAULT_ENVIRONMENT);

/**
 * Props of ArkheEnvironment.
 *
 * @interface ArkheEnvironmentProps
 * @property {() => RootNode} [rootNode] - Returns the root node, e.g. a shadow root.
 * @property {HTMLElement} [container] - Portal target. Defaults to the root node's body.
 * @property {ReactNode} children - Subtree.
 */
export interface ArkheEnvironmentProps {
  readonly rootNode?: () => RootNode;
  readonly container?: HTMLElement;
  readonly children: ReactNode;
}

/**
 * Publishes an environment to every Arkhé component below.
 *
 * @component
 * @param {ArkheEnvironmentProps} props - Root node, container, subtree.
 * @returns {JSX.Element} Provider.
 */
export const ArkheEnvironment = ({
  rootNode,
  container,
  children,
}: ArkheEnvironmentProps): JSX.Element => {
  const value = useMemo(
    () => createEnvironment({ rootNode, container }),
    [rootNode, container],
  );
  return <EnvironmentContext value={value}>{children}</EnvironmentContext>;
};

/**
 * Returns the nearest environment, or the main document's.
 *
 * @function useArkheEnvironment
 * @returns {ArkheEnvironmentValue} Environment.
 */
export function useArkheEnvironment(): ArkheEnvironmentValue {
  return useContext(EnvironmentContext);
}
