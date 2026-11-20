/**
 * @fileoverview Toggle group: a toolbar of pressed / released buttons with
 * one tab stop, an optional limit with a show more button, and a clear
 * button.
 *
 * @module packages/react/src/ToggleGroup
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

'use client';

import {
  ARKHE_CLASS,
  partAttrs,
  rovingFocus,
  toggleRootAttrs,
  togglePress,
  toggleShown,
  uniqueByValue,
  type ToggleItem,
  type ToggleOrientation,
} from '@arkhe/core';
import { useEffect, useRef, useState, type JSX, type ReactNode } from 'react';
import { useArkhe } from './ArkheProvider.js';
import { Icon } from './Icon.js';

/**
 * Props of ToggleGroup.
 *
 * @interface ToggleGroupProps
 * @property {string} label - Accessible name of the group.
 * @property {readonly ToggleItem[]} items - Toggles, in order; a repeated value is dropped.
 * @property {readonly string[]} [value] - Pressed values; makes the group controlled.
 * @property {readonly string[]} [defaultValue] - First pressed values when uncontrolled.
 * @property {(value: readonly string[]) => void} [onValueChange] - Reports presses.
 * @property {boolean} [multiple] - Several may be pressed at once.
 * @property {boolean} [deselectable] - A single pressed toggle may be released.
 * @property {ToggleOrientation} [orientation] - Direction; horizontal by default.
 * @property {number} [limit] - Toggles shown until the reader asks for more; pressed ones always show.
 * @property {boolean} [clearable] - Adds a clear button while anything is pressed.
 * @property {(item: ToggleItem, pressed: boolean) => ReactNode} [renderItem] - Content of a toggle; it must carry the toggle's name.
 */
export interface ToggleGroupProps {
  readonly label: string;
  readonly items: readonly ToggleItem[];
  readonly value?: readonly string[];
  readonly defaultValue?: readonly string[];
  readonly onValueChange?: (value: readonly string[]) => void;
  readonly multiple?: boolean;
  readonly deselectable?: boolean;
  readonly orientation?: ToggleOrientation;
  readonly limit?: number;
  readonly clearable?: boolean;
  readonly renderItem?: (item: ToggleItem, pressed: boolean) => ReactNode;
}

/**
 * Renders a toggle group. Tab enters it once; arrows, Home and End move
 * between its buttons. A disabled toggle stays reachable and ignores
 * presses.
 *
 * @component
 * @param {ToggleGroupProps} props - Component props.
 * @returns {JSX.Element} Toggle group.
 */
export const ToggleGroup = ({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  multiple,
  deselectable,
  orientation,
  limit,
  clearable,
  renderItem,
}: ToggleGroupProps): JSX.Element => {
  const { labels } = useArkhe();
  const [own, setOwn] = useState<readonly string[]>(defaultValue ?? []);
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const pressed = value ?? own;
  const all = uniqueByValue(items);
  useEffect(() => (root.current ? rovingFocus(root.current) : undefined), []);
  const commit = (next: readonly string[]) => {
    if (next === pressed) return;
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
  };
  const clear = () => {
    commit([]);
    root.current?.querySelector<HTMLElement>('[data-part="item"]')?.focus();
  };
  return (
    <div
      ref={root}
      className={ARKHE_CLASS}
      {...partAttrs('toggle-group', 'root')}
      {...toggleRootAttrs(label, orientation)}>
      {toggleShown(all, pressed, limit, expanded).map((item) => {
        const on = pressed.includes(item.value);
        return (
          <button
            key={item.value}
            type='button'
            {...partAttrs('toggle-group', 'item')}
            data-value={item.value}
            aria-pressed={on}
            aria-disabled={item.disabled ? true : undefined}
            onClick={() =>
              commit(togglePress(pressed, item, { multiple, deselectable }))
            }>
            {item.icon ? <Icon name={item.icon} /> : null}
            {renderItem ? (
              renderItem(item, on)
            ) : (
              <span {...partAttrs('toggle-group', 'label')}>{item.label}</span>
            )}
          </button>
        );
      })}
      {limit !== undefined && all.length > limit ? (
        <button
          type='button'
          {...partAttrs('toggle-group', 'more')}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}>
          {expanded ? labels.showLess : labels.showMore}
        </button>
      ) : null}
      {clearable && pressed.length > 0 ? (
        <button
          type='button'
          {...partAttrs('toggle-group', 'clear')}
          onClick={clear}>
          {labels.clearSelection}
        </button>
      ) : null}
    </div>
  );
};
