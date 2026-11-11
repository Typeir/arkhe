/**
 * @fileoverview Search: a text input whose host supplies the results as the
 * user types, grouped when they name groups. Enter with nothing highlighted
 * submits the text. On Zag's combobox machine; nothing filters here.
 *
 * @module packages/react/src/Search
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

'use client';

import type { ComboboxOption, Placement } from '@arkhe/core';
import type { JSX, ReactNode } from 'react';
import { ComboboxField } from './ComboboxField.js';

/**
 * Props of Search.
 *
 * @interface SearchProps
 * @template {ComboboxOption} T
 * @property {string} label - Visible label.
 * @property {readonly T[]} items - Results for the current text; a repeated value is dropped.
 * @property {(text: string) => void} onInputChange - Every edit of the text; the host answers with `items`.
 * @property {(text: string) => void} [onSubmit] - Takes the text on Enter when nothing is highlighted.
 * @property {(item: T) => void} [onSelect] - A result was chosen.
 * @property {string} [placeholder] - Input placeholder.
 * @property {boolean} [loading] - Shows the loading line instead of results.
 * @property {(item: T) => ReactNode} [renderItem] - Result body. Defaults to label and description.
 * @property {boolean} [disabled] - Blocks input.
 * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
 */
export interface SearchProps<T extends ComboboxOption> {
  readonly label: string;
  readonly items: readonly T[];
  readonly onInputChange: (text: string) => void;
  readonly onSubmit?: (text: string) => void;
  readonly onSelect?: (item: T) => void;
  readonly placeholder?: string;
  readonly loading?: boolean;
  readonly renderItem?: (item: T) => ReactNode;
  readonly disabled?: boolean;
  readonly placement?: Placement;
}

/**
 * Renders a labelled search box over host-supplied results.
 *
 * @component
 * @param {SearchProps<T>} props - Label, results, text and submit callbacks.
 * @returns {JSX.Element} Search.
 */
export const Search = <T extends ComboboxOption>(
  props: SearchProps<T>,
): JSX.Element => <ComboboxField {...props} filter={false} />;
