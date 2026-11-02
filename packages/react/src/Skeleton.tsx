/**
 * @fileoverview Skeleton placeholders: shaped bars that stand in for content
 * while it loads, grouped under one announced loading region.
 *
 * @module packages/react/src/Skeleton
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import { ARKHE_CLASS, announceOnMount, partAttrs } from '@arkhe/core';
import {
  useEffect,
  useRef,
  type CSSProperties,
  type JSX,
  type ReactNode,
} from 'react';
import { useArkhe } from './ArkheProvider';

/**
 * Props of Skeleton.
 *
 * @interface SkeletonProps
 * @property {'line' | 'block'} [shape] - A text line or a block. Defaults to `line`.
 * @property {string} [width] - CSS width. Defaults to the full row.
 * @property {string} [height] - CSS height. Defaults by shape.
 */
export interface SkeletonProps {
  readonly shape?: 'line' | 'block';
  readonly width?: string;
  readonly height?: string;
}

/**
 * Props of SkeletonGroup.
 *
 * @interface SkeletonGroupProps
 * @property {ReactNode} children - Skeletons in the final layout's shape.
 */
export interface SkeletonGroupProps {
  readonly children: ReactNode;
}

/**
 * Renders one placeholder bar, hidden from assistive technology.
 *
 * @component
 * @param {SkeletonProps} props - Component props.
 * @param {'line' | 'block'} [props.shape] - Shape.
 * @param {string} [props.width] - CSS width.
 * @param {string} [props.height] - CSS height.
 * @returns {JSX.Element} Placeholder.
 */
export const Skeleton = ({
  shape = 'line',
  width,
  height,
}: SkeletonProps): JSX.Element => {
  const style = {
    '--skeleton-width': width,
    '--skeleton-height': height,
  } as CSSProperties;
  return (
    <span
      className={ARKHE_CLASS}
      {...partAttrs('skeleton', 'root')}
      data-shape={shape}
      style={style}
      aria-hidden
    />
  );
};

/**
 * Groups skeletons into one loading region. Its only text is the hidden
 * `loading` label, re-inserted once mounted so it is spoken; the host
 * removes the group when the content arrives.
 *
 * @component
 * @param {SkeletonGroupProps} props - Component props.
 * @param {ReactNode} props.children - Skeletons.
 * @returns {JSX.Element} Loading region.
 */
export const SkeletonGroup = ({
  children,
}: SkeletonGroupProps): JSX.Element => {
  const { labels } = useArkhe();
  const region = useRef<HTMLDivElement>(null);
  useEffect(
    () => (region.current ? announceOnMount(region.current) : undefined),
    [],
  );
  return (
    <div
      ref={region}
      className={ARKHE_CLASS}
      {...partAttrs('skeleton', 'group')}
      role='status'
      aria-label={labels.loading}>
      <span {...partAttrs('skeleton', 'label')}>{labels.loading}</span>
      {children}
    </div>
  );
};
