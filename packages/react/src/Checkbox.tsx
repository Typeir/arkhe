/**
 * @fileoverview Checkbox on a native input: a rhombus pip or a square box,
 * a label beside it, then a hint or an error.
 *
 * @module packages/react/src/Checkbox
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

'use client';

import {
  ARKHE_CLASS,
  checkboxRootAttrs,
  fieldDescribedBy,
  fieldIds,
  markIndeterminate,
  partAttrs,
  type CheckboxLook,
  type CheckboxSize,
} from '@arkhe/core';
import { useEffect, useId, useRef, type JSX } from 'react';
import { FieldNote } from './FieldNote.js';
import { Icon } from './Icon.js';

/**
 * Props of Checkbox.
 *
 * @interface CheckboxProps
 * @property {string} label - Visible label; names the box.
 * @property {boolean} [checked] - Checked state; makes the box controlled.
 * @property {boolean} [defaultChecked] - First state when uncontrolled.
 * @property {(checked: boolean) => void} [onCheckedChange] - Reports changes.
 * @property {boolean} [indeterminate] - Mixed state.
 * @property {CheckboxLook} [look] - Pip or box; pip by default.
 * @property {CheckboxSize} [size] - s, m or l; m by default.
 * @property {boolean} [labelHidden] - Hides the label visually.
 * @property {string} [name] - Form field name.
 * @property {string} [value] - Value submitted while checked.
 * @property {boolean} [required] - Must be checked to submit.
 * @property {boolean} [disabled] - Blocks changes.
 * @property {string} [hint] - Help text.
 * @property {string} [error] - Error text; replaces the hint.
 */
export interface CheckboxProps {
  readonly label: string;
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly indeterminate?: boolean;
  readonly look?: CheckboxLook;
  readonly size?: CheckboxSize;
  readonly labelHidden?: boolean;
  readonly name?: string;
  readonly value?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly hint?: string;
  readonly error?: string;
}

/**
 * Renders a checkbox. Space toggles it; a `<fieldset disabled>` around it
 * disables it; a new error is announced politely.
 *
 * @component
 * @param {CheckboxProps} props - Component props.
 * @returns {JSX.Element} Checkbox.
 */
export const Checkbox = ({
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  indeterminate,
  look,
  size,
  labelHidden,
  name,
  value,
  required,
  disabled,
  hint,
  error,
}: CheckboxProps): JSX.Element => {
  const ids = fieldIds(useId());
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    markIndeterminate(input.current, indeterminate);
  }, [indeterminate]);
  return (
    <div
      className={ARKHE_CLASS}
      {...partAttrs('checkbox', 'root')}
      {...checkboxRootAttrs({
        look,
        size,
        invalid: Boolean(error),
        labelHidden,
      })}>
      <label {...partAttrs('checkbox', 'control')}>
        <span {...partAttrs('checkbox', 'box')}>
          <input
            ref={input}
            {...partAttrs('checkbox', 'input')}
            type='checkbox'
            id={ids.control}
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
            name={name}
            value={value}
            required={required}
            disabled={disabled}
            aria-describedby={fieldDescribedBy(ids, hint, error)}
            aria-invalid={error ? true : undefined}
          />
          {look === 'box' ? (
            <span {...partAttrs('checkbox', 'mark')} aria-hidden>
              <Icon name='check' />
              <Icon name='minus' />
            </span>
          ) : null}
        </span>
        <span {...partAttrs('checkbox', 'label')}>{label}</span>
      </label>
      <FieldNote ids={ids} hint={hint} error={error} />
    </div>
  );
};
