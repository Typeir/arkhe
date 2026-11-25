/**
 * @fileoverview Tooltip: a short description on Zag's tooltip machine. One
 * is open at a time. Its content is phrasing only, never links or controls
 * (an ARIA tooltip); anything interactive, a link trigger included, belongs
 * in a HoverCard. The body
 * mounts on first open, portalled into the environment's container, so
 * server markup holds the trigger alone.
 *
 * @module packages/react/src/hint/Tooltip
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  floatingMachineProps,
  partAttrs,
  type Placement,
  TOOLTIP_GUTTER,
} from '@arkhe/core';
import { mergeProps, normalizeProps, Portal, useMachine } from '@zag-js/react';
import * as tooltip from '@zag-js/tooltip';
import {
  type JSX,
  type ReactNode,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
} from 'react';
import { useArkheEnvironment } from '../base/ArkheEnvironment.js';
import { useControllable } from '../base/useControllable.js';
import { usePortalContainer } from '../base/usePortalContainer.js';
import { HintTrigger, useHint, useHintNode } from './HintTrigger.js';
import { useSleep, type Waking } from './useSleep.js';

/**
 * Props of Tooltip.
 *
 * @interface TooltipProps
 * @property {ReactNode} content - Description; non-interactive phrasing content.
 * @property {ReactNode} children - Trigger content.
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
 * A tap outside or Escape closes it. The machine sleeps until the first
 * hover, focus or tap.
 *
 * @component
 * @param {TooltipProps} props - Description, trigger, open state, timing.
 * @returns {JSX.Element} Trigger, and the description once opened.
 */
export const Tooltip = (props: TooltipProps): JSX.Element => {
  const { children, inline, open, defaultOpen } = props;
  const id = useId();
  const sleep = useSleep('tooltip', id, open === true || defaultOpen === true);
  return (
    <span className={ARKHE_CLASS} {...partAttrs('tooltip', 'root')}>
      <HintTrigger attrs={sleep.attrs} inline={inline}>
        {children}
      </HintTrigger>
      {sleep.waking === null ? null : (
        <LiveTooltip
          {...props}
          id={id}
          waking={sleep.waking}
          report={sleep.report}
        />
      )}
    </span>
  );
};

/**
 * Props of LiveTooltip.
 *
 * @interface LiveTooltipProps
 * @property {string} id - Machine id.
 * @property {Waking} waking - What woke the machine; replayed once.
 * @property {(props: object) => void} report - Takes the trigger props.
 */
interface LiveTooltipProps extends TooltipProps {
  readonly id: string;
  readonly waking: Waking;
  readonly report: (props: object) => void;
}

/**
 * Runs the tooltip machine, hands its trigger props to the sleeping
 * trigger, replays the waking event, and renders the body once opened.
 *
 * @component
 * @param {LiveTooltipProps} props - Tooltip props, id, wake, report.
 * @returns {JSX.Element | null} Body, once opened.
 */
const LiveTooltip = ({
  content,
  open,
  defaultOpen,
  onOpenChange,
  placement = 'top',
  openDelay = 400,
  closeDelay = 150,
  id,
  waking,
  report,
}: LiveTooltipProps): JSX.Element | null => {
  const env = useArkheEnvironment();
  const container = usePortalContainer();
  const node = useHintNode();
  const { current: shown, commit } = useControllable({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const service = useMachine(tooltip.machine, {
    ...floatingMachineProps({
      id,
      open: shown,
      onOpenChange: (next: boolean) => {
        if (node.request(next)) commit(next);
      },
      placement,
      gutter: TOOLTIP_GUTTER,
      getRootNode: env.getRootNode,
    }),
    openDelay,
    closeDelay,
    interactive: true,
  });
  const api = tooltip.connect(service, normalizeProps);
  const positioner = api.getPositionerProps();
  const triggerProps = api.getTriggerProps();
  const hint = useHint({
    open: api.open,
    setOpen: commit,
    trigger: triggerProps,
    positionerId: positioner.id ?? '',
    node,
    leaving: () => service.state.matches('closing'),
    pressed: waking === 'touch' ? 'touch' : null,
  });
  useLayoutEffect(() => {
    report(hint.trigger);
  });
  const replay = useEffectEvent(() => {
    const el = env.getRootNode().getElementById(triggerProps.id ?? '');
    if (waking === 'focus' && el?.matches(':focus-visible') === true) {
      service.send({ type: 'open', src: 'trigger.focus' });
    }
    if (waking === 'hover' && el?.matches(':hover') === true) {
      service.send({ type: 'pointer.move' });
    }
  });
  useEffect(() => {
    replay();
  }, []);
  if (!hint.mounted) return null;
  return (
    <Portal container={container} getRootNode={env.getRootNode}>
      <div className={ARKHE_CLASS}>
        <div {...mergeProps(positioner, { hidden: !api.open })}>
          <div {...api.getContentProps()}>
            <div {...api.getArrowProps()}>
              <div {...api.getArrowTipProps()} />
            </div>
            {content}
          </div>
        </div>
      </div>
    </Portal>
  );
};
