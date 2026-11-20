/**
 * @fileoverview ComboboxList: the option list of ComboboxField, or the line
 * that stands in for it while results load, fail or are empty. Not
 * exported. It renders in the floating dropdown, or inline in a sheet.
 *
 * @module packages/react/src/select/ComboboxList
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

'use client';

import {
  flag,
  isGrouped,
  partAttrs,
  slug,
  type SelectOption,
} from '@arkhe/core';
import type * as combobox from '@zag-js/combobox';
import { mergeProps, type PropTypes } from '@zag-js/react';
import type { JSX, ReactNode } from 'react';
import { Status } from '../feedback/Status.js';
import type { VirtualRows, VirtualRowsHandle } from '../list/useVirtualRows.js';

/**
 * What stands in for the list: results loading, the request failed, or
 * nothing matches.
 *
 * @typedef {'loading' | 'failed' | 'empty'} ListNote
 */
export type ListNote = 'loading' | 'failed' | 'empty';

/**
 * Props of ComboboxList.
 *
 * @interface ComboboxListProps
 * @template {SelectOption} T
 * @property {combobox.Api<PropTypes, T>} api - Zag combobox API.
 * @property {ReturnType<typeof combobox.collection<T>>} collection - Shown options as Zag's collection.
 * @property {readonly T[]} shown - Shown options.
 * @property {ListNote} [note] - Line shown instead of the options.
 * @property {string} emptyText - Text of the empty line.
 * @property {(item: T, index: number) => ReactNode} option - Renders one option at its place in `shown`.
 * @property {boolean} [inline] - Renders in place and always open.
 * @property {VirtualRows} rows - Virtual rows of a flat list.
 * @property {VirtualRowsHandle['attach']} attach - Callback ref of the list's scroll box.
 */
export interface ComboboxListProps<T extends SelectOption> {
  readonly api: combobox.Api<PropTypes, T>;
  readonly collection: ReturnType<typeof combobox.collection<T>>;
  readonly shown: readonly T[];
  readonly note?: ListNote;
  readonly emptyText: string;
  readonly option: (item: T, index: number) => ReactNode;
  readonly inline?: boolean;
  readonly rows: VirtualRows;
  readonly attach: VirtualRowsHandle['attach'];
}

/**
 * Renders the note line, then the listbox with grouped or flat options.
 *
 * @component
 * @param {ComboboxListProps<T>} props - API, options, note.
 * @returns {JSX.Element} Note and listbox.
 */
export const ComboboxList = <T extends SelectOption>({
  api,
  collection,
  shown,
  note,
  emptyText,
  option,
  inline,
  rows,
  attach,
}: ComboboxListProps<T>): JSX.Element => {
  const open = inline || api.open;
  return (
    <>
      {note ? (
        <div
          {...partAttrs('combobox', 'note')}
          data-inline={flag(inline)}
          hidden={!open}>
          {note === 'loading' ? (
            <Status kind='loading' />
          ) : note === 'failed' ? (
            <Status kind='error' />
          ) : (
            <div {...partAttrs('combobox', 'empty')}>{emptyText}</div>
          )}
        </div>
      ) : null}
      <div
        {...mergeProps(api.getContentProps(), { hidden: !!note || !open })}
        ref={attach}
        style={rows.vars}
        data-virtual={flag(rows.on)}
        data-inline={flag(inline)}>
        {note
          ? null
          : rows.on
            ? shown
                .slice(rows.range.start, rows.range.end)
                .map((item, at) => option(item, rows.range.start + at))
            : isGrouped(shown)
              ? collection.group().map(([group, members]) => (
                  <div
                    key={group}
                    {...api.getItemGroupProps({ id: slug(group) })}>
                    <div
                      {...api.getItemGroupLabelProps({ htmlFor: slug(group) })}>
                      {group}
                    </div>
                    {members.map(option)}
                  </div>
                ))
              : shown.map(option)}
      </div>
    </>
  );
};
