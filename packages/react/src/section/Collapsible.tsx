/**
 * @fileoverview Collapsible: a trigger button, optionally inside a heading,
 * actions beside it, and a region find-in-page can open. Height animates in
 * CSS.
 *
 * @module packages/react/src/section/Collapsible
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

'use client';

import {
  ARKHE_CLASS,
  type CollapsibleAction,
  collapsibleIds,
  collapsibleReduce,
  dispatch,
  findableRegion,
  type HeadingLevel,
  headingTag,
  partAttrs,
  sectionTags,
} from '@arkhe/core';
import {
  createElement,
  type JSX,
  type ReactNode,
  type RefObject,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from 'react';
import { Icon } from '../base/Icon.js';
import { useControllable } from '../base/useControllable.js';

/**
 * Props of Collapsible.
 *
 * @interface CollapsibleProps
 * @property {string} title - Trigger text; names the button and never changes.
 * @property {boolean} [open] - Open state; makes it controlled.
 * @property {boolean} [defaultOpen] - First state when uncontrolled.
 * @property {(open: boolean) => void} [onOpenChange] - Reports changes, find-in-page included.
 * @property {HeadingLevel} [heading] - Wraps the trigger in a heading of this level.
 * @property {ReactNode} [actions] - Controls beside the trigger, outside it.
 * @property {boolean} [lazy] - Mounts the content on first open, then keeps it.
 * @property {boolean} [disabled] - The trigger stays focusable and ignores presses.
 * @property {ReactNode} children - Content.
 */
export interface CollapsibleProps {
  readonly title: string;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly heading?: HeadingLevel;
  readonly actions?: ReactNode;
  readonly lazy?: boolean;
  readonly disabled?: boolean;
  readonly children: ReactNode;
}

/**
 * Renders a collapsible section. A closed region stays findable; when the
 * browser reveals it, the section opens.
 *
 * @component
 * @param {CollapsibleProps} props - Component props.
 * @returns {JSX.Element} Collapsible.
 */
export const Collapsible = ({
  title,
  open,
  defaultOpen = false,
  onOpenChange,
  heading,
  actions,
  lazy,
  disabled,
  children,
}: CollapsibleProps): JSX.Element => {
  const ids = collapsibleIds(useId());
  const { current: shown, commit } = useControllable({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [seen, setSeen] = useState(shown);
  if (shown && !seen) setSeen(true);
  const root = useRef<HTMLElement>(null);
  const act = (action: CollapsibleAction) => {
    dispatch(collapsibleReduce, shown, action, { disabled }, commit);
  };
  const found = useEffectEvent(() => {
    act({ type: 'reveal' });
  });
  useEffect(() => {
    if (!root.current) return undefined;
    return findableRegion(root.current, found);
  }, []);
  const trigger = (
    <button
      type='button'
      {...partAttrs('collapsible', 'trigger')}
      id={ids.trigger}
      aria-expanded={shown}
      aria-controls={ids.content}
      aria-disabled={disabled ? true : undefined}
      onClick={() => {
        act({ type: 'toggle' });
      }}>
      <span {...partAttrs('collapsible', 'marker')}>
        <Icon name='chevron-down' />
      </span>
      <span {...partAttrs('collapsible', 'title')}>{title}</span>
    </button>
  );
  const tag = headingTag(heading);
  const { root: Root, header: Header } = sectionTags(heading);
  return (
    <Root
      ref={root as RefObject<HTMLDivElement | null>}
      className={ARKHE_CLASS}
      {...partAttrs('collapsible', 'root')}
      data-state={shown ? 'open' : 'closed'}>
      <Header {...partAttrs('collapsible', 'header')}>
        {tag
          ? createElement(tag, partAttrs('collapsible', 'heading'), trigger)
          : trigger}
        {actions === undefined ? null : (
          <div {...partAttrs('collapsible', 'actions')}>{actions}</div>
        )}
      </Header>
      <div
        {...partAttrs('collapsible', 'content')}
        id={ids.content}
        data-findable=''
        hidden={!shown}>
        <div {...partAttrs('collapsible', 'body')}>
          {!lazy || seen ? children : null}
        </div>
      </div>
    </Root>
  );
};
