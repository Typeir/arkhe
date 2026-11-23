/**
 * @fileoverview NumericInput: a number field with step buttons on Zag's
 * number-input machine. Outside it is a number or `null`.
 *
 * @module packages/react/src/field/NumericInput
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  fieldDescribedBy,
  fieldIds,
  guardInputProps,
  numericMachineProps,
  type NumericValue,
  REACT_EVENTS,
} from '@arkhe/core';
import * as numberInput from '@zag-js/number-input';
import { mergeProps, normalizeProps, useMachine } from '@zag-js/react';
import { type JSX, useId } from 'react';
import { useArkheEnvironment } from '../base/ArkheEnvironment.js';
import { useArkhe } from '../base/ArkheProvider.js';
import { Icon } from '../base/Icon.js';
import { FieldNote } from './FieldNote.js';
import { useNumericSync } from './useNumericSync.js';

/**
 * Props of NumericInput.
 *
 * @interface NumericInputProps
 * @property {string} label - Visible label; also names the step buttons.
 * @property {NumericValue} [value] - Controlled value.
 * @property {NumericValue} [defaultValue] - First value when uncontrolled.
 * @property {(value: NumericValue) => void} [onValueChange] - Every draft change.
 * @property {(value: NumericValue) => void} [onValueCommit] - Blur or Enter, clamped.
 * @property {number} [min] - Lowest value.
 * @property {number} [max] - Highest value.
 * @property {number} [step] - Step size. Defaults to 1.
 * @property {string} [name] - Form field name.
 * @property {boolean} [required] - A value must be given.
 * @property {boolean} [disabled] - Blocks input.
 * @property {boolean} [readOnly] - Shows the value without taking edits.
 * @property {string} [hint] - Help text under the control.
 * @property {string} [error] - Error text; replaces the hint and marks the control invalid.
 */
export interface NumericInputProps {
  readonly label: string;
  readonly value?: NumericValue;
  readonly defaultValue?: NumericValue;
  readonly onValueChange?: (value: NumericValue) => void;
  readonly onValueCommit?: (value: NumericValue) => void;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly name?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly hint?: string;
  readonly error?: string;
}

/**
 * Renders a number field. A controlled value set while typing waits until
 * blur, so a parent that clamps cannot eat keystrokes.
 *
 * @component
 * @param {NumericInputProps} props - Label, value, bounds, callbacks.
 * @returns {JSX.Element} Number field.
 */
export const NumericInput = ({
  label,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min,
  max,
  step,
  name,
  required,
  disabled,
  readOnly,
  hint,
  error,
}: NumericInputProps): JSX.Element => {
  const { labels, locale } = useArkhe();
  const env = useArkheEnvironment();
  const { sync, track } = useNumericSync(value);
  const id = useId();
  const ids = fieldIds(id);
  const service = useMachine(numberInput.machine, {
    ...numericMachineProps({
      id,
      label,
      labels,
      locale,
      value,
      defaultValue,
      min,
      max,
      step,
      name,
      required,
      invalid: Boolean(error),
      disabled,
      readOnly,
      getRootNode: env.getRootNode,
    }),
    onValueChange: (details) => {
      sync.emit(details.valueAsNumber, onValueChange);
    },
    onValueCommit: (details) => {
      sync.commit(details.valueAsNumber, onValueCommit, { min, max });
    },
  });
  const api = track(numberInput.connect(service, normalizeProps));
  return (
    <div {...mergeProps(api.getRootProps(), { className: ARKHE_CLASS })}>
      <label {...api.getLabelProps()}>{label}</label>
      <div {...api.getControlProps()}>
        <button {...api.getDecrementTriggerProps()}>
          <Icon name='minus' />
        </button>
        <input
          {...guardInputProps(
            api.getInputProps(),
            { min, max },
            sync,
            REACT_EVENTS,
          )}
          aria-describedby={fieldDescribedBy(ids, hint, error)}
        />
        <button {...api.getIncrementTriggerProps()}>
          <Icon name='plus' />
        </button>
      </div>
      <FieldNote ids={ids} hint={hint} error={error} />
    </div>
  );
};
