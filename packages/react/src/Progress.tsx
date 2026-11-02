/**
 * @fileoverview Progress: a rail with threshold markers that turns to the
 * error colour past its maximum.
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
import { useArkhe } from './ArkheProvider';

/**
 * Props of Progress.
 *
 * @interface ProgressProps
 * @property {number} value - Current amount; may exceed `max`.
 * @property {number} max - Amount that fills the rail.
 * @property {string} label - Accessible name.
 * @property {readonly number[]} [markers] - Thresholds, in the value's units; repeats are dropped.
 * @property {boolean} [showValue] - Prints the value text above the rail.
 */
export interface ProgressProps {
  readonly value: number;
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
 * @param {number} props.value - Current amount.
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
  const { labels } = useArkhe();
  const state = progressState(value, max, markers);
  const text = progressValueText(value, max, labels);
  return (
    <div
      className={ARKHE_CLASS}
      {...partAttrs('progress', 'root')}
      data-over={flag(state.over)}
      role='progressbar'
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      aria-valuetext={text}>
      {showValue ? (
        <span {...partAttrs('progress', 'value')}>{text}</span>
      ) : null}
      <span {...partAttrs('progress', 'track')}>
        <span
          {...partAttrs('progress', 'fill')}
          style={{ '--progress': state.ratio } as CSSProperties}
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
