/**
 * @fileoverview useVirtualRows: the rows of a fixed-pitch list to draw for
 * its scroll box, the spacer properties for the rest, and a scroll that
 * brings any row into view. Without a pitch it draws every row.
 *
 * @module packages/react/src/useVirtualRows
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

'use client';

import {
  UNMEASURED_VIEW,
  VIRTUAL_OVERSCAN,
  rowPosition,
  scrollToRow,
  virtualRange,
  virtualVars,
  watchView,
  type RowPosition,
  type VirtualRange,
} from '@arkhe/core';
import { useCallback, useState, type CSSProperties } from 'react';

/**
 * Virtual rows of one list.
 *
 * @interface VirtualRows
 * @property {boolean} on - Rows are virtual.
 * @property {VirtualRange} range - Rows to draw.
 * @property {VirtualRange} visible - Rows in view, without the overscan.
 * @property {(details: { index: number }) => void} scrollTo - Shows a row; fits Zag's `scrollToIndexFn`.
 * @property {CSSProperties | undefined} vars - Spacer and pitch properties of the scroll box.
 * @property {(index: number) => RowPosition | undefined} position - Set position of a row.
 */
export interface VirtualRows {
  readonly on: boolean;
  readonly range: VirtualRange;
  readonly visible: VirtualRange;
  readonly scrollTo: (details: { index: number }) => void;
  readonly vars: CSSProperties | undefined;
  readonly position: (index: number) => RowPosition | undefined;
}

/**
 * Virtual rows plus the callback ref of their scroll box. Destructure
 * `attach` apart from the rows, so reading the rows is not a ref read.
 *
 * @interface VirtualRowsHandle
 * @property {(box: HTMLElement | null) => (() => void) | undefined} attach - Callback ref of the scroll box.
 */
export interface VirtualRowsHandle extends VirtualRows {
  readonly attach: (box: HTMLElement | null) => (() => void) | undefined;
}

/**
 * Tracks which of `count` rows, each `pitch` rem high, to draw.
 *
 * @function useVirtualRows
 * @param {number} count - Rows in the set.
 * @param {number} [pitch] - Row height in rem; none draws every row.
 * @param {number} [overscan] - Rows past each edge of the view.
 * @returns {VirtualRowsHandle} Rows to draw and their wiring.
 */
export function useVirtualRows(
  count: number,
  pitch?: number,
  overscan: number = VIRTUAL_OVERSCAN,
): VirtualRowsHandle {
  const [view, setView] = useState(UNMEASURED_VIEW);
  const [box, setBox] = useState<HTMLElement | null>(null);
  const attach = useCallback(
    (node: HTMLElement | null) => {
      setBox(node);
      return node && pitch !== undefined
        ? watchView(node, pitch, setView)
        : undefined;
    },
    [pitch],
  );
  if (pitch === undefined) {
    return {
      on: false,
      range: { start: 0, end: count },
      visible: { start: 0, end: count },
      attach,
      scrollTo: () => undefined,
      vars: undefined,
      position: () => undefined,
    };
  }
  const range = virtualRange(count, view, overscan);
  return {
    on: true,
    range,
    visible: virtualRange(count, view, 0),
    attach,
    scrollTo: ({ index }) => {
      const next = box && scrollToRow(box, index, pitch);
      if (next) setView(next);
    },
    vars: virtualVars(range, count, pitch) as CSSProperties,
    position: (index) => rowPosition(index, count),
  };
}
