/**
 * @fileoverview Skeleton placeholders. `Skeleton` declares one shape;
 * `SkeletonGroup` owns a set of them: it shows them while loading, swaps in
 * the content when loading ends, and has the canvas effect engine reveal it.
 * The CSS skeleton shows until a canvas has painted the group.
 *
 * @module packages/react/src/Skeleton
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  announceText,
  flag,
  partAttrs,
  type Fx,
} from '@arkhe/core';
import {
  useEffect,
  useLayoutEffect,
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
 * @property {boolean} loading - True: show `skeleton` and animate. False: show `children` and reveal them.
 * @property {ReactNode} skeleton - Shapes in the final layout's shape.
 * @property {ReactNode} [children] - The real content, mounted only once loading ends.
 * @property {boolean} [effect] - False keeps the CSS skeleton for this group. Defaults to true.
 * @property {() => void} [onRevealed] - Called when the reveal has finished, or at once without an effect.
 */
export interface SkeletonGroupProps {
  readonly loading: boolean;
  readonly skeleton: ReactNode;
  readonly children?: ReactNode;
  readonly effect?: boolean;
  readonly onRevealed?: () => void;
}

/**
 * Renders one placeholder shape, hidden from assistive technology.
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
 * Owns a skeleton and its content. While loading, its only text is the
 * hidden `loading` label, which the announcer speaks. The engine attaches
 * on mount and whenever loading starts, is told the content is ready in a
 * layout effect, so the cover paints before the browser does, and detaches
 * on unmount. Without a loaded engine the content just shows.
 *
 * @component
 * @param {SkeletonGroupProps} props - Component props.
 * @param {boolean} props.loading - Loading.
 * @param {ReactNode} props.skeleton - Shapes.
 * @param {ReactNode} [props.children] - Content.
 * @param {boolean} [props.effect] - Canvas effect on.
 * @param {() => void} [props.onRevealed] - Reveal finished.
 * @returns {JSX.Element} Owner.
 */
export const SkeletonGroup = ({
  loading,
  skeleton,
  children,
  effect = true,
  onRevealed,
}: SkeletonGroupProps): JSX.Element => {
  const { labels, announcer, effects } = useArkhe();
  const host = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const shown = useRef(loading);
  const revealed = useRef(onRevealed);
  useLayoutEffect(() => {
    revealed.current = onRevealed;
  });
  useEffect(
    () =>
      loading && label.current
        ? announceText(label.current, announcer, () => 'polite')
        : undefined,
    [announcer, loading],
  );
  const attached = useRef<Fx | null>(null);
  useEffect(() => {
    const el = host.current;
    if (!loading || !effect || !el) return;
    const attach = (fx: Fx | null) => {
      attached.current = fx;
      fx?.attach(el);
    };
    if (effects.engine) return attach(effects.engine);
    let live = true;
    void effects.request().then((fx) => {
      if (live) attach(fx);
    });
    return () => {
      live = false;
    };
  }, [effects, loading, effect]);
  useLayoutEffect(() => {
    const was = shown.current;
    shown.current = loading;
    const el = host.current;
    if (!was || loading || !el) return;
    const done = () => revealed.current?.();
    const fx = effect ? attached.current : null;
    if (fx) fx.ready(el, done);
    else done();
  }, [loading, effect]);
  useEffect(() => {
    const el = host.current;
    return () => {
      if (el) attached.current?.detach(el);
    };
  }, []);
  return (
    <div
      ref={host}
      className={ARKHE_CLASS}
      {...partAttrs('skeleton', 'group')}
      data-loading={flag(loading)}>
      {loading ? (
        <>
          <span ref={label} {...partAttrs('skeleton', 'label')}>
            {labels.loading}
          </span>
          {skeleton}
        </>
      ) : (
        children
      )}
    </div>
  );
};
