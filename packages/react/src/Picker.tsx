/**
 * @fileoverview Picker: a text input that filters a list of options,
 * reports every choice and empties itself, for adding to a list kept
 * elsewhere. On Zag's combobox machine.
 *
 * @module packages/react/src/Picker
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

'use client';

import type { ComboboxOption, OptionFilter, Placement } from '@arkhe/core';
import type { JSX, ReactNode } from 'react';
import { ComboboxField } from './ComboboxField.js';

/**
 * Props of Picker.
 *
 * @interface PickerProps
 * @template {ComboboxOption} T
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
 */
export interface PickerProps<T extends ComboboxOption> {
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
}

/**
 * Renders a labelled picker that empties itself after each choice.
 *
 * @component
 * @param {PickerProps<T>} props - Label, options, choice callback.
 * @returns {JSX.Element} Picker.
 */
export const Picker = <T extends ComboboxOption>(
  props: PickerProps<T>,
): JSX.Element => <ComboboxField {...props} clearOnSelect />;
