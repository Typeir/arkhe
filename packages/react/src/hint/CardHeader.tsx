/**
 * @fileoverview A hover card's header: the grip that drags the card and opens
 * its move menu, its small chrome title, the host's actions, then the
 * built-in link, pin and close buttons. Not exported:
 * HoverCard draws it.
 *
 * @module packages/react/src/hint/CardHeader
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

'use client';

import type { JSX, ReactNode } from 'react';
import { formatLabel, moveMenu, partAttrs } from '@arkhe/core';
import { Button } from '../action/Button.js';
import { Menu } from '../action/Menu.js';
import { useArkhe } from '../base/ArkheProvider.js';

/**
 * Props of CardHeader.
 *
 * @interface CardHeaderProps
 * @property {string} title - Card title; names the buttons.
 * @property {string} titleId - Id of the title, which names the card.
 * @property {string} [href] - Address of the built-in link.
 * @property {ReactNode} [actions] - Host controls of the card's chrome.
 * @property {boolean} pinnable - Shows the pin button.
 * @property {boolean} pinned - The card is pinned.
 * @property {() => void} onTogglePin - Pins or unpins.
 * @property {() => void} onClose - Closes a pinned card.
 * @property {boolean} detached - The card is dragged free.
 * @property {(value: string) => void} onMove - A move menu choice: a corner or back.
 */
export interface CardHeaderProps {
  readonly title: string;
  readonly titleId: string;
  readonly href?: string;
  readonly actions?: ReactNode;
  readonly pinnable: boolean;
  readonly pinned: boolean;
  readonly onTogglePin: () => void;
  readonly onClose: () => void;
  readonly detached: boolean;
  readonly onMove: (value: string) => void;
}

/**
 * Renders the header of a hover card.
 *
 * @component
 * @param {CardHeaderProps} props - Component props.
 * @returns {JSX.Element} Header.
 */
export const CardHeader = ({
  title,
  titleId,
  href,
  actions,
  pinnable,
  pinned,
  onTogglePin,
  onClose,
  detached,
  onMove,
}: CardHeaderProps): JSX.Element => {
  const { labels } = useArkhe();
  return (
    <div {...partAttrs('hover-card', 'header')}>
      <Menu
        trigger={formatLabel(labels.moveCard, { label: title })}
        icon='grip-vertical'
        items={moveMenu(labels, detached)}
        onSelect={onMove}
      />
      <span {...partAttrs('hover-card', 'title')} id={titleId}>
        {title}
      </span>
      {actions === undefined ? null : (
        <span {...partAttrs('hover-card', 'actions')}>{actions}</span>
      )}
      {href !== undefined ? (
        <Button
          shape='plain'
          size='m'
          icon='external-link'
          label={formatLabel(labels.openLink, { label: title })}
          href={href}
        />
      ) : null}
      {pinnable ? (
        <Button
          shape='plain'
          size='m'
          icon='pin'
          label={formatLabel(pinned ? labels.unpin : labels.pin, {
            label: title,
          })}
          pressed={pinned}
          onClick={onTogglePin}
        />
      ) : null}
      <span {...partAttrs('hover-card', 'close')} hidden={!pinned}>
        <Button
          shape='plain'
          tone='danger'
          size='m'
          icon='x'
          label={formatLabel(labels.closeCard, { label: title })}
          onClick={onClose}
        />
      </span>
    </div>
  );
};
