/**
 * @fileoverview Status line: empty, loading, error or info, with its icon and
 * a live region role. Errors interrupt; the rest wait their turn.
 *
 * @module packages/react/src/Status
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  announceOnMount,
  partAttrs,
  statusLook,
  type StatusKind,
} from '@arkhe/core';
import { useEffect, useRef, type JSX, type ReactNode } from 'react';
import { useArkhe } from './ArkheProvider';
import { Icon } from './Icon';

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
 * Renders a status line. A polite one re-inserts its text once mounted, so
 * it is spoken even when the host mounts it already filled.
 *
 * @component
 * @param {StatusProps} props - Component props.
 * @param {StatusKind} props.kind - Kind of status.
 * @param {ReactNode} [props.children] - Text.
 * @returns {JSX.Element} Status line.
 */
export const Status = ({ kind, children }: StatusProps): JSX.Element => {
  const { labels } = useArkhe();
  const look = statusLook(kind, labels);
  const region = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (look.role !== 'status' || !region.current) return undefined;
    return announceOnMount(region.current);
  }, [look.role]);
  return (
    <div
      ref={region}
      className={ARKHE_CLASS}
      {...partAttrs('status', 'root')}
      data-kind={kind}
      role={look.role}>
      <Icon name={look.icon} />
      <span {...partAttrs('status', 'text')}>{children ?? look.text}</span>
    </div>
  );
};
