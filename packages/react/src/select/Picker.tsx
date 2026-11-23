/**
 * @fileoverview Picker: a text input that filters a list of options,
 * reports every choice and empties itself, for adding to a list kept
 * elsewhere. On Zag's combobox machine.
 *
 * @module packages/react/src/select/Picker
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

'use client';

import type { OptionFilter, Placement, SelectOption } from '@arkhe/core';
import type { JSX, ReactNode } from 'react';
import { useNarrow } from '../base/useNarrow.js';
import { ComboboxField } from './ComboboxField.js';
import { SheetField } from './SheetField.js';

/**
 * Props of Picker.
 *
 * @interface PickerProps
 * @template {SelectOption} T
 * @property {string} label - Visible label.
 * @property {readonly T[]} items - Options; a repeated value is dropped.
 * @property {(item: T) => void} onSelect - Every choice, even a repeat.
 * @property {string} [placeholder] - Input placeholder.
 * @property {(text: string) => void} [onInputChange] - Every edit of the text.
 * @property {OptionFilter<T>} [filter] - Match rule; `false` when the host filters. Defaults to `matchOption`.
 * @property {boolean} [loading] - Shows the loading line instead of options.
 * @property {(item: T) => ReactNode} [renderItem] - Option body. Defaults to label and description.
 * @property {boolean} [disabled] - Blocks input.
 * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
 * @property {'s' | 'm' | 'l'} [size] - Control size. Defaults to `m`.
 * @property {boolean} [labelHidden] - Keeps the label for assistive tech only.
 * @property {string} [hint] - Help text under the control.
 * @property {string} [error] - Error text; replaces the hint and marks the control invalid.
 * @property {number} [rowPitch] - Row height in rem; draws only the rows in view, for long lists. Flat lists only.
 */
export interface PickerProps<T extends SelectOption> {
  readonly label: string;
  readonly items: readonly T[];
  readonly onSelect: (item: T) => void;
  readonly placeholder?: string;
  readonly onInputChange?: (text: string) => void;
  readonly filter?: OptionFilter<T>;
  readonly loading?: boolean;
  readonly renderItem?: (item: T) => ReactNode;
  readonly disabled?: boolean;
  readonly placement?: Placement;
  readonly size?: 's' | 'm' | 'l';
  readonly labelHidden?: boolean;
  readonly hint?: string;
  readonly error?: string;
  readonly rowPitch?: number;
}

/**
 * Renders a labelled picker that empties itself after each choice. At phone
 * width it opens a sheet that stays open while choices are added.
 *
 * @component
 * @param {PickerProps<T>} props - Label, options, choice callback.
 * @returns {JSX.Element} Picker.
 */
export const Picker = <T extends SelectOption>({
  label,
  placeholder,
  size,
  labelHidden,
  disabled,
  hint,
  error,
  ...rest
}: PickerProps<T>): JSX.Element => {
  const narrow = useNarrow();
  if (!narrow) {
    return (
      <ComboboxField
        {...rest}
        label={label}
        placeholder={placeholder}
        size={size}
        labelHidden={labelHidden}
        disabled={disabled}
        hint={hint}
        error={error}
        clearOnSelect
      />
    );
  }
  return (
    <SheetField
      label={label}
      placeholder={placeholder}
      size={size}
      labelHidden={labelHidden}
      disabled={disabled}
      hint={hint}
      error={error}>
      {() => (
        <ComboboxField
          {...rest}
          label={label}
          placeholder={placeholder}
          size={size}
          disabled={disabled}
          clearOnSelect
          labelHidden
          inline
        />
      )}
    </SheetField>
  );
};
