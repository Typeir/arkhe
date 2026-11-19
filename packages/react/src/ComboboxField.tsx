/**
 * @fileoverview ComboboxField: a text input that filters a list of options,
 * on Zag's combobox machine. Not exported: it is the body of the searchable
 * Select, of Picker and of Search.
 *
 * @module packages/react/src/ComboboxField
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  REACT_EVENTS,
  EMPTY_VALUE,
  comboboxMachineProps,
  flag,
  fromEmptyValue,
  filterOptions,
  guardComboboxKeys,
  isGrouped,
  optionCollection,
  queryAfterChange,
  toEmptyValue,
  withEmptyOption,
  type SelectOption,
  type OptionFilter,
  type Placement,
} from '@arkhe/core';
import * as combobox from '@zag-js/combobox';
import { Portal, mergeProps, normalizeProps, useMachine } from '@zag-js/react';
import { useId, useMemo, useState, type JSX, type ReactNode } from 'react';
import { useArkhe } from './ArkheProvider.js';
import { useArkheEnvironment } from './ArkheEnvironment.js';
import { ComboboxList, type ListNote } from './ComboboxList.js';
import { Icon } from './Icon.js';
import { useHydrated } from './useHydrated.js';
import { usePortalContainer } from './usePortalContainer.js';
import { useVirtualRows } from './useVirtualRows.js';

/**
 * Props of ComboboxField.
 *
 * @interface ComboboxFieldProps
 * @template {SelectOption} T
 * @property {string} label - Visible label.
 * @property {readonly T[]} items - Options; a repeated value is dropped.
 * @property {string} [placeholder] - Input placeholder.
 * @property {string | null} [value] - Selected value; makes the selection controlled.
 * @property {string | null} [defaultValue] - First selection when uncontrolled.
 * @property {(value: string | null) => void} [onValueChange] - Selection changes.
 * @property {(item: T) => void} [onSelect] - Every choice, even a repeat.
 * @property {boolean} [clearOnSelect] - Picker mode: empties the input after a choice.
 * @property {(text: string) => void} [onInputChange] - Every edit of the text.
 * @property {(text: string) => void} [onQuery] - Text the user typed; not text a choice or clear wrote.
 * @property {OptionFilter<T>} [filter] - Match rule; `false` when the host filters.
 * @property {boolean} [loading] - Shows the loading line instead of options.
 * @property {boolean} [failed] - Shows the error line instead of options.
 * @property {(text: string) => void} [onSubmit] - Takes free text on Enter when nothing is highlighted.
 * @property {(item: T) => ReactNode} [renderItem] - Option body. Defaults to label and description.
 * @property {boolean} [disabled] - Blocks input.
 * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
 * @property {string} [emptyLabel] - Text of a first option that stands for no choice, such as "All".
 * @property {'s' | 'm' | 'l'} [size] - Control size. Defaults to `m`.
 * @property {boolean} [labelHidden] - Keeps the label for assistive tech only.
 * @property {boolean} [inline] - Renders the list in place and always shown, as inside a sheet; the input empties and the list opens as it takes focus.
 * @property {string} [name] - Form field name; a hidden input carries the value.
 * @property {'search' | 'done' | 'go' | 'next' | 'enter'} [enterKeyHint] - Label of the on-screen keyboard's Enter key.
 * @property {boolean} [required] - The input must not be empty.
 * @property {number} [rowPitch] - Row height in rem; draws only the rows in view. Flat lists only.
 */
export interface ComboboxFieldProps<T extends SelectOption> {
  readonly label: string;
  readonly items: readonly T[];
  readonly placeholder?: string;
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onValueChange?: (value: string | null) => void;
  readonly onSelect?: (item: T) => void;
  readonly clearOnSelect?: boolean;
  readonly onInputChange?: (text: string) => void;
  readonly onQuery?: (text: string) => void;
  readonly filter?: OptionFilter<T>;
  readonly loading?: boolean;
  readonly failed?: boolean;
  readonly onSubmit?: (text: string) => void;
  readonly renderItem?: (item: T) => ReactNode;
  readonly disabled?: boolean;
  readonly placement?: Placement;
  readonly emptyLabel?: string;
  readonly size?: 's' | 'm' | 'l';
  readonly labelHidden?: boolean;
  readonly inline?: boolean;
  readonly name?: string;
  readonly enterKeyHint?: 'search' | 'done' | 'go' | 'next' | 'enter';
  readonly required?: boolean;
  readonly rowPitch?: number;
}

/**
 * Renders the default option body: icon, label, then a muted description.
 *
 * @function optionBody
 * @param {SelectOption} item - Option.
 * @param {'combobox' | 'select'} scope - Zag scope of the list.
 * @returns {ReactNode} Body.
 */
export function optionBody(
  item: SelectOption,
  scope: 'combobox' | 'select',
): ReactNode {
  return (
    <>
      {item.icon ? <Icon name={item.icon} /> : null}
      <span data-scope={scope} data-part='item-label'>
        {item.label}
      </span>
      {item.description ? (
        <span data-scope={scope} data-part='item-description'>
          {item.description}
        </span>
      ) : null}
    </>
  );
}

/**
 * Renders a labelled combobox and its portalled option list.
 *
 * @component
 * @param {ComboboxFieldProps<T>} props - Label, options, selection, search hooks.
 * @returns {JSX.Element} Combobox.
 */
export const ComboboxField = <T extends SelectOption>(
  props: ComboboxFieldProps<T>,
): JSX.Element => {
  const { label, filter, loading, failed, emptyLabel } = props;
  const items = useMemo(
    () => withEmptyOption(props.items, emptyLabel) as readonly T[],
    [props.items, emptyLabel],
  );
  const renderItem =
    props.renderItem ?? ((item: T) => optionBody(item, 'combobox'));
  const { labels, locale } = useArkhe();
  const env = useArkheEnvironment();
  const container = usePortalContainer();
  const hydrated = useHydrated();
  const [query, setQuery] = useState('');
  const shown = useMemo(
    () => filterOptions(items, query, filter),
    [items, query, filter],
  );
  const collection = useMemo(
    () => combobox.collection(optionCollection(shown)),
    [shown],
  );
  const { attach, ...rows } = useVirtualRows(
    shown.length,
    isGrouped(shown) ? undefined : props.rowPitch,
  );
  const note: ListNote | undefined = loading
    ? 'loading'
    : failed
      ? 'failed'
      : shown.length === 0
        ? 'empty'
        : undefined;
  const service = useMachine(combobox.machine, {
    ...comboboxMachineProps({
      ...props,
      id: useId(),
      labels,
      locale,
      value: toEmptyValue(props.value, emptyLabel),
      defaultValue: toEmptyValue(props.defaultValue ?? null, emptyLabel),
      submits: props.onSubmit !== undefined,
      getRootNode: env.getRootNode,
    }),
    ...(props.inline && !props.clearOnSelect
      ? { selectionBehavior: 'preserve' as const }
      : {}),
    ...(rows.on ? { scrollToIndexFn: rows.scrollTo } : {}),
    collection,
    onInputValueChange: (details) => {
      setQuery(queryAfterChange(details));
      props.onInputChange?.(details.inputValue);
      if (details.reason === 'input-change')
        props.onQuery?.(details.inputValue);
    },
    onValueChange: (details) =>
      props.onValueChange?.(fromEmptyValue(details.value[0] ?? null)),
    onSelect: (details) => {
      const item = items.find((option) => option.value === details.itemValue);
      if (item) props.onSelect?.(item);
    },
  });
  const api = combobox.connect(service, normalizeProps);
  const focusInline = () => {
    api.setInputValue('');
    api.setOpen(true);
  };
  const option = (item: T, index: number) => (
    <div
      key={item.value}
      {...api.getItemProps({ item })}
      {...rows.position(index)}>
      {item.value === EMPTY_VALUE && emptyLabel !== undefined
        ? optionBody(item, 'combobox')
        : renderItem(item)}
    </div>
  );
  const list = (
    <ComboboxList
      api={api}
      collection={collection}
      shown={shown}
      note={note}
      emptyText={labels.selectEmpty}
      option={option}
      inline={props.inline}
      rows={rows}
      attach={attach}
    />
  );
  return (
    <div
      {...mergeProps(api.getRootProps(), { className: ARKHE_CLASS })}
      data-size={props.size}
      data-label-hidden={flag(props.labelHidden)}>
      <label {...api.getLabelProps()}>{label}</label>
      <div {...api.getControlProps()}>
        <input
          {...mergeProps(
            guardComboboxKeys(
              api.getInputProps(),
              {
                highlighted: () => api.highlightedValue,
                inputValue: () => api.inputValue,
                select: (value) => api.selectValue(value),
                close: () => api.setOpen(false),
                submit: props.onSubmit,
              },
              REACT_EVENTS,
            ),
            props.inline ? { onFocus: focusInline } : {},
            { enterKeyHint: props.enterKeyHint },
          )}
        />
        <button {...api.getClearTriggerProps()}>
          <Icon name='x' />
        </button>
        {props.inline ? null : (
          <button {...api.getTriggerProps()}>
            <Icon name='chevron-down' />
          </button>
        )}
      </div>
      {props.name === undefined ? null : (
        <input
          type='hidden'
          name={props.name}
          value={fromEmptyValue(api.value[0] ?? null) ?? ''}
        />
      )}
      {props.inline ? (
        list
      ) : hydrated ? (
        <Portal container={container} getRootNode={env.getRootNode}>
          <div className={ARKHE_CLASS}>
            <div {...api.getPositionerProps()}>{list}</div>
          </div>
        </Portal>
      ) : null}
    </div>
  );
};
