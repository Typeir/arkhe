/**
 * @fileoverview HoverCard: a rich reference card on Zag's hover-card machine.
 * Cards nest (a card's content may hold more cards), load content on first
 * open, and pin open until unpinned. The card mounts on first open,
 * portalled into the environment's container, so server markup holds the
 * trigger alone and the body may hold any content.
 *
 * @module packages/react/src/hint/HoverCard
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  CardAccess,
  cardTriggerAria,
  elementById,
  floatingMachineProps,
  formatLabel,
  type Placement,
} from '@arkhe/core';
import * as hoverCard from '@zag-js/hover-card';
import { Portal, mergeProps, normalizeProps, useMachine } from '@zag-js/react';
import {
  useEffect,
  useEffectEvent,
  useId,
  useState,
  type JSX,
  type ReactNode,
} from 'react';
import { useArkhe } from '../base/ArkheProvider.js';
import { useArkheEnvironment } from '../base/ArkheEnvironment.js';
import { Button } from '../action/Button.js';
import {
  HintContext,
  HintTrigger,
  useHint,
  useHintNode,
  useOpenState,
} from './HintTrigger.js';
import { Status } from '../feedback/Status.js';
import { useContentLoader } from '../feedback/useContentLoader.js';
import { usePortalContainer } from '../base/usePortalContainer.js';

/**
 * Props of HoverCard. Give `content`, or `load` with `loaded`.
 *
 * @interface HoverCardProps
 * @template T
 * @property {string} title - Card heading; also names the pin button.
 * @property {ReactNode} children - Trigger content.
 * @property {string} [href] - Makes the trigger the provider's link to this address, and adds the link to the card's header.
 * @property {boolean} [inline] - Makes the trigger inline text with a tab stop; it may hold other triggers.
 * @property {ReactNode} [content] - Card body.
 * @property {() => Promise<T>} [load] - Fetches the body on first open. A new function loads afresh; keep it stable.
 * @property {(value: T) => ReactNode} [loaded] - Renders what `load` returned.
 * @property {boolean} [pinnable] - Shows a pin button. Defaults to true.
 * @property {boolean} [open] - Open state; makes the card controlled.
 * @property {boolean} [defaultOpen] - First open state when uncontrolled.
 * @property {(open: boolean) => void} [onOpenChange] - Open-state callback.
 * @property {Placement} [placement] - Side. Defaults to `bottom-start`.
 * @property {number} [openDelay] - Milliseconds before opening. Defaults to 400.
 * @property {number} [closeDelay] - Milliseconds before closing. Defaults to 200.
 * @property {'narrow' | 'wide'} [width] - Card width; between the two by default.
 * @property {boolean} [card] - `false` opens this card on click only; overrides the provider's `hoverCards`.
 */
export interface HoverCardProps<T> {
  readonly title: string;
  readonly children: ReactNode;
  readonly href?: string;
  readonly inline?: boolean;
  readonly content?: ReactNode;
  readonly load?: () => Promise<T>;
  readonly loaded?: (value: T) => ReactNode;
  readonly pinnable?: boolean;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly placement?: Placement;
  readonly openDelay?: number;
  readonly closeDelay?: number;
  readonly width?: 'narrow' | 'wide';
  readonly card?: boolean;
}

/**
 * Renders a trigger that opens a reference card on hover, focus or tap. A
 * click or Enter on a button or inline trigger pins it; a link trigger
 * follows its link, and a tap on it opens the card. Tab reaches into the
 * open card and out past the trigger; focus leaving an unpinned card closes
 * it. Escape closes the innermost card, pinned or not, and focus inside it
 * returns to the trigger. A tap outside closes an unpinned card. A card
 * stays open while a card nested in it is open. Unpinning hands the card
 * back to hover: it stays open while the pointer is over it.
 *
 * @component
 * @param {HoverCardProps<T>} props - Title, trigger, body, open state, timing.
 * @returns {JSX.Element} Trigger, and the card once opened.
 */
export const HoverCard = <T,>({
  title,
  children,
  href,
  inline,
  content,
  load,
  loaded,
  pinnable = true,
  open,
  defaultOpen,
  onOpenChange,
  placement = 'bottom-start',
  openDelay = 400,
  closeDelay = 200,
  width,
  card,
}: HoverCardProps<T>): JSX.Element => {
  const { labels, hoverCards } = useArkhe();
  const id = useId();
  const env = useArkheEnvironment();
  const container = usePortalContainer();
  const node = useHintNode();
  const [pinned, setPinned] = useState(false);
  const { shown, change } = useOpenState(open, defaultOpen, onOpenChange);
  const body = useContentLoader(load);
  const service = useMachine(hoverCard.machine, {
    ...floatingMachineProps({
      id,
      open: shown,
      hold: pinned,
      placement,
      onOpenChange: (next: boolean) => {
        if (node.request(next)) change(next);
      },
      getRootNode: env.getRootNode,
    }),
    openDelay,
    closeDelay,
    disabled: !(card ?? hoverCards),
  });
  const api = hoverCard.connect(service, normalizeProps);
  const positioner = api.getPositionerProps();
  const contentProps = api.getContentProps();
  const triggerProps = api.getTriggerProps();
  const [triggerId, contentId] = [triggerProps.id ?? '', contentProps.id ?? ''];
  const togglePin = () => {
    if (pinned) change(service.state.matches('open'));
    setPinned(!pinned);
  };
  const unpinAndClose = () => {
    setPinned(false);
    change(false);
  };
  const release = useEffectEvent(unpinAndClose);
  const shut = useEffectEvent(() => change(false));
  const hint = useHint({
    open: api.open,
    setOpen: (next: boolean) => {
      if (next || !pinned) change(next);
    },
    trigger: triggerProps,
    positionerId: positioner.id ?? '',
    node,
    leaving: () => service.state.matches('closing'),
    activate: href === undefined ? togglePin : undefined,
    keys: href === undefined && inline,
  });
  const { state, load: start } = body;
  useEffect(() => {
    if (api.open) start();
  }, [api.open, start]);
  useEffect(() => {
    if (!api.open) return undefined;
    const byId = (key: string) => elementById(env.getRootNode(), key);
    const access = new CardAccess({
      getRootNode: env.getRootNode,
      trigger: () => byId(triggerId),
      content: () => byId(contentId),
      node,
      close: () => shut(),
      release: () => release(),
    });
    access.pin(pinned);
    return access.attach();
  }, [api.open, pinned, env, node, triggerId, contentId]);
  return (
    <span className={ARKHE_CLASS} data-scope='hover-card' data-part='root'>
      <HintTrigger
        attrs={{
          ...hint.trigger,
          ...cardTriggerAria({
            link: href !== undefined,
            inline: Boolean(inline),
            open: api.open,
            contentId,
            bodyId: `${id}body`,
          }),
        }}
        href={href}
        inline={inline}>
        {children}
      </HintTrigger>
      {hint.mounted ? (
        <Portal container={container} getRootNode={env.getRootNode}>
          <div className={ARKHE_CLASS}>
            <div {...mergeProps(positioner, { hidden: !api.open })}>
              <div
                {...mergeProps(contentProps, {
                  role: 'dialog',
                  'aria-labelledby': `${id}title`,
                })}
                data-pinned={pinned ? '' : undefined}
                data-width={width}>
                <div data-scope='hover-card' data-part='header'>
                  <span
                    data-scope='hover-card'
                    data-part='title'
                    id={`${id}title`}>
                    {title}
                  </span>
                  {href !== undefined ? (
                    <Button
                      variant='ghost'
                      icon='external-link'
                      label={formatLabel(labels.openLink, { label: title })}
                      href={href}
                    />
                  ) : null}
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
                  {pinned ? (
                    <Button
                      variant='ghost'
                      icon='x'
                      label={labels.close}
                      onClick={() => {
                        elementById(env.getRootNode(), triggerId)?.focus();
                        unpinAndClose();
                      }}
                    />
                  ) : null}
                </div>
                <div data-scope='hover-card' data-part='body' id={`${id}body`}>
                  <HintContext value={node}>
                    {content}
                    {state.status === 'loading' ? (
                      <Status kind='loading' />
                    ) : null}
                    {state.status === 'error' ? <Status kind='error' /> : null}
                    {state.status === 'ready' ? loaded?.(state.value) : null}
                  </HintContext>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      ) : null}
    </span>
  );
};
