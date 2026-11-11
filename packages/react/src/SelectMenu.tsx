/**
 * @fileoverview SelectMenu: a button that opens a list of options, on Zag's
 * select machine. Not exported: it is the body of Select when not
 * searchable. A hidden native select mirrors the value for forms.
 *
 * @module packages/react/src/SelectMenu
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

'use client';

import {
  ARKHE_CLASS,
  isGrouped,
  optionCollection,
  selectMachineProps,
  slug,
  uniqueByValue,
  type ComboboxOption,
  type Placement,
} from '@arkhe/core';
import { Portal, mergeProps, normalizeProps, useMachine } from '@zag-js/react';
import * as select from '@zag-js/select';
import { useId, useMemo, type JSX, type ReactNode } from 'react';
import { useArkhe } from './ArkheProvider.js';
import { useArkheEnvironment } from './ArkheEnvironment.js';
import { optionBody } from './ComboboxField.js';
import { Icon } from './Icon.js';
import { useHydrated } from './useHydrated.js';
import { usePortalContainer } from './usePortalContainer.js';

/**
 * Props of SelectMenu.
 *
 * @interface SelectMenuProps
 * @template {ComboboxOption} T
 * @property {string} label - Visible label.
 * @property {readonly T[]} items - Options; a repeated value is dropped.
 * @property {string} [placeholder] - Shown while nothing is chosen.
 * @property {string | null} [value] - Selected value; makes the selection controlled.
 * @property {string | null} [defaultValue] - First selection when uncontrolled.
 * @property {(value: string | null) => void} [onValueChange] - Selection changes.
 * @property {(item: T) => ReactNode} [renderItem] - Option body. Defaults to label and description.
 * @property {string} [name] - Form field name.
 * @property {boolean} [required] - A value must be chosen.
 * @property {boolean} [disabled] - Blocks interaction.
 * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
 */
export interface SelectMenuProps<T extends ComboboxOption> {
  readonly label: string;
  readonly items: readonly T[];
  readonly placeholder?: string;
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onValueChange?: (value: string | null) => void;
  readonly renderItem?: (item: T) => ReactNode;
  readonly name?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly placement?: Placement;
}

/**
 * Renders a labelled select button and its portalled option list.
 *
 * @component
 * @param {SelectMenuProps<T>} props - Label, options, selection.
 * @returns {JSX.Element} Select.
 */
export const SelectMenu = <T extends ComboboxOption>(
  props: SelectMenuProps<T>,
): JSX.Element => {
  const { label, items, placeholder } = props;
  const renderItem =
    props.renderItem ?? ((item: T) => optionBody(item, 'select'));
  const { labels } = useArkhe();
  const env = useArkheEnvironment();
  const container = usePortalContainer();
  const hydrated = useHydrated();
  const shown = useMemo(() => uniqueByValue(items), [items]);
  const collection = useMemo(
    () => select.collection(optionCollection(shown)),
    [shown],
  );
  const service = useMachine(select.machine, {
    ...selectMachineProps({
      ...props,
      id: useId(),
      labels,
      getRootNode: env.getRootNode,
    }),
    collection,
    onValueChange: (details) => props.onValueChange?.(details.value[0] ?? null),
  });
  const api = select.connect(service, normalizeProps);
  const option = (item: T) => (
    <div key={item.value} {...api.getItemProps({ item })}>
      {renderItem(item)}
    </div>
  );
  return (
    <div {...mergeProps(api.getRootProps(), { className: ARKHE_CLASS })}>
      <label {...api.getLabelProps()}>{label}</label>
      <div {...api.getControlProps()}>
        <button {...api.getTriggerProps()}>
          <span {...api.getValueTextProps()}>
            {api.valueAsString || placeholder}
          </span>
          <span {...api.getIndicatorProps()}>
            <Icon name='chevron-down' />
          </span>
        </button>
      </div>
      <select {...api.getHiddenSelectProps()}>
        <option value='' />
        {shown.map((item) => (
          <option key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </option>
        ))}
      </select>
      {hydrated ? (
        <Portal container={container} getRootNode={env.getRootNode}>
          <div className={ARKHE_CLASS}>
            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()}>
                {isGrouped(shown)
                  ? collection.group().map(([group, members]) => (
                      <div
                        key={group}
                        {...api.getItemGroupProps({ id: slug(group) })}>
                        <div
                          {...api.getItemGroupLabelProps({
                            htmlFor: slug(group),
                          })}>
                          {group}
                        </div>
                        {members.map(option)}
                      </div>
                    ))
                  : shown.map(option)}
              </div>
            </div>
          </div>
        </Portal>
      ) : null}
    </div>
  );
};
