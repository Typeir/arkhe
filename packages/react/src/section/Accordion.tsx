/**
 * @fileoverview Accordion: Collapsible sections under one state, each with
 * a heading, optionally one open at a time, one always open, or an expand
 * all button. Panels come from a render function or a map, as Tabs.
 *
 * @module packages/react/src/section/Accordion
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

'use client';

import type { JSX } from 'react';
import {
  type AccordionAction,
  accordionAllOpen,
  accordionHeld,
  type AccordionItem,
  accordionReduce,
  ARKHE_CLASS,
  dispatch,
  type HeadingLevel,
  partAttrs,
  uniqueByValue,
} from '@arkhe/core';
import type { TabPanels } from './Tabs.js';
import { useArkhe } from '../base/ArkheProvider.js';
import { useControllable } from '../base/useControllable.js';
import { Collapsible } from './Collapsible.js';

/**
 * Props of Accordion.
 *
 * @interface AccordionProps
 * @property {readonly AccordionItem[]} items - Sections, in order; a repeated value is dropped.
 * @property {TabPanels} panels - Panel per value.
 * @property {readonly string[]} [value] - Open values; makes it controlled.
 * @property {readonly string[]} [defaultValue] - First open values when uncontrolled.
 * @property {(value: readonly string[]) => void} [onValueChange] - Reports changes.
 * @property {boolean} [multiple] - Several open at once. Defaults to true.
 * @property {boolean} [collapsible] - The last open section may close. Defaults to true.
 * @property {HeadingLevel} [heading] - Heading level of every trigger. Defaults to 3.
 * @property {boolean} [expandAll] - Adds an expand / collapse all button while `multiple`.
 */
export interface AccordionProps {
  readonly items: readonly AccordionItem[];
  readonly panels: TabPanels;
  readonly value?: readonly string[];
  readonly defaultValue?: readonly string[];
  readonly onValueChange?: (value: readonly string[]) => void;
  readonly multiple?: boolean;
  readonly collapsible?: boolean;
  readonly heading?: HeadingLevel;
  readonly expandAll?: boolean;
}

/**
 * Renders an accordion. No arrow keys between triggers: arrows scroll long
 * panels.
 *
 * @component
 * @param {AccordionProps} props - Component props.
 * @returns {JSX.Element} Accordion.
 */
export const Accordion = ({
  items,
  panels,
  value,
  defaultValue,
  onValueChange,
  multiple = true,
  collapsible = true,
  heading = 3,
  expandAll,
}: AccordionProps): JSX.Element => {
  const { labels } = useArkhe();
  const { current: open, commit } = useControllable<readonly string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  });
  const all = uniqueByValue(items);
  const rules = { items: all, multiple, collapsible };
  const act = (action: AccordionAction) => {
    dispatch(accordionReduce, open, action, rules, commit);
  };
  const full = accordionAllOpen(all, open);
  const panelFor = (key: string) =>
    typeof panels === 'function' ? panels(key) : panels[key];
  return (
    <div className={ARKHE_CLASS} {...partAttrs('accordion', 'root')}>
      {expandAll && multiple ? (
        <button
          type='button'
          {...partAttrs('accordion', 'toggle-all')}
          aria-expanded={full}
          onClick={() => {
            act({ type: 'toggle-all' });
          }}>
          {full ? labels.collapseAll : labels.expandAll}
        </button>
      ) : null}
      {all.map((item) => (
        <Collapsible
          key={item.value}
          title={item.title}
          heading={heading}
          open={open.includes(item.value)}
          disabled={item.disabled || accordionHeld(open, item.value, rules)}
          onOpenChange={(next) => {
            act({ type: 'set', item, open: next });
          }}>
          {panelFor(item.value)}
        </Collapsible>
      ))}
    </div>
  );
};
