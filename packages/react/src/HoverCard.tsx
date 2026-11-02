/**
 * @fileoverview HoverCard: a rich reference card on Zag's hover-card machine.
 * Cards nest (a card's content may hold more cards), load content on first
 * open, and pin open until unpinned.
 *
 * @module packages/react/src/HoverCard
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  floatingMachineProps,
  formatLabel,
  type Placement,
} from '@arkhe/core';
import * as hoverCard from '@zag-js/hover-card';
import { mergeProps, normalizeProps, useMachine } from '@zag-js/react';
import { useEffect, useId, useState, type JSX, type ReactNode } from 'react';
import { useArkhe } from './ArkheProvider.js';
import { useArkheEnvironment } from './ArkheEnvironment.js';
import { Button } from './Button.js';
import { Status } from './Status.js';
import { useContentLoader } from './useContentLoader.js';

/**
 * Props of HoverCard. Give `content`, or `load` with `loaded`.
 *
 * @interface HoverCardProps
 * @template T
 * @property {string} title - Card heading; also names the pin button.
 * @property {ReactNode} children - Trigger content; wrapped in a button.
 * @property {ReactNode} [content] - Card body.
 * @property {() => Promise<T>} [load] - Fetches the body on first open. A new function loads afresh; keep it stable.
 * @property {(value: T) => ReactNode} [loaded] - Renders what `load` returned.
 * @property {boolean} [pinnable] - Shows a pin button. Defaults to true.
 * @property {Placement} [placement] - Side. Defaults to `bottom-start`.
 * @property {number} [openDelay] - Milliseconds before opening. Defaults to 400.
 * @property {number} [closeDelay] - Milliseconds before closing. Defaults to 200.
 */
export interface HoverCardProps<T> {
  readonly title: string;
  readonly children: ReactNode;
  readonly content?: ReactNode;
  readonly load?: () => Promise<T>;
  readonly loaded?: (value: T) => ReactNode;
  readonly pinnable?: boolean;
  readonly placement?: Placement;
  readonly openDelay?: number;
  readonly closeDelay?: number;
}

/**
 * Renders a trigger that opens a reference card on hover or focus. The card
 * renders in place, so a nested card stays inside its parent's layer.
 * Unpinning hands the card back to hover: it stays open while the pointer
 * is over it.
 *
 * @component
 * @param {HoverCardProps<T>} props - Title, trigger, body, timing.
 * @returns {JSX.Element} Trigger and card.
 */
export const HoverCard = <T,>({
  title,
  children,
  content,
  load,
  loaded,
  pinnable = true,
  placement = 'bottom-start',
  openDelay = 400,
  closeDelay = 200,
}: HoverCardProps<T>): JSX.Element => {
  const { labels } = useArkhe();
  const env = useArkheEnvironment();
  const [pinned, setPinned] = useState(false);
  const [open, setOpen] = useState(false);
  const body = useContentLoader(load);
  const service = useMachine(hoverCard.machine, {
    ...floatingMachineProps({
      id: useId(),
      open,
      hold: pinned,
      placement,
      strategy: 'fixed',
      onOpenChange: setOpen,
      getRootNode: env.getRootNode,
    }),
    openDelay,
    closeDelay,
  });
  const api = hoverCard.connect(service, normalizeProps);
  const { state, load: start } = body;
  useEffect(() => {
    if (api.open) start();
  }, [api.open, start]);
  const togglePin = () => {
    if (pinned) setOpen(service.state.matches('open'));
    setPinned(!pinned);
  };
  return (
    <span className={ARKHE_CLASS} data-scope='hover-card' data-part='root'>
      <button type='button' {...api.getTriggerProps()}>
        {children}
      </button>
      <span {...mergeProps(api.getPositionerProps(), { hidden: !api.open })}>
        <span {...api.getContentProps()} data-pinned={pinned ? '' : undefined}>
          <span data-scope='hover-card' data-part='header'>
            <span data-scope='hover-card' data-part='title'>
              {title}
            </span>
            {pinnable ? (
              <Button
                variant='ghost'
                icon={pinned ? 'pin-off' : 'pin'}
                label={formatLabel(pinned ? labels.unpin : labels.pin, {
                  label: title,
                })}
                pressed={pinned}
                onClick={togglePin}
              />
            ) : null}
          </span>
          <span data-scope='hover-card' data-part='body'>
            {content}
            {state.status === 'loading' ? <Status kind='loading' /> : null}
            {state.status === 'error' ? <Status kind='error' /> : null}
            {state.status === 'ready' ? loaded?.(state.value) : null}
          </span>
        </span>
      </span>
    </span>
  );
};
