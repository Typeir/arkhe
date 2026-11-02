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
  partAttrs,
  statusLook,
  type StatusKind,
} from '@arkhe/core';
import type { JSX, ReactNode } from 'react';
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
 * Renders a status line.
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
  return (
    <div
      className={ARKHE_CLASS}
      {...partAttrs('status', 'root')}
      data-kind={kind}
      role={look.role}>
      <Icon name={look.icon} />
      <span {...partAttrs('status', 'text')}>{children ?? look.text}</span>
    </div>
  );
};
