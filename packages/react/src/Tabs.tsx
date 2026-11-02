/**
 * @fileoverview Tabs on Zag's tabs machine. Panels come from a render
 * function or, for server content that cannot pass functions, a map from
 * value to node.
 *
 * @module packages/react/src/Tabs
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  staleTabFallback,
  tabsMachineProps,
  uniqueByValue,
  type TabItem,
} from '@arkhe/core';
import { mergeProps, normalizeProps, useMachine } from '@zag-js/react';
import * as tabs from '@zag-js/tabs';
import { useEffect, useId, useState, type JSX, type ReactNode } from 'react';
import { useArkheEnvironment } from './ArkheEnvironment.js';

/**
 * Panel source: a render function, or one node per value.
 *
 * @typedef {((value: string) => ReactNode) | Readonly<Record<string, ReactNode>>} TabPanels
 */
export type TabPanels =
  ((value: string) => ReactNode) | Readonly<Record<string, ReactNode>>;

/**
 * Props of Tabs.
 *
 * @interface TabsProps
 * @property {readonly TabItem[]} items - Tabs, in order; a repeated value is dropped.
 * @property {string} label - Accessible name of the tab list.
 * @property {string} [value] - Selected value; makes the tabs controlled.
 * @property {string} [defaultValue] - First value when uncontrolled.
 * @property {(value: string) => void} [onValueChange] - Selection callback.
 * @property {TabPanels} panels - Panel per value.
 */
export interface TabsProps {
  readonly items: readonly TabItem[];
  readonly label: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly panels: TabPanels;
}

/**
 * Renders a tab list and its panels. A value that matches no enabled tab
 * shows the first enabled tab and warns once; uncontrolled tabs move there
 * too when the selected tab is removed or disabled.
 *
 * @component
 * @param {TabsProps} props - Items, value, panels.
 * @returns {JSX.Element} Tabs.
 */
export const Tabs = ({
  items,
  label,
  value,
  defaultValue,
  onValueChange,
  panels,
}: TabsProps): JSX.Element => {
  const env = useArkheEnvironment();
  const shown = uniqueByValue(items);
  const [warned] = useState(() => new Set<string>());
  const service = useMachine(
    tabs.machine,
    tabsMachineProps({
      id: useId(),
      items: shown,
      label,
      value,
      defaultValue,
      onValueChange,
      warned,
      getRootNode: env.getRootNode,
    }),
  );
  const api = tabs.connect(service, normalizeProps);
  const fallback =
    value === undefined ? staleTabFallback(api.value, shown) : undefined;
  useEffect(() => {
    if (fallback !== undefined) api.setValue(fallback);
  }, [api, fallback]);
  const panelFor = (key: string) =>
    typeof panels === 'function' ? panels(key) : panels[key];
  return (
    <div {...mergeProps(api.getRootProps(), { className: ARKHE_CLASS })}>
      <div {...api.getListProps()}>
        {shown.map((item) => (
          <button
            key={item.value}
            {...api.getTriggerProps({
              value: item.value,
              disabled: item.disabled,
            })}>
            {item.label}
          </button>
        ))}
        <div {...api.getIndicatorProps()} />
      </div>
      {shown.map((item) => (
        <div key={item.value} {...api.getContentProps({ value: item.value })}>
          {panelFor(item.value)}
        </div>
      ))}
    </div>
  );
};
