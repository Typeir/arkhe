/**
 * @fileoverview Status line: empty, loading, error or info, with its icon.
 * The app announcer speaks its text; errors interrupt, the rest wait. The
 * root is a `span`, so a status fits phrasing content such as a hover card
 * inside a paragraph.
 *
 * @module packages/react/src/feedback/Status
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  announceText,
  ARKHE_CLASS,
  partAttrs,
  type StatusKind,
  statusLook,
} from '@arkhe/core';
import {
  type JSX,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { useArkhe } from '../base/ArkheProvider.js';
import { Icon } from '../base/Icon.js';

/**
 * Props of Status.
 *
 * @interface StatusProps
 * @property {StatusKind} kind - Kind of status.
 * @property {ReactNode} [children] - Text; defaults to the kind's label.
 */
export interface StatusProps {
  readonly kind: StatusKind;
  readonly children?: ReactNode;
}

/**
 * Renders a status line. The announcer speaks its text on mount and on each
 * change, so a line mounted already filled is heard too.
 *
 * @component
 * @param {StatusProps} props - Component props.
 * @param {StatusKind} props.kind - Kind of status.
 * @param {ReactNode} [props.children] - Text.
 * @returns {JSX.Element} Status line.
 */
export const Status = ({ kind, children }: StatusProps): JSX.Element => {
  const { labels, announcer } = useArkhe();
  const look = statusLook(kind, labels);
  const region = useRef<HTMLSpanElement>(null);
  const politeness = useRef(look.politeness);
  useLayoutEffect(() => {
    politeness.current = look.politeness;
  });
  useEffect(() => {
    if (!region.current) return undefined;
    return announceText(region.current, announcer, () => politeness.current);
  }, [announcer]);
  return (
    <span
      ref={region}
      className={ARKHE_CLASS}
      {...partAttrs('status', 'root')}
      data-kind={kind}>
      <Icon name={look.icon} />
      <span {...partAttrs('status', 'text')}>{children ?? look.text}</span>
    </span>
  );
};
