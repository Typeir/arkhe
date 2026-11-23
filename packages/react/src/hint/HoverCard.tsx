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
  cardContentProps,
  cardTriggerAria,
  elementById,
  flag,
  floatingMachineProps,
  HINT_GUTTER,
  partAttrs,
  type Placement,
  REACT_EVENTS,
} from '@arkhe/core';
import * as hoverCard from '@zag-js/hover-card';
import { mergeProps, normalizeProps, Portal, useMachine } from '@zag-js/react';
import {
  type JSX,
  type ReactNode,
  useEffect,
  useEffectEvent,
  useId,
  useState,
} from 'react';
import { useArkheEnvironment } from '../base/ArkheEnvironment.js';
import { useArkhe } from '../base/ArkheProvider.js';
import { useControllable } from '../base/useControllable.js';
import { usePortalContainer } from '../base/usePortalContainer.js';
import { Status } from '../feedback/Status.js';
import { useContentLoader } from '../feedback/useContentLoader.js';
import { CardHeader } from './CardHeader.js';
import {
  HintContext,
  HintTrigger,
  useHint,
  useHintNode,
} from './HintTrigger.js';
import { useCardDrag } from './useCardDrag.js';

/**
 * Props of HoverCard. Give `content`, or `load` with `loaded`.
 *
 * @interface HoverCardProps
 * @template T
 * @property {string} title - Card heading; also names the pin button.
 * @property {ReactNode} children - Trigger content.
 * @property {string} [href] - Makes the trigger the provider's link to this address, and adds the link to the card's header.
 * @property {boolean} [headerLink] - `false` leaves the link out of the header; the trigger stays a link. Defaults to true.
 * @property {ReactNode} [actions] - Host controls in the header, before the built-in buttons.
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
 * @property {'narrow' | 'wide'} [width] - Card width. Defaults to between the two.
 * @property {boolean} [card] - `false` opens this card on click only; overrides the provider's `hoverCards`.
 */
export interface HoverCardProps<T> {
  readonly title: string;
  readonly children: ReactNode;
  readonly href?: string;
  readonly headerLink?: boolean;
  readonly actions?: ReactNode;
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
  headerLink = true,
  actions,
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
  const { hoverCards, labels, announcer } = useArkhe();
  const id = useId();
  const env = useArkheEnvironment();
  const container = usePortalContainer();
  const node = useHintNode();
  const [pinned, setPinned] = useState(false);
  const [detached, setDetached] = useState(false);
  const { current: shown, commit } = useControllable({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  if (detached && !shown) setDetached(false);
  const body = useContentLoader(load);
  const service = useMachine(hoverCard.machine, {
    ...floatingMachineProps({
      id,
      open: shown,
      hold: pinned,
      placement,
      gutter: HINT_GUTTER,
      onOpenChange: (next: boolean) => {
        if (node.request(next)) commit(next);
      },
      getRootNode: env.getRootNode,
    }),
    openDelay,
    closeDelay,
    disabled: !(card ?? hoverCards),
  });
  const api = hoverCard.connect(service, normalizeProps);
  const positioner = api.getPositionerProps();
  const contentProps = cardContentProps(
    api.getContentProps(),
    pinned,
    REACT_EVENTS,
  );
  const triggerProps = api.getTriggerProps();
  const [triggerId, contentId] = [triggerProps.id ?? '', contentProps.id ?? ''];
  const togglePin = () => {
    if (pinned) commit(service.state.matches('open'));
    setPinned(!pinned);
    setDetached(false);
  };
  const unpinAndClose = () => {
    setPinned(false);
    setDetached(false);
    commit(false);
  };
  const release = useEffectEvent(unpinAndClose);
  const shut = useEffectEvent(() => {
    commit(false);
  });
  const hint = useHint({
    open: api.open,
    setOpen: (next: boolean) => {
      if (next || !pinned) commit(next);
    },
    trigger: triggerProps,
    positionerId: positioner.id ?? '',
    node,
    leaving: () => service.state.matches('closing'),
    activate: href === undefined ? togglePin : undefined,
    keys: href === undefined && inline,
  });
  const move = useCardDrag({
    open: api.open && hint.mounted,
    contentId,
    triggerId,
    getRootNode: env.getRootNode,
    detached,
    setDetached: (on: boolean) => {
      if (on) setPinned(true);
      setDetached(on);
    },
    pin: () => {
      setPinned(true);
    },
    title,
    labels,
    announce: (text: string) => {
      announcer.announce(text);
    },
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
      close: () => {
        shut();
      },
      release: () => {
        release();
      },
    });
    access.pin(pinned);
    return access.attach();
  }, [api.open, pinned, env, node, triggerId, contentId]);
  return (
    <span className={ARKHE_CLASS} {...partAttrs('hover-card', 'root')}>
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
          <div
            className={ARKHE_CLASS}
            {...partAttrs('hover-card', 'frame')}
            data-detached={flag(detached)}>
            <div {...mergeProps(positioner, { hidden: !api.open })}>
              <div
                {...mergeProps(contentProps, {
                  role: 'dialog',
                  'aria-labelledby': `${id}title`,
                })}
                data-pinned={flag(pinned)}
                data-width={width}>
                <CardHeader
                  title={title}
                  titleId={`${id}title`}
                  href={headerLink ? href : undefined}
                  actions={actions}
                  pinnable={pinnable}
                  pinned={pinned}
                  detached={detached}
                  onMove={move}
                  onTogglePin={togglePin}
                  onClose={() => {
                    elementById(env.getRootNode(), triggerId)?.focus();
                    unpinAndClose();
                  }}
                />
                <div {...partAttrs('hover-card', 'body')} id={`${id}body`}>
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
