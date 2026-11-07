/**
 * @fileoverview React side of the Tooltip and HoverCard parity scenes:
 * button, inline and card link triggers, and a hint closed after its first open.
 * Each must match its twin in `SvelteCases.svelte`.
 *
 * @module tests/parity/ReactHintCases
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { HoverCard, Tooltip } from '@arkhe/react';
import type { ReactNode } from 'react';

/**
 * Hint scenes by name.
 *
 * @constant HINT_SCENES
 * @type {Readonly<Record<string, () => ReactNode>>}
 */
export const HINT_SCENES: Readonly<Record<string, () => ReactNode>> = {
  tooltip: () => (
    <Tooltip content='Halves damage.' openDelay={0} closeDelay={0}>
      resistance
    </Tooltip>
  ),
  'tooltip-reopen': () => (
    <Tooltip content='Halves damage.' openDelay={0} closeDelay={0}>
      resistance
    </Tooltip>
  ),
  'tooltip-inline': () => (
    <>
      <Tooltip content='Outer' inline closeDelay={0}>
        outer{' '}
        <Tooltip content={<em>Inner</em>} inline closeDelay={0}>
          inner
        </Tooltip>
      </Tooltip>
      <p>elsewhere</p>
    </>
  ),
  'hover-card-link': () => (
    <HoverCard
      title='Charge'
      href='#charge'
      openDelay={0}
      closeDelay={0}
      content='Spend to act twice.'>
      charge
    </HoverCard>
  ),
  'hover-card': () => (
    <HoverCard title='Charge' openDelay={0} content='Spend to act twice.'>
      charge
    </HoverCard>
  ),
};
