/**
 * @fileoverview Radio group on native radios in a fieldset: rhombus pips or
 * joined segments, the legend naming the group, then a hint or an error.
 *
 * @module packages/react/src/RadioGroup
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

'use client';

import {
  ARKHE_CLASS,
  fieldDescribedBy,
  fieldIds,
  partAttrs,
  radioChecked,
  radioRootAttrs,
  uniqueByValue,
  type CheckboxSize,
  type RadioItem,
  type RadioLook,
  type RadioOrientation,
} from '@arkhe/core';
import { useId, type JSX } from 'react';
import { FieldNote } from './FieldNote.js';

/**
 * Props of RadioGroup.
 *
 * @interface RadioGroupProps
 * @property {string} label - Legend; names the group.
 * @property {readonly RadioItem[]} items - Choices, in order; a repeated value is dropped.
 * @property {string | null} [value] - Chosen value; makes the group controlled, null chooses none.
 * @property {string} [defaultValue] - First choice when uncontrolled.
 * @property {(value: string) => void} [onValueChange] - Reports a new choice.
 * @property {RadioLook} [look] - Pips or segments; pips by default.
 * @property {CheckboxSize} [size] - Pip size; m by default.
 * @property {RadioOrientation} [orientation] - Direction; horizontal by default.
 * @property {boolean} [labelHidden] - Hides the legend visually.
 * @property {string} [name] - Form field name; generated when absent.
 * @property {boolean} [required] - A choice is needed to submit.
 * @property {boolean} [disabled] - Blocks every choice.
 * @property {string} [hint] - Help text.
 * @property {string} [error] - Error text; replaces the hint.
 */
export interface RadioGroupProps {
  readonly label: string;
  readonly items: readonly RadioItem[];
  readonly value?: string | null;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly look?: RadioLook;
  readonly size?: CheckboxSize;
  readonly orientation?: RadioOrientation;
  readonly labelHidden?: boolean;
  readonly name?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly hint?: string;
  readonly error?: string;
}

/**
 * Renders a radio group. Tab reaches the chosen radio, arrows move the
 * choice, all natively; a new error is announced politely.
 *
 * @component
 * @param {RadioGroupProps} props - Component props.
 * @returns {JSX.Element} Radio group.
 */
export const RadioGroup = ({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  look,
  size,
  orientation,
  labelHidden,
  name,
  required,
  disabled,
  hint,
  error,
}: RadioGroupProps): JSX.Element => {
  const ids = fieldIds(useId());
  return (
    <fieldset
      className={ARKHE_CLASS}
      {...partAttrs('radio-group', 'root')}
      {...radioRootAttrs({
        look,
        size,
        orientation,
        invalid: Boolean(error),
        labelHidden,
      })}
      id={ids.control}
      role='radiogroup'
      disabled={disabled}
      aria-describedby={fieldDescribedBy(ids, hint, error)}
      aria-invalid={error ? true : undefined}
      aria-required={required}>
      <legend {...partAttrs('radio-group', 'legend')} id={ids.label}>
        {label}
      </legend>
      <div {...partAttrs('radio-group', 'items')}>
        {uniqueByValue(items).map((item) => (
          <label
            key={item.value}
            {...partAttrs('radio-group', 'item')}
            data-value={item.value}>
            <input
              {...partAttrs('radio-group', 'input')}
              type='radio'
              name={name ?? ids.control}
              value={item.value}
              checked={radioChecked(value, item)}
              defaultChecked={
                value === undefined ? defaultValue === item.value : undefined
              }
              onChange={() => onValueChange?.(item.value)}
              required={required}
              disabled={item.disabled}
            />
            <span {...partAttrs('radio-group', 'label')}>{item.label}</span>
          </label>
        ))}
      </div>
      <FieldNote ids={ids} hint={hint} error={error} />
    </fieldset>
  );
};
