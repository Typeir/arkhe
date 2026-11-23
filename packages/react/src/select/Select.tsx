/**
 * @fileoverview Select: one choice from a list of options. A button that
 * opens the list (Zag select); with `searchable`, a text input that filters
 * it (Zag combobox).
 *
 * @module packages/react/src/select/Select
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

'use client';

import type { OptionFilter, Placement, SelectOption } from '@arkhe/core';
import type { JSX, ReactNode } from 'react';
import { useControllable } from '../base/useControllable.js';
import { useNarrow } from '../base/useNarrow.js';
import { ComboboxField } from './ComboboxField.js';
import { SelectMenu } from './SelectMenu.js';
import { SheetField } from './SheetField.js';

/**
 * Props of Select.
 *
 * @interface SelectProps
 * @template {SelectOption} T
 * @property {string} label - Visible label.
 * @property {readonly T[]} items - Options; a repeated value is dropped.
 * @property {string} [placeholder] - Shown while nothing is chosen.
 * @property {string | null} [value] - Selected value; makes the selection controlled.
 * @property {string | null} [defaultValue] - First selection when uncontrolled.
 * @property {(value: string | null) => void} [onValueChange] - Selection changes.
 * @property {boolean} [searchable] - Filters the list as the user types.
 * @property {OptionFilter<T>} [filter] - Match rule when searchable. Defaults to `matchOption`.
 * @property {(item: T) => ReactNode} [renderItem] - Option body. Defaults to label and description.
 * @property {string} [name] - Form field name.
 * @property {boolean} [required] - A value must be chosen; searchable, the input must not be empty.
 * @property {string} [autoComplete] - Autofill hint, such as `country`; not searchable only.
 * @property {boolean} [disabled] - Blocks interaction.
 * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
 * @property {string} [emptyLabel] - Text of a first option that stands for no choice, such as "All".
 * @property {'s' | 'm' | 'l'} [size] - Control size. Defaults to `m`.
 * @property {boolean} [labelHidden] - Keeps the label for assistive tech only.
 * @property {string} [hint] - Help text under the control.
 * @property {string} [error] - Error text; replaces the hint and marks the control invalid.
 * @property {number} [rowPitch] - Row height in rem; draws only the rows in view, for long lists. Flat lists only.
 */
export interface SelectProps<T extends SelectOption> {
  readonly label: string;
  readonly items: readonly T[];
  readonly placeholder?: string;
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onValueChange?: (value: string | null) => void;
  readonly searchable?: boolean;
  readonly filter?: OptionFilter<T>;
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
 * Renders the phone-width Select: a button showing the choice, opening a
 * sheet with a search box and the list. Choosing closes the sheet.
 *
 * @component
 * @param {SelectProps<T>} props - Label, options, selection.
 * @returns {JSX.Element} Select.
 */
const SelectSheet = <T extends SelectOption>({
  label,
  items,
  placeholder,
  value,
  defaultValue,
  onValueChange,
  disabled,
  emptyLabel,
  size,
  labelHidden,
  name,
  required,
  hint,
  error,
  ...rest
}: SelectProps<T>): JSX.Element => {
  const { current, commit } = useControllable({
    value,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });
  const text =
    current === null
      ? emptyLabel
      : items.find((item) => item.value === current)?.label;
  return (
    <SheetField
      label={label}
      text={text}
      placeholder={placeholder}
      size={size}
      labelHidden={labelHidden}
      disabled={disabled}
      name={name}
      value={current}
      required={required}
      hint={hint}
      error={error}>
      {(close) => (
        <ComboboxField
          {...rest}
          label={label}
          items={items}
          placeholder={placeholder}
          disabled={disabled}
          emptyLabel={emptyLabel}
          size={size}
          value={current}
          labelHidden
          inline
          onValueChange={commit}
          onSelect={close}
        />
      )}
    </SheetField>
  );
};

/**
 * Renders a labelled select; searchable when asked. At phone width it opens
 * a sheet instead of a dropdown, with a search box either way.
 *
 * @component
 * @param {SelectProps<T>} props - Label, options, selection.
 * @returns {JSX.Element} Select.
 */
export const Select = <T extends SelectOption>({
  searchable,
  filter,
  name,
  required,
  autoComplete,
  ...shared
}: SelectProps<T>): JSX.Element => {
  const narrow = useNarrow();
  if (narrow) {
    return (
      <SelectSheet
        {...shared}
        searchable={searchable}
        filter={filter}
        name={name}
        required={required}
        autoComplete={autoComplete}
      />
    );
  }
  return searchable ? (
    <ComboboxField
      {...shared}
      filter={filter}
      name={name}
      required={required}
    />
  ) : (
    <SelectMenu
      {...shared}
      name={name}
      required={required}
      autoComplete={autoComplete}
    />
  );
};
