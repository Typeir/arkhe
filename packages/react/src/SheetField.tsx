/**
 * @fileoverview SheetField: how Select, Picker and Search look at phone
 * width. A button shows the choice; it opens a sheet from the bottom edge
 * titled by the label, holding the search box and the list, so the
 * on-screen keyboard never covers them. Not exported.
 *
 * @module packages/react/src/SheetField
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

'use client';

import {
  ARKHE_CLASS,
  fieldDescribedBy,
  fieldIds,
  flag,
  partAttrs,
} from '@arkhe/core';
import { useId, useRef, useState, type JSX, type ReactNode } from 'react';
import { FieldNote } from './FieldNote.js';
import { Icon } from './Icon.js';
import { Modal } from './Modal.js';

/**
 * Props of SheetField.
 *
 * @interface SheetFieldProps
 * @property {string} label - Visible label; titles the sheet.
 * @property {string} [text] - The current choice, shown on the button.
 * @property {string} [placeholder] - Shown on the button without a choice.
 * @property {'s' | 'm' | 'l'} [size] - Control size. Defaults to `m`.
 * @property {boolean} [labelHidden] - Keeps the label for assistive tech only.
 * @property {boolean} [disabled] - Blocks opening.
 * @property {string} [name] - Form field name, carried by a stand-in input.
 * @property {string | null} [value] - Value the stand-in input submits.
 * @property {boolean} [required] - A value must be chosen; a stand-in input takes part in form validation.
 * @property {string} [hint] - Help text under the button.
 * @property {string} [error] - Error text; replaces the hint and marks the button invalid.
 * @property {(close: () => void) => ReactNode} children - Sheet body; `close` shuts the sheet.
 */
export interface SheetFieldProps {
  readonly label: string;
  readonly text?: string;
  readonly placeholder?: string;
  readonly size?: 's' | 'm' | 'l';
  readonly labelHidden?: boolean;
  readonly disabled?: boolean;
  readonly name?: string;
  readonly value?: string | null;
  readonly required?: boolean;
  readonly hint?: string;
  readonly error?: string;
  readonly children: (close: () => void) => ReactNode;
}

/**
 * Renders the button and its sheet; the sheet focuses its search box.
 *
 * @component
 * @param {SheetFieldProps} props - Label, shown choice, sheet body.
 * @returns {JSX.Element} Field.
 */
export const SheetField = ({
  label,
  text,
  placeholder,
  size,
  labelHidden,
  disabled,
  name,
  value,
  required,
  hint,
  error,
  children,
}: SheetFieldProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const id = useId();
  const ids = fieldIds(id);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div
      className={ARKHE_CLASS}
      {...partAttrs('select', 'root')}
      data-size={size}
      data-label-hidden={flag(labelHidden)}>
      <span {...partAttrs('select', 'label')} id={`${id}label`}>
        {label}
      </span>
      <div
        {...partAttrs('select', 'control')}
        data-invalid={flag(Boolean(error))}>
        <button
          ref={trigger}
          type='button'
          {...partAttrs('select', 'trigger')}
          aria-haspopup='dialog'
          aria-expanded={open}
          aria-labelledby={`${id}label ${id}text`}
          aria-describedby={fieldDescribedBy(ids, hint, error)}
          data-placeholder-shown={flag(!text)}
          disabled={disabled}
          onClick={() => setOpen(true)}>
          <span {...partAttrs('select', 'value-text')} id={`${id}text`}>
            {text || placeholder}
          </span>
          <span {...partAttrs('select', 'indicator')}>
            <Icon name='chevron-down' />
          </span>
        </button>
      </div>
      <FieldNote ids={ids} hint={hint} error={error} />
      {name === undefined && !required ? null : (
        <input
          {...partAttrs('select', 'stand-in')}
          name={name}
          value={value ?? ''}
          required={required}
          autoComplete='off'
          tabIndex={-1}
          aria-hidden='true'
          onChange={() => undefined}
          onFocus={() => trigger.current?.focus()}
        />
      )}
      <Modal
        title={label}
        open={open}
        onOpenChange={setOpen}
        sheet
        initialFocus={() => body.current?.querySelector('input') ?? null}>
        <div ref={body}>{children(() => setOpen(false))}</div>
      </Modal>
    </div>
  );
};
