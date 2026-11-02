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

import { ARKHE_CLASS, announceText, partAttrs } from '@arkhe/core';
import {
  useEffect,
  useRef,
  type CSSProperties,
  type JSX,
  type ReactNode,
} from 'react';
import { useArkhe } from './ArkheProvider.js';

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
 * Groups skeletons into one placeholder. Its only text is the hidden
 * `loading` label, which the announcer speaks on mount; the host removes the
 * group when the content arrives.
 *
 * @component
 * @param {SkeletonGroupProps} props - Component props.
 * @param {ReactNode} props.children - Skeletons.
 * @returns {JSX.Element} Loading region.
 */
export const SkeletonGroup = ({
  children,
}: SkeletonGroupProps): JSX.Element => {
  const { labels, announcer } = useArkhe();
  const label = useRef<HTMLSpanElement>(null);
  useEffect(
    () =>
      label.current
        ? announceText(label.current, announcer, () => 'polite')
        : undefined,
    [announcer],
  );
  return (
    <div className={ARKHE_CLASS} {...partAttrs('skeleton', 'group')}>
      <span ref={label} {...partAttrs('skeleton', 'label')}>
        {labels.loading}
      </span>
      {children}
    </div>
  );
};
