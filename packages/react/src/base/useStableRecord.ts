/**
 * @fileoverview Keeps the first of equal records, so an object written
 * inline keeps one identity while its contents hold.
 *
 * @module packages/react/src/base/useStableRecord
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import { sameRecord } from '@arkhe/core';
import { useState } from 'react';

/**
 * Returns `record`, or the earlier record when the two hold the same
 * entries. A change of contents is taken during render, before anything
 * below sees the old one.
 *
 * @function useStableRecord
 * @template {object | undefined} T
 * @param {T} record - Record from this render.
 * @returns {T} Record with a stable identity.
 */
export function useStableRecord<T extends object | undefined>(record: T): T {
  const [kept, setKept] = useState(() => record);
  if (!sameRecord(kept, record)) {
    setKept(() => record);
    return record;
  }
  return kept;
}
