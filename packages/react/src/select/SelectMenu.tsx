/**
 * @fileoverview SelectMenu: a button that opens a list of options, on Zag's
 * select machine. Not exported: it is the body of Select when not
 * searchable. A hidden native select mirrors the value for forms; with
 * virtual rows it holds only the chosen option.
 *
 * @module packages/react/src/select/SelectMenu
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

'use client';

import {
  ARKHE_CLASS,
  EMPTY_VALUE,
  fieldDescribedBy,
  fieldIds,
  flag,
  fromEmptyValue,
  isGrouped,
  optionCollection,
  type Placement,
  selectMachineProps,
  type SelectOption,
  slug,
  toEmptyValue,
  uniqueByValue,
  withEmptyOption,
} from '@arkhe/core';
import { mergeProps, normalizeProps, Portal, useMachine } from '@zag-js/react';
import * as select from '@zag-js/select';
import { type JSX, type ReactNode, useId, useMemo } from 'react';
import { useArkheEnvironment } from '../base/ArkheEnvironment.js';
import { useArkhe } from '../base/ArkheProvider.js';
import { Icon } from '../base/Icon.js';
import { useHydrated } from '../base/useHydrated.js';
import { usePortalContainer } from '../base/usePortalContainer.js';
import { FieldNote } from '../field/FieldNote.js';
import { useVirtualRows } from '../list/useVirtualRows.js';
import { optionBody } from './optionBody.js';

/**
 * Props of SelectMenu.
 *
 * @interface SelectMenuProps
 * @template {SelectOption} T
 * @property {string} label - Visible label.
 * @property {readonly T[]} items - Options; a repeated value is dropped.
 * @property {string} [placeholder] - Shown while nothing is chosen.
 * @property {string | null} [value] - Selected value; makes the selection controlled.
 * @property {string | null} [defaultValue] - First selection when uncontrolled.
 * @property {(value: string | null) => void} [onValueChange] - Selection changes.
 * @property {(item: T) => ReactNode} [renderItem] - Option body. Defaults to label and description.
 * @property {string} [name] - Form field name.
 * @property {boolean} [required] - A value must be chosen.
 * @property {string} [autoComplete] - Autofill hint of the hidden native select, such as `country`.
 * @property {boolean} [disabled] - Blocks interaction.
 * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
 * @property {string} [emptyLabel] - Text of a first option that stands for no choice, such as "All".
 * @property {'s' | 'm' | 'l'} [size] - Control size. Defaults to `m`.
 * @property {boolean} [labelHidden] - Keeps the label for assistive tech only.
 * @property {string} [hint] - Help text under the control.
 * @property {string} [error] - Error text; replaces the hint and marks the control invalid.
 * @property {number} [rowPitch] - Row height in rem; draws only the rows in view. Flat lists only.
 */
export interface SelectMenuProps<T extends SelectOption> {
  readonly label: string;
  readonly items: readonly T[];
  readonly placeholder?: string;
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onValueChange?: (value: string | null) => void;
  readonly renderItem?: (item: T) => ReactNode;
  readonly name?: string;
  readonly required?: boolean;
  readonly autoComplete?: string;
  readonly disabled?: boolean;
  readonly placement?: Placement;
  readonly emptyLabel?: string;
  readonly size?: 's' | 'm' | 'l';
  readonly labelHidden?: boolean;
  readonly hint?: string;
  readonly error?: string;
  readonly rowPitch?: number;
}

/**
 * Renders a labelled select button and its portalled option list.
 *
 * @component
 * @param {SelectMenuProps<T>} props - Label, options, selection.
 * @returns {JSX.Element} Select.
 */
export const SelectMenu = <T extends SelectOption>({
  label,
  items,
  placeholder,
  value,
  defaultValue,
  onValueChange,
  renderItem = (item: T) => optionBody(item, 'select'),
  name,
  required,
  autoComplete,
  disabled,
  placement,
  emptyLabel,
  size,
  labelHidden,
  hint,
  error,
  rowPitch,
}: SelectMenuProps<T>): JSX.Element => {
  const { labels } = useArkhe();
  const env = useArkheEnvironment();
  const container = usePortalContainer();
  const hydrated = useHydrated();
  const shown = useMemo(
    () => uniqueByValue(withEmptyOption(items, emptyLabel)) as readonly T[],
    [items, emptyLabel],
  );
  const collection = useMemo(
    () => select.collection(optionCollection(shown)),
    [shown],
  );
  const { attach, ...rows } = useVirtualRows(
    shown.length,
    isGrouped(shown) ? undefined : rowPitch,
  );
  const id = useId();
  const ids = fieldIds(id);
  const service = useMachine(select.machine, {
    ...selectMachineProps({
      id,
      label,
      labels,
      value: toEmptyValue(value, emptyLabel),
      defaultValue: toEmptyValue(defaultValue ?? null, emptyLabel),
      name,
      required,
      invalid: Boolean(error),
      autoComplete,
      disabled,
      placement,
      getRootNode: env.getRootNode,
    }),
    ...(rows.on ? { scrollToIndexFn: rows.scrollTo } : {}),
    collection,
    onValueChange: (details) =>
      onValueChange?.(fromEmptyValue(details.value[0] ?? null)),
  });
  const api = select.connect(service, normalizeProps);
  const option = (item: T, index: number) => (
    <div
      key={item.value}
      {...api.getItemProps({ item })}
      {...rows.position(index)}>
      {item.value === EMPTY_VALUE && emptyLabel !== undefined
        ? optionBody(item, 'select')
        : renderItem(item)}
    </div>
  );
  const options = () => {
    if (rows.on) {
      return shown
        .slice(rows.range.start, rows.range.end)
        .map((item, at) => option(item, rows.range.start + at));
    }
    if (!isGrouped(shown)) return shown.map(option);
    return collection.group().map(([group, members]) => (
      <div key={group} {...api.getItemGroupProps({ id: slug(group) })}>
        <div {...api.getItemGroupLabelProps({ htmlFor: slug(group) })}>
          {group}
        </div>
        {members.map(option)}
      </div>
    ));
  };
  return (
    <div
      {...mergeProps(api.getRootProps(), { className: ARKHE_CLASS })}
      data-size={size}
      data-label-hidden={flag(labelHidden)}>
      <label {...api.getLabelProps()}>{label}</label>
      <div {...api.getControlProps()}>
        <button
          {...api.getTriggerProps()}
          aria-describedby={fieldDescribedBy(ids, hint, error)}>
          <span {...api.getValueTextProps()}>
            {api.valueAsString || placeholder}
          </span>
          <span {...api.getIndicatorProps()}>
            <Icon name='chevron-down' />
          </span>
        </button>
      </div>
      <FieldNote ids={ids} hint={hint} error={error} />
      <select {...api.getHiddenSelectProps()}>
        <option value=''>{emptyLabel}</option>
        {shown
          .filter(
            (item) =>
              item.value !== EMPTY_VALUE &&
              (!rows.on || api.value.includes(item.value)),
          )
          .map((item) => (
            <option
              key={item.value}
              value={item.value}
              disabled={item.disabled}>
              {item.label}
            </option>
          ))}
      </select>
      {hydrated ? (
        <Portal container={container} getRootNode={env.getRootNode}>
          <div className={ARKHE_CLASS}>
            <div {...api.getPositionerProps()}>
              <div
                {...api.getContentProps()}
                ref={attach}
                style={rows.vars}
                data-virtual={flag(rows.on)}>
                {options()}
              </div>
            </div>
          </div>
        </Portal>
      ) : null}
    </div>
  );
};
