/**
 * @fileoverview HoverCard: a rich reference card on Zag's hover-card machine.
 * Cards nest (a card's content may hold more cards), load content on first
 * open, and pin open until unpinned. The machine sleeps until the first
 * hover, focus or tap; the card mounts on first open, portalled into the
 * environment's container, so server markup holds the trigger alone and the
 * body may hold any content.
 *
 * @module packages/react/src/hint/HoverCard
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  cardTriggerAria,
  partAttrs,
  type Placement,
} from '@arkhe/core';
import { type JSX, type ReactNode, useId } from 'react';
import { HintTrigger } from './HintTrigger.js';
import { LiveHoverCard } from './LiveHoverCard.js';
import { useSleep } from './useSleep.js';

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
 * The machine sleeps until the first hover, focus or tap, and again once
 * the card has closed.
 *
 * @component
 * @param {HoverCardProps<T>} props - Title, trigger, body, open state, timing.
 * @returns {JSX.Element} Trigger, and the card once opened.
 */
export const HoverCard = <T,>(props: HoverCardProps<T>): JSX.Element => {
  const { children, href, inline, open, defaultOpen } = props;
  const id = useId();
  const sleep = useSleep('hover-card', id, open === true, defaultOpen === true);
  const attrs =
    sleep.waking === null
      ? {
          ...sleep.attrs,
          ...cardTriggerAria({
            link: href !== undefined,
            inline: Boolean(inline),
            open: false,
            contentId: '',
            bodyId: '',
          }),
        }
      : sleep.attrs;
  return (
    <span className={ARKHE_CLASS} {...partAttrs('hover-card', 'root')}>
      <HintTrigger attrs={attrs} href={href} inline={inline}>
        {children}
      </HintTrigger>
      {sleep.waking === null ? null : (
        <LiveHoverCard
          {...props}
          defaultOpen={sleep.fresh ? defaultOpen : undefined}
          id={id}
          waking={sleep.waking}
          sleeper={sleep}
        />
      )}
    </span>
  );
};
