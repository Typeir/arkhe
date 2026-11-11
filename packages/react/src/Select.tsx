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

import type { ComboboxOption, OptionFilter, Placement } from '@arkhe/core';
import type { JSX, ReactNode } from 'react';
import { ComboboxField } from './ComboboxField.js';
import { SelectMenu } from './SelectMenu.js';

/**
 * Props of Select.
 *
 * @interface SelectProps
 * @template {ComboboxOption} T
 * @property {string} label - Visible label.
 * @property {readonly T[]} items - Options; a repeated value is dropped.
 * @property {string} [placeholder] - Shown while nothing is chosen.
 * @property {string | null} [value] - Selected value; makes the selection controlled.
 * @property {string | null} [defaultValue] - First selection when uncontrolled.
 * @property {(value: string | null) => void} [onValueChange] - Selection changes.
 * @property {boolean} [searchable] - Filters the list as the user types.
 * @property {OptionFilter<T>} [filter] - Match rule when searchable. Defaults to `matchOption`.
 * @property {(item: T) => ReactNode} [renderItem] - Option body. Defaults to label and description.
 * @property {string} [name] - Form field name; not searchable only.
 * @property {boolean} [required] - A value must be chosen; not searchable only.
 * @property {boolean} [disabled] - Blocks interaction.
 * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
 */
export interface SelectProps<T extends ComboboxOption> {
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
  readonly disabled?: boolean;
  readonly placement?: Placement;
}

/**
 * Renders a labelled select; searchable when asked.
 *
 * @component
 * @param {SelectProps<T>} props - Label, options, selection.
 * @returns {JSX.Element} Select.
 */
export const Select = <T extends ComboboxOption>({
  searchable,
  filter,
  name,
  required,
  ...shared
}: SelectProps<T>): JSX.Element =>
  searchable ? (
    <ComboboxField {...shared} filter={filter} />
  ) : (
    <SelectMenu {...shared} name={name} required={required} />
  );
