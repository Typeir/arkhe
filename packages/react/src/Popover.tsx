/**
 * @fileoverview Popover: a non-modal panel anchored to its trigger, on Zag's
 * popover machine. Portalled into the environment's container.
 *
 * @module packages/react/src/Popover
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import { ARKHE_CLASS, floatingMachineProps, type Placement } from '@arkhe/core';
import * as popover from '@zag-js/popover';
import { Portal, mergeProps, normalizeProps, useMachine } from '@zag-js/react';
import { useId, type JSX, type ReactNode } from 'react';
import { useArkhe } from './ArkheProvider';
import { useArkheEnvironment } from './ArkheEnvironment';
import { Icon } from './Icon';
import { usePortalContainer } from './usePortalContainer';

/**
 * Props of Popover.
 *
 * @interface PopoverProps
 * @property {string} trigger - Text of the open button.
 * @property {string} [title] - Heading; names the panel. Without it the trigger text does.
 * @property {boolean} [open] - Open state; makes the popover controlled.
 * @property {boolean} [defaultOpen] - First open state when uncontrolled.
 * @property {(open: boolean) => void} [onOpenChange] - Open-state callback.
 * @property {Placement} [placement] - Side. Defaults to `bottom-start`.
 * @property {ReactNode} [children] - Panel body.
 */
export interface PopoverProps {
  readonly trigger: string;
  readonly title?: string;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly placement?: Placement;
  readonly children?: ReactNode;
}

/**
 * Renders a button that toggles a panel. Escape and outside clicks close it;
 * focus returns to the button.
 *
 * @component
 * @param {PopoverProps} props - Trigger, title, open state, body.
 * @returns {JSX.Element} Trigger and portalled panel.
 */
export const Popover = ({
  trigger,
  title,
  open,
  defaultOpen,
  onOpenChange,
  placement = 'bottom-start',
  children,
}: PopoverProps): JSX.Element => {
  const { labels } = useArkhe();
  const env = useArkheEnvironment();
  const container = usePortalContainer();
  const service = useMachine(
    popover.machine,
    floatingMachineProps({
      id: useId(),
      open,
      defaultOpen,
      onOpenChange,
      placement,
      getRootNode: env.getRootNode,
    }),
  );
  const api = popover.connect(service, normalizeProps);
  return (
    <>
      <button
        {...mergeProps(api.getTriggerProps(), { className: ARKHE_CLASS })}>
        {trigger}
        <Icon name='chevron-down' />
      </button>
      <Portal container={container} getRootNode={env.getRootNode}>
        <div className={ARKHE_CLASS}>
          <div {...api.getPositionerProps()}>
            <div
              {...api.getContentProps()}
              aria-label={title === undefined ? trigger : undefined}>
              <div data-scope='popover' data-part='header'>
                {title === undefined ? null : (
                  <h2 {...api.getTitleProps()}>{title}</h2>
                )}
                <button
                  {...api.getCloseTriggerProps()}
                  aria-label={labels.close}>
                  <Icon name='x' />
                </button>
              </div>
              <div data-scope='popover' data-part='body'>
                {children}
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </>
  );
};
