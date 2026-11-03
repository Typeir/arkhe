/**
 * @fileoverview Tooltip: a short description on Zag's tooltip machine. One
 * is open at a time. Its content is phrasing only, never links or controls
 * (an ARIA tooltip); anything interactive belongs in a HoverCard. The body
 * mounts on first open, so server markup holds the trigger alone.
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
import { HintTrigger, useHint, useOpenState } from './HintTrigger.js';

/**
 * Props of Tooltip.
 *
 * @interface TooltipProps
 * @property {ReactNode} content - Description; non-interactive phrasing content.
 * @property {ReactNode} children - Trigger content.
 * @property {string} [href] - Makes the trigger the provider's link to this address.
 * @property {boolean} [inline] - Makes the trigger inline text with a tab stop; it may hold other triggers.
 * @property {boolean} [open] - Open state; makes the tooltip controlled.
 * @property {boolean} [defaultOpen] - First open state when uncontrolled.
 * @property {(open: boolean) => void} [onOpenChange] - Open-state callback.
 * @property {Placement} [placement] - Side. Defaults to `top`.
 * @property {number} [openDelay] - Milliseconds before opening. Defaults to 400.
 * @property {number} [closeDelay] - Milliseconds before closing. Defaults to 150.
 */
export interface TooltipProps {
  readonly content: ReactNode;
  readonly children: ReactNode;
  readonly href?: string;
  readonly inline?: boolean;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly placement?: Placement;
  readonly openDelay?: number;
  readonly closeDelay?: number;
}

/**
 * Renders a trigger that shows `content` on hover, keyboard focus and tap.
 * A tap outside or Escape closes it.
 *
 * @component
 * @param {TooltipProps} props - Description, trigger, open state, timing.
 * @returns {JSX.Element} Trigger, and the description once opened.
 */
export const Tooltip = ({
  content,
  children,
  href,
  inline,
  open,
  defaultOpen,
  onOpenChange,
  placement = 'top',
  openDelay = 400,
  closeDelay = 150,
}: TooltipProps): JSX.Element => {
  const env = useArkheEnvironment();
  const { shown, change } = useOpenState(open, defaultOpen, onOpenChange);
  const service = useMachine(tooltip.machine, {
    ...floatingMachineProps({
      id: useId(),
      open: shown,
      onOpenChange: change,
      placement,
      strategy: 'fixed',
      getRootNode: env.getRootNode,
    }),
    openDelay,
    closeDelay,
  });
  const api = tooltip.connect(service, normalizeProps);
  const positioner = api.getPositionerProps();
  const hint = useHint({
    open: api.open,
    setOpen: change,
    trigger: api.getTriggerProps(),
    positionerId: positioner.id ?? '',
  });
  return (
    <span className={ARKHE_CLASS} data-scope='tooltip' data-part='root'>
      <HintTrigger attrs={hint.trigger} href={href} inline={inline}>
        {children}
      </HintTrigger>
      {hint.mounted ? (
        <span {...mergeProps(positioner, { hidden: !api.open })}>
          <span {...api.getContentProps()}>{content}</span>
        </span>
      ) : null}
    </span>
  );
};
