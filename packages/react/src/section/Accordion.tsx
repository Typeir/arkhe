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

import {
  ARKHE_CLASS,
  accordionAllOpen,
  accordionHeld,
  accordionToggle,
  accordionToggleAll,
  partAttrs,
  uniqueByValue,
  type AccordionItem,
  type HeadingLevel,
} from '@arkhe/core';
import { useState, type JSX } from 'react';
import { useArkhe } from '../base/ArkheProvider.js';
import { Collapsible } from './Collapsible.js';
import type { TabPanels } from './Tabs.js';

/**
 * Props of Accordion.
 *
 * @interface AccordionProps
 * @property {readonly AccordionItem[]} items - Sections, in order; a repeated value is dropped.
 * @property {TabPanels} panels - Panel per value.
 * @property {readonly string[]} [value] - Open values; makes it controlled.
 * @property {readonly string[]} [defaultValue] - First open values when uncontrolled.
 * @property {(value: readonly string[]) => void} [onValueChange] - Reports changes.
 * @property {boolean} [multiple] - Several open at once; true by default.
 * @property {boolean} [collapsible] - The last open section may close; true by default.
 * @property {HeadingLevel} [heading] - Heading level of every trigger; 3 by default.
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
  const [own, setOwn] = useState<readonly string[]>(defaultValue ?? []);
  const open = value ?? own;
  const all = uniqueByValue(items);
  const rules = { multiple, collapsible };
  const commit = (next: readonly string[]) => {
    if (next === open) return;
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
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
          onClick={() => commit(accordionToggleAll(all, open, rules))}>
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
          onOpenChange={(next) =>
            commit(accordionToggle(open, item, next, rules))
          }>
          {panelFor(item.value)}
        </Collapsible>
      ))}
    </div>
  );
};
