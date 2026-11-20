/**
 * @fileoverview VirtualList: a scroll box over a long list of fixed-pitch
 * rows that draws only the rows in view plus an overscan margin. Each row
 * says its place in the whole set.
 *
 * @module packages/react/src/list/VirtualList
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

'use client';

import { ARKHE_CLASS, partAttrs, type VirtualRange } from '@arkhe/core';
import { useEffect, type CSSProperties, type JSX, type ReactNode } from 'react';
import { useVirtualRows } from './useVirtualRows.js';

/**
 * Props of VirtualList.
 *
 * @interface VirtualListProps
 * @template T
 * @property {readonly T[]} items - Rows.
 * @property {number} rowPitch - Row height in rem.
 * @property {(item: T, index: number) => ReactNode} renderItem - Row body.
 * @property {string} [label] - Accessible name of the list.
 * @property {string} [maxHeight] - CSS height past which the list scrolls. Defaults to `37.5rem`.
 * @property {number} [overscan] - Rows drawn past each edge of the view. Defaults to `VIRTUAL_OVERSCAN`.
 * @property {(item: T, index: number) => string | number} [getKey] - Stable row key. Defaults to the index.
 * @property {(visible: VirtualRange) => void} [onRange] - Rows in view changed, as to load more near the end.
 */
export interface VirtualListProps<T> {
  readonly items: readonly T[];
  readonly rowPitch: number;
  readonly renderItem: (item: T, index: number) => ReactNode;
  readonly label?: string;
  readonly maxHeight?: string;
  readonly overscan?: number;
  readonly getKey?: (item: T, index: number) => string | number;
  readonly onRange?: (visible: VirtualRange) => void;
}

/**
 * Renders the rows in view of a long list.
 *
 * @component
 * @param {VirtualListProps<T>} props - Rows, pitch, row body.
 * @returns {JSX.Element} List.
 */
export const VirtualList = <T,>(props: VirtualListProps<T>): JSX.Element => {
  const { items, renderItem, getKey, onRange } = props;
  const { attach, ...rows } = useVirtualRows(
    items.length,
    props.rowPitch,
    props.overscan,
  );
  const { start, end } = rows.visible;
  useEffect(() => {
    onRange?.({ start, end });
  }, [start, end, onRange]);
  return (
    <div
      className={ARKHE_CLASS}
      {...partAttrs('virtual-list', 'root')}
      role='list'
      aria-label={props.label}
      ref={attach}
      style={
        { ...rows.vars, '--virtual-max': props.maxHeight } as CSSProperties
      }
      data-virtual=''>
      {items.slice(rows.range.start, rows.range.end).map((item, at) => {
        const index = rows.range.start + at;
        return (
          <div
            key={getKey?.(item, index) ?? index}
            {...partAttrs('virtual-list', 'item')}
            role='listitem'
            {...rows.position(index)}>
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
};
