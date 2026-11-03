/**
 * @fileoverview Combobox: a text input that filters a list of options, on
 * Zag's combobox machine. Serves three jobs: a searchable select, a picker
 * that adds the chosen option elsewhere and empties itself, and a search box
 * whose host supplies results and takes free text on Enter.
 *
 * @module packages/react/src/Combobox
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  REACT_EVENTS,
  comboboxMachineProps,
  filterOptions,
  guardComboboxKeys,
  isGrouped,
  optionCollection,
  partAttrs,
  queryAfterChange,
  slug,
  type ComboboxOption,
  type OptionFilter,
  type Placement,
} from '@arkhe/core';
import * as combobox from '@zag-js/combobox';
import { Portal, mergeProps, normalizeProps, useMachine } from '@zag-js/react';
import { useId, useMemo, useState, type JSX, type ReactNode } from 'react';
import { useArkhe } from './ArkheProvider.js';
import { useArkheEnvironment } from './ArkheEnvironment.js';
import { Icon } from './Icon.js';
import { Status } from './Status.js';
import { useHydrated } from './useHydrated.js';
import { usePortalContainer } from './usePortalContainer.js';

/**
 * Props of Combobox.
 *
 * @interface ComboboxProps
 * @template {ComboboxOption} T
 * @property {string} label - Visible label.
 * @property {readonly T[]} items - Options; a repeated value is dropped.
 * @property {string} [placeholder] - Input placeholder.
 * @property {string | null} [value] - Selected value; makes the selection controlled.
 * @property {string | null} [defaultValue] - First selection when uncontrolled.
 * @property {(value: string | null) => void} [onValueChange] - Selection changes.
 * @property {(item: T) => void} [onSelect] - Every choice, even a repeat.
 * @property {boolean} [clearOnSelect] - Picker mode: empties the input after a choice.
 * @property {(text: string) => void} [onInputChange] - Every edit of the text.
 * @property {OptionFilter<T>} [filter] - Match rule; `false` when the host filters.
 * @property {boolean} [loading] - Shows the loading line instead of options.
 * @property {(text: string) => void} [onSubmit] - Takes free text on Enter when nothing is highlighted.
 * @property {(item: T) => ReactNode} [renderItem] - Option body. Defaults to label and description.
 * @property {boolean} [disabled] - Blocks input.
 * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
 */
export interface ComboboxProps<T extends ComboboxOption> {
  readonly label: string;
  readonly items: readonly T[];
  readonly placeholder?: string;
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onValueChange?: (value: string | null) => void;
  readonly onSelect?: (item: T) => void;
  readonly clearOnSelect?: boolean;
  readonly onInputChange?: (text: string) => void;
  readonly filter?: OptionFilter<T>;
  readonly loading?: boolean;
  readonly onSubmit?: (text: string) => void;
  readonly renderItem?: (item: T) => ReactNode;
  readonly disabled?: boolean;
  readonly placement?: Placement;
}

/**
 * Renders the default option body: label, then a muted description.
 *
 * @function defaultItem
 * @param {ComboboxOption} item - Option.
 * @returns {ReactNode} Body.
 */
function defaultItem(item: ComboboxOption): ReactNode {
  return (
    <>
      <span data-scope='combobox' data-part='item-label'>
        {item.label}
      </span>
      {item.description ? (
        <span data-scope='combobox' data-part='item-description'>
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
 * @param {ComboboxProps<T>} props - Label, options, selection, search hooks.
 * @returns {JSX.Element} Combobox.
 */
export const Combobox = <T extends ComboboxOption>(
  props: ComboboxProps<T>,
): JSX.Element => {
  const { label, items, filter, loading, renderItem = defaultItem } = props;
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
  const note = Boolean(loading) || shown.length === 0;
  const service = useMachine(combobox.machine, {
    ...comboboxMachineProps({
      ...props,
      id: useId(),
      labels,
      locale,
      submits: props.onSubmit !== undefined,
      getRootNode: env.getRootNode,
    }),
    collection,
    onInputValueChange: (details) => {
      setQuery(queryAfterChange(details));
      props.onInputChange?.(details.inputValue);
    },
    onValueChange: (details) => props.onValueChange?.(details.value[0] ?? null),
    onSelect: (details) => {
      const item = items.find((option) => option.value === details.itemValue);
      if (item) props.onSelect?.(item);
    },
  });
  const api = combobox.connect(service, normalizeProps);
  const option = (item: T) => (
    <div key={item.value} {...api.getItemProps({ item })}>
      {renderItem(item)}
    </div>
  );
  return (
    <div {...mergeProps(api.getRootProps(), { className: ARKHE_CLASS })}>
      <label {...api.getLabelProps()}>{label}</label>
      <div {...api.getControlProps()}>
        <input
          {...guardComboboxKeys(
            api.getInputProps(),
            {
              highlighted: () => api.highlightedValue,
              inputValue: () => api.inputValue,
              select: (value) => api.selectValue(value),
              close: () => api.setOpen(false),
              submit: props.onSubmit,
            },
            REACT_EVENTS,
          )}
        />
        <button {...api.getClearTriggerProps()}>
          <Icon name='x' />
        </button>
        <button {...api.getTriggerProps()}>
          <Icon name='chevron-down' />
        </button>
      </div>
      {hydrated ? (
        <Portal container={container} getRootNode={env.getRootNode}>
          <div className={ARKHE_CLASS}>
            <div {...api.getPositionerProps()}>
              {note ? (
                <div {...partAttrs('combobox', 'note')} hidden={!api.open}>
                  {loading ? (
                    <Status kind='loading' />
                  ) : (
                    <div {...partAttrs('combobox', 'empty')}>
                      {labels.comboboxEmpty}
                    </div>
                  )}
                </div>
              ) : null}
              <div
                {...mergeProps(api.getContentProps(), {
                  hidden: note || !api.open,
                })}>
                {note
                  ? null
                  : isGrouped(shown)
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
