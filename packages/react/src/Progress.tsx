/**
 * @fileoverview Progress: a native progress element on a rail with threshold
 * markers, hatched in the error colour past its maximum, and indeterminate
 * without a value. The value text shown above it is for sight only; the
 * element itself carries it.
 *
 * @module packages/react/src/Progress
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  flag,
  partAttrs,
  progressState,
  progressValueText,
} from '@arkhe/core';
import type { CSSProperties, JSX } from 'react';
import { useArkhe } from './ArkheProvider.js';

/**
 * Props of Progress.
 *
 * @interface ProgressProps
 * @property {number} [value] - Current amount; may exceed `max`. None while the amount is unknown.
 * @property {number} max - Amount that fills the rail.
 * @property {string} label - Accessible name.
 * @property {readonly number[]} [markers] - Thresholds, in the value's units; repeats are dropped.
 * @property {boolean} [showValue] - Prints the value text above the rail.
 */
export interface ProgressProps {
  readonly value?: number;
  readonly max: number;
  readonly label: string;
  readonly markers?: readonly number[];
  readonly showValue?: boolean;
}

/**
 * Renders a progress bar. Past `max` it reads as full, marks `data-over`, and
 * its value text says by how much.
 *
 * @component
 * @param {ProgressProps} props - Component props.
 * @param {number} [props.value] - Current amount.
 * @param {number} props.max - Amount that fills the rail.
 * @param {string} props.label - Accessible name.
 * @param {readonly number[]} [props.markers] - Thresholds.
 * @param {boolean} [props.showValue] - Prints the value text.
 * @returns {JSX.Element} Progress bar.
 * @throws {RangeError} When `max` is not a positive number.
 */
export const Progress = ({
  value,
  max,
  label,
  markers,
  showValue,
}: ProgressProps): JSX.Element => {
  const { labels, locale } = useArkhe();
  const state = progressState(value, max, markers);
  const text = state.indeterminate
    ? undefined
    : progressValueText(state, max, labels, locale);
  return (
    <div
      className={ARKHE_CLASS}
      {...partAttrs('progress', 'root')}
      data-over={flag(state.over)}>
      {showValue && text !== undefined ? (
        <span {...partAttrs('progress', 'value')} aria-hidden='true'>
          {text}
        </span>
      ) : null}
      <span {...partAttrs('progress', 'track')}>
        <progress
          {...partAttrs('progress', 'fill')}
          max={max}
          value={state.indeterminate ? undefined : Math.min(state.value, max)}
          aria-label={label}
          aria-valuetext={text}
        />
        {state.markers.map((marker) => (
          <span
            key={marker.at}
            {...partAttrs('progress', 'marker')}
            data-reached={flag(marker.reached)}
            style={{ '--at': marker.at } as CSSProperties}
          />
        ))}
      </span>
    </div>
  );
};
