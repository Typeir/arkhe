/**
 * @fileoverview Chip: a pointed tag with an optional icon and remove button.
 *
 * @module packages/react/src/Chip
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import { ARKHE_CLASS, formatLabel, partAttrs, removeChip } from '@arkhe/core';
import type { JSX } from 'react';
import { useArkhe } from './ArkheProvider.js';
import { Icon } from './Icon.js';

/**
 * Colour of a chip.
 *
 * @typedef {'neutral' | 'accent' | 'emphasis' | 'warning' | 'danger'} ChipTone
 */
export type ChipTone = 'neutral' | 'accent' | 'emphasis' | 'warning' | 'danger';

/**
 * Props of Chip.
 *
 * @interface ChipProps
 * @property {string} label - Text.
 * @property {ChipTone} [tone] - Colour. Defaults to `neutral`.
 * @property {string} [icon] - Lucide name of a leading icon.
 * @property {() => void} [onRemove] - Shows a remove button that calls this.
 */
export interface ChipProps {
  readonly label: string;
  readonly tone?: ChipTone;
  readonly icon?: string;
  readonly onRemove?: () => void;
}

/**
 * Renders a chip. The remove button's name comes from the `chipRemove` label;
 * when the host drops the chip, focus moves to the next chip's remove button.
 *
 * @component
 * @param {ChipProps} props - Component props.
 * @param {string} props.label - Text.
 * @param {ChipTone} [props.tone] - Colour.
 * @param {string} [props.icon] - Leading icon.
 * @param {() => void} [props.onRemove] - Remove handler.
 * @returns {JSX.Element} Chip.
 */
export const Chip = ({
  label,
  tone = 'neutral',
  icon,
  onRemove,
}: ChipProps): JSX.Element => {
  const { labels } = useArkhe();
  return (
    <span
      className={ARKHE_CLASS}
      {...partAttrs('chip', 'root')}
      data-tone={tone}>
      {icon ? <Icon name={icon} /> : null}
      <span {...partAttrs('chip', 'label')}>{label}</span>
      {onRemove ? (
        <button
          type='button'
          {...partAttrs('chip', 'remove')}
          aria-label={formatLabel(labels.chipRemove, { label })}
          onClick={(event) => removeChip(event.currentTarget, onRemove)}>
          <Icon name='x' />
        </button>
      ) : null}
    </span>
  );
};
