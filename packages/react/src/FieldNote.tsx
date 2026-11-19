/**
 * @fileoverview FieldNote: the line under a control, the hint or, once there
 * is one, the error. A new error is announced politely. Not exported: Field,
 * the select family and NumericInput share it.
 *
 * @module packages/react/src/FieldNote
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

'use client';

import { partAttrs, type FieldIds } from '@arkhe/core';
import { useEffect, type JSX } from 'react';
import { useArkhe } from './ArkheProvider.js';

/**
 * Props of FieldNote.
 *
 * @interface FieldNoteProps
 * @property {FieldIds} ids - Field ids; the line takes the hint or error id.
 * @property {string} [hint] - Help text.
 * @property {string} [error] - Error text; replaces the hint.
 */
export interface FieldNoteProps {
  readonly ids: FieldIds;
  readonly hint?: string;
  readonly error?: string;
}

/**
 * Renders the hint or the error line.
 *
 * @component
 * @param {FieldNoteProps} props - Ids, hint, error.
 * @returns {JSX.Element | null} Line, or nothing.
 */
export const FieldNote = ({
  ids,
  hint,
  error,
}: FieldNoteProps): JSX.Element | null => {
  const { announcer } = useArkhe();
  useEffect(() => {
    if (error) announcer.announce(error);
  }, [error, announcer]);
  if (error) {
    return (
      <p {...partAttrs('field', 'error')} id={ids.error}>
        {error}
      </p>
    );
  }
  return hint ? (
    <p {...partAttrs('field', 'hint')} id={ids.hint}>
      {hint}
    </p>
  ) : null;
};
