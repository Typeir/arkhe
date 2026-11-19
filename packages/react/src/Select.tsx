/**
 * @fileoverview Select: one choice from a list of options. A button that
 * opens the list (Zag select) by default; with `searchable`, a text input
 * that filters it (Zag combobox).
 *
 * @module packages/react/src/Select
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

'use client';

import type { SelectOption, OptionFilter, Placement } from '@arkhe/core';
import { useState, type JSX, type ReactNode } from 'react';
import { ComboboxField } from './ComboboxField.js';
import { SelectMenu } from './SelectMenu.js';
import { SheetField } from './SheetField.js';
import { useNarrow } from './useNarrow.js';

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
  name,
  defaultValue,
  ...shared
}: SelectProps<T>): JSX.Element => {
  const [inner, setInner] = useState(defaultValue ?? null);
  const value = shared.value === undefined ? inner : shared.value;
  const text =
    value === null
      ? shared.emptyLabel
      : shared.items.find((item) => item.value === value)?.label;
  return (
    <SheetField
      label={shared.label}
      text={text}
      placeholder={shared.placeholder}
      size={shared.size}
      labelHidden={shared.labelHidden}
      disabled={shared.disabled}
      name={name}
      value={value}>
      {(close) => (
        <ComboboxField
          {...shared}
          value={value}
          labelHidden
          inline
          onValueChange={(next) => {
            setInner(next);
            shared.onValueChange?.(next);
          }}
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
export const Select = <T extends SelectOption>(
  props: SelectProps<T>,
): JSX.Element => {
  const { searchable, filter, name, required, autoComplete, ...shared } = props;
  if (useNarrow()) return <SelectSheet {...props} />;
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
