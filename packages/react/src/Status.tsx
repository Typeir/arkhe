/**
 * @fileoverview Status line: empty, loading, error or info, with its icon.
 * The app announcer speaks its text; errors interrupt, the rest wait.
 *
 * @module packages/react/src/Status
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  announceText,
  partAttrs,
  statusLook,
  type StatusKind,
} from '@arkhe/core';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type JSX,
  type ReactNode,
} from 'react';
import { useArkhe } from './ArkheProvider.js';
import { Icon } from './Icon.js';

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
  const region = useRef<HTMLDivElement>(null);
  const politeness = useRef(look.politeness);
  useLayoutEffect(() => {
    politeness.current = look.politeness;
  });
  useEffect(
    () =>
      region.current
        ? announceText(region.current, announcer, () => politeness.current)
        : undefined,
    [announcer],
  );
  return (
    <div
      ref={region}
      className={ARKHE_CLASS}
      {...partAttrs('status', 'root')}
      data-kind={kind}>
      <Icon name={look.icon} />
      <span {...partAttrs('status', 'text')}>{children ?? look.text}</span>
    </div>
  );
};
