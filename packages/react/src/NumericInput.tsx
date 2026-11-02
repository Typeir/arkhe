/**
 * @fileoverview NumericInput: a number field with step buttons on Zag's
 * number-input machine. Outside it is a number or `null`.
 *
 * @module packages/react/src/NumericInput
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  REACT_EVENTS,
  guardInputProps,
  numericMachineProps,
  type NumericValue,
} from '@arkhe/core';
import * as numberInput from '@zag-js/number-input';
import { mergeProps, normalizeProps, useMachine } from '@zag-js/react';
import { useId, type JSX } from 'react';
import { useArkhe } from './ArkheProvider';
import { useArkheEnvironment } from './ArkheEnvironment';
import { Icon } from './Icon';
import { useNumericSync } from './useNumericSync';

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
}

/**
 * Renders a number field. A controlled value set while typing waits until
 * blur, so a parent that clamps cannot eat keystrokes.
 *
 * @component
 * @param {NumericInputProps} props - Label, value, bounds, callbacks.
 * @returns {JSX.Element} Number field.
 */
export const NumericInput = (props: NumericInputProps): JSX.Element => {
  const { label, value, onValueChange, onValueCommit, min, max } = props;
  const { labels } = useArkhe();
  const env = useArkheEnvironment();
  const { sync, track } = useNumericSync(value);
  const service = useMachine(numberInput.machine, {
    ...numericMachineProps({
      ...props,
      id: useId(),
      labels,
      getRootNode: env.getRootNode,
    }),
    onValueChange: (details) => sync.emit(details.valueAsNumber, onValueChange),
    onValueCommit: (details) =>
      sync.commit(details.valueAsNumber, onValueCommit, { min, max }),
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
        />
        <button {...api.getIncrementTriggerProps()}>
          <Icon name='plus' />
        </button>
      </div>
    </div>
  );
};
