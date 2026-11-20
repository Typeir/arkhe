/**
 * @fileoverview Search: a text input whose host answers each query, grouped
 * when results name groups. Enter with nothing highlighted submits the text.
 * Nothing filters here: with `search`, each query runs the host's request
 * once typing pauses, aborting the one before, so the host filters where
 * the data lives; without it, the host answers `onInputChange` with
 * `items`. At phone width it opens a sheet that closes on a choice or a
 * submit. On Zag's combobox machine.
 *
 * @module packages/react/src/select/Search
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

'use client';

import {
  ARKHE_CLASS,
  SearchRequest,
  partAttrs,
  type Placement,
  type SearchRun,
  type SearchState,
  type SelectOption,
} from '@arkhe/core';
import { useEffect, useState, type JSX, type ReactNode } from 'react';
import { ComboboxField } from './ComboboxField.js';
import { SheetField } from './SheetField.js';
import { useNarrow } from '../base/useNarrow.js';

/**
 * Props of Search. Give `search`, or `items` with `onInputChange`.
 *
 * @interface SearchProps
 * @template {SelectOption} T
 * @property {string} label - Visible label.
 * @property {SearchRun<T>} [search] - Runs the query where the data lives; aborted when a newer one starts.
 * @property {number} [debounce] - Milliseconds `search` waits for typing to pause. Defaults to `SEARCH_DEBOUNCE`.
 * @property {readonly T[]} [items] - Results for the current text, when the host answers `onInputChange` itself.
 * @property {(text: string) => void} [onInputChange] - Every edit of the text.
 * @property {(text: string) => void} [onSubmit] - Takes the text on Enter when nothing is highlighted.
 * @property {(item: T) => void} [onSelect] - A result was chosen.
 * @property {string} [placeholder] - Input placeholder.
 * @property {boolean} [loading] - Shows the loading line instead of `items`.
 * @property {(item: T) => ReactNode} [renderItem] - Result body. Defaults to label and description.
 * @property {boolean} [disabled] - Blocks input.
 * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
 * @property {'s' | 'm' | 'l'} [size] - Control size. Defaults to `m`.
 * @property {boolean} [labelHidden] - Keeps the label for assistive tech only.
 * @property {string} [hint] - Help text under the control.
 * @property {string} [error] - Error text; replaces the hint and marks the control invalid.
 * @property {number} [rowPitch] - Row height in rem; draws only the rows in view, for long lists. Flat lists only.
 */
export interface SearchProps<T extends SelectOption> {
  readonly label: string;
  readonly search?: SearchRun<T>;
  readonly debounce?: number;
  readonly items?: readonly T[];
  readonly onInputChange?: (text: string) => void;
  readonly onSubmit?: (text: string) => void;
  readonly onSelect?: (item: T) => void;
  readonly placeholder?: string;
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
 * Renders a labelled search box over host-answered results.
 *
 * @component
 * @param {SearchProps<T>} props - Label, request or results, callbacks.
 * @returns {JSX.Element} Search.
 */
export const Search = <T extends SelectOption>({
  search,
  debounce,
  items = [],
  onInputChange,
  loading,
  ...rest
}: SearchProps<T>): JSX.Element => {
  const [state, setState] = useState<SearchState<T>>({
    items: [],
    loading: false,
    failed: false,
  });
  const [request] = useState(() => new SearchRequest<T>(setState, debounce));
  useEffect(() => () => request.dispose(), [request]);
  const narrow = useNarrow();
  const answered = search === undefined;
  const field = (close?: () => void) => (
    <ComboboxField
      {...rest}
      items={answered ? items : state.items}
      loading={answered ? loading : state.loading && state.items.length === 0}
      failed={!answered && state.failed}
      filter={false}
      enterKeyHint='search'
      onInputChange={onInputChange}
      onQuery={(text) => {
        if (search) request.query(text, search);
      }}
      {...(close
        ? {
            labelHidden: true,
            hint: undefined,
            error: undefined,
            inline: true,
            onSelect: (item: T) => {
              rest.onSelect?.(item);
              close();
            },
            onSubmit: (text: string) => {
              rest.onSubmit?.(text);
              close();
            },
          }
        : {})}
    />
  );
  return (
    <div className={ARKHE_CLASS} {...partAttrs('search', 'root')} role='search'>
      {narrow ? (
        <SheetField
          label={rest.label}
          placeholder={rest.placeholder}
          size={rest.size}
          labelHidden={rest.labelHidden}
          disabled={rest.disabled}
          hint={rest.hint}
          error={rest.error}>
          {field}
        </SheetField>
      ) : (
        field()
      )}
    </div>
  );
};
