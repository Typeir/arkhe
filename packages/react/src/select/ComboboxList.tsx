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

import type * as combobox from '@zag-js/combobox';
import type { JSX, ReactNode } from 'react';
import {
  flag,
  isGrouped,
  type ListNote,
  partAttrs,
  type SelectOption,
  slug,
} from '@arkhe/core';
import { mergeProps, type PropTypes } from '@zag-js/react';
import type { VirtualRows, VirtualRowsHandle } from '../list/useVirtualRows.js';
import { Status } from '../feedback/Status.js';

/**
 * Renders the line that stands in for the options.
 *
 * @function noteBody
 * @param {ListNote} note - Which line.
 * @param {string} emptyText - Text of the empty line.
 * @returns {ReactNode} Line.
 */
function noteBody(note: ListNote, emptyText: string): ReactNode {
  if (note === 'loading') return <Status kind='loading' />;
  if (note === 'failed') return <Status kind='error' />;
  return <div {...partAttrs('combobox', 'empty')}>{emptyText}</div>;
}

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
 * @property {boolean} [stale] - Dims the options while newer ones load.
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
  readonly stale?: boolean;
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
  stale,
}: ComboboxListProps<T>): JSX.Element => {
  const open = inline || api.open;
  const options = () => {
    if (rows.on) {
      return shown
        .slice(rows.range.start, rows.range.end)
        .map((item, at) => option(item, rows.range.start + at));
    }
    if (!isGrouped(shown)) return shown.map(option);
    return collection.group().map(([group, members]) => (
      <div key={group} {...api.getItemGroupProps({ id: slug(group) })}>
        <div {...api.getItemGroupLabelProps({ htmlFor: slug(group) })}>
          {group}
        </div>
        {members.map(option)}
      </div>
    ));
  };
  return (
    <>
      {note ? (
        <div
          {...partAttrs('combobox', 'note')}
          data-inline={flag(inline)}
          hidden={!open}>
          {noteBody(note, emptyText)}
        </div>
      ) : null}
      <div
        {...mergeProps(api.getContentProps(), {
          hidden: Boolean(note) || !open,
        })}
        ref={attach}
        style={rows.vars}
        data-virtual={flag(rows.on)}
        data-inline={flag(inline)}
        data-stale={flag(stale)}
        aria-busy={stale || undefined}>
        {note ? null : options()}
      </div>
    </>
  );
};
