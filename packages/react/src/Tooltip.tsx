/**
 * @fileoverview Tooltip: a short text hint on Zag's tooltip machine. One is
 * open at a time and it holds no controls; rich or nested content belongs in
 * a HoverCard.
 *
 * @module packages/react/src/Tooltip
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import { ARKHE_CLASS, floatingMachineProps, type Placement } from '@arkhe/core';
import { mergeProps, normalizeProps, useMachine } from '@zag-js/react';
import * as tooltip from '@zag-js/tooltip';
import { useId, type JSX, type ReactNode } from 'react';
import { useArkheEnvironment } from './ArkheEnvironment.js';

/**
 * Props of Tooltip.
 *
 * @interface TooltipProps
 * @property {string} content - Hint text.
 * @property {ReactNode} children - Trigger content; wrapped in a button.
 * @property {Placement} [placement] - Side. Defaults to `top`.
 * @property {number} [openDelay] - Milliseconds before opening. Defaults to 400.
 * @property {number} [closeDelay] - Milliseconds before closing. Defaults to 150.
 */
export interface TooltipProps {
  readonly content: string;
  readonly children: ReactNode;
  readonly placement?: Placement;
  readonly openDelay?: number;
  readonly closeDelay?: number;
}

/**
 * Renders a trigger that shows `content` on hover and keyboard focus.
 *
 * @component
 * @param {TooltipProps} props - Hint, trigger, timing.
 * @returns {JSX.Element} Trigger and hint.
 */
export const Tooltip = ({
  content,
  children,
  placement = 'top',
  openDelay = 400,
  closeDelay = 150,
}: TooltipProps): JSX.Element => {
  const env = useArkheEnvironment();
  const service = useMachine(tooltip.machine, {
    ...floatingMachineProps({
      id: useId(),
      placement,
      strategy: 'fixed',
      getRootNode: env.getRootNode,
    }),
    openDelay,
    closeDelay,
  });
  const api = tooltip.connect(service, normalizeProps);
  return (
    <span className={ARKHE_CLASS} data-scope='tooltip' data-part='root'>
      <button type='button' {...api.getTriggerProps()}>
        {children}
      </button>
      <span {...mergeProps(api.getPositionerProps(), { hidden: !api.open })}>
        <span {...api.getContentProps()}>{content}</span>
      </span>
    </span>
  );
};
