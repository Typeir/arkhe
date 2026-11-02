/**
 * @fileoverview Field: label, optional readout, one control, hint or error,
 * wired together by ids.
 *
 * @module packages/react/src/Field
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  fieldControlAttrs,
  fieldIds,
  flag,
  partAttrs,
  type FieldControlAttrs,
} from '@arkhe/core';
import { useId, type JSX, type ReactNode } from 'react';

/**
 * Props of Field.
 *
 * @interface FieldProps
 * @property {string} label - Visible label.
 * @property {ReactNode} [readout] - Current value shown beside the label; not announced as it changes.
 * @property {string} [hint] - Help text under the control.
 * @property {string} [error] - Error text; replaces the hint and marks the control invalid.
 * @property {(control: FieldControlAttrs) => ReactNode} children - Renders the control with the given attributes.
 */
export interface FieldProps {
  readonly label: string;
  readonly readout?: ReactNode;
  readonly hint?: string;
  readonly error?: string;
  readonly children: (control: FieldControlAttrs) => ReactNode;
}

/**
 * Renders a labelled control. The control receives its id, description ids
 * and invalid state through `children`.
 *
 * @component
 * @param {FieldProps} props - Component props.
 * @param {string} props.label - Visible label.
 * @param {ReactNode} [props.readout] - Current value beside the label.
 * @param {string} [props.hint] - Help text.
 * @param {string} [props.error] - Error text.
 * @param {(control: FieldControlAttrs) => ReactNode} props.children - Control renderer.
 * @returns {JSX.Element} Field.
 */
export const Field = ({
  label,
  readout,
  hint,
  error,
  children,
}: FieldProps): JSX.Element => {
  const ids = fieldIds(useId());
  const showHint = Boolean(hint) && !error;
  return (
    <div
      className={ARKHE_CLASS}
      {...partAttrs('field', 'root')}
      data-invalid={flag(Boolean(error))}>
      <div {...partAttrs('field', 'head')}>
        <label
          {...partAttrs('field', 'label')}
          id={ids.label}
          htmlFor={ids.control}>
          {label}
        </label>
        {readout === undefined ? null : (
          <output
            {...partAttrs('field', 'readout')}
            htmlFor={ids.control}
            aria-live='off'>
            {readout}
          </output>
        )}
      </div>
      {children(fieldControlAttrs(ids, showHint, Boolean(error)))}
      {showHint ? (
        <p {...partAttrs('field', 'hint')} id={ids.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p {...partAttrs('field', 'error')} id={ids.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
};
