/**
 * @fileoverview What Tooltip and HoverCard share: open state that is
 * controlled or not, a body mounted on first open and kept after, tap
 * handling, and a trigger that is a button, a link or inline text.
 *
 * @module packages/react/src/HintTrigger
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  REACT_EVENTS,
  hintTriggerProps,
  watchOutsideTap,
  type PointerMemory,
} from '@arkhe/core';
import {
  useEffect,
  useEffectEvent,
  useState,
  type HTMLAttributes,
  type JSX,
  type ReactNode,
} from 'react';
import { useArkhe } from './ArkheProvider.js';
import { useArkheEnvironment } from './ArkheEnvironment.js';

/**
 * Open state of a hint and its setter.
 *
 * @interface OpenState
 * @property {boolean} shown - Open state to hand Zag.
 * @property {(open: boolean) => void} change - Sets it and reports changes.
 */
export interface OpenState {
  readonly shown: boolean;
  readonly change: (open: boolean) => void;
}

/**
 * Holds the open state: `open` when given, else its own, seeded by
 * `defaultOpen`. Reports only real changes.
 *
 * @function useOpenState
 * @param {boolean} [open] - Controlled open state.
 * @param {boolean} [defaultOpen] - First open state when uncontrolled.
 * @param {(open: boolean) => void} [onOpenChange] - Open-state callback.
 * @returns {OpenState} State and setter.
 */
export function useOpenState(
  open?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (open: boolean) => void,
): OpenState {
  const [inner, setInner] = useState(defaultOpen ?? false);
  const shown = open ?? inner;
  const change = (next: boolean) => {
    if (next === shown) return;
    setInner(next);
    onOpenChange?.(next);
  };
  return { shown, change };
}

/**
 * What `useHint` needs.
 *
 * @interface HintInput
 * @template {object} P
 * @property {boolean} open - Whether Zag shows the hint.
 * @property {(open: boolean) => void} setOpen - Opens or closes it from a tap.
 * @property {P & { id?: string | null }} trigger - Zag's trigger props.
 * @property {string} positionerId - Id of the hint's positioner.
 */
export interface HintInput<P extends object> {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly trigger: P & { readonly id?: string | null };
  readonly positionerId: string;
}

/**
 * Returns the trigger props with tap handling, and whether the body is
 * mounted: from the first open on, so server markup holds none and CSS
 * exit transitions still run after.
 *
 * @function useHint
 * @template {object} P
 * @param {HintInput<P>} input - Open state, trigger props, positioner id.
 * @returns {{ trigger: P; mounted: boolean }} Trigger props and mount flag.
 */
export function useHint<P extends object>(
  input: HintInput<P>,
): { trigger: P; mounted: boolean } {
  const { open, setOpen, trigger, positionerId } = input;
  const env = useArkheEnvironment();
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);
  const [memory] = useState<PointerMemory>(() => ({ current: undefined }));
  const close = useEffectEvent(() => setOpen(false));
  const triggerId = trigger.id ?? '';
  useEffect(() => {
    if (!open) return undefined;
    return watchOutsideTap(env.getRootNode(), [triggerId, positionerId], () =>
      close(),
    );
  }, [open, env, triggerId, positionerId]);
  return {
    trigger: hintTriggerProps(trigger, {
      open,
      setOpen,
      memory,
      names: REACT_EVENTS,
    }),
    mounted,
  };
}

/**
 * Props of HintTrigger.
 *
 * @interface HintTriggerProps
 * @property {HTMLAttributes<HTMLElement>} attrs - Trigger props from `useHint`.
 * @property {string} [href] - Renders the provider's link to this address.
 * @property {boolean} [inline] - Renders inline text with a tab stop.
 * @property {ReactNode} children - Trigger content.
 */
export interface HintTriggerProps {
  readonly attrs: HTMLAttributes<HTMLElement>;
  readonly href?: string;
  readonly inline?: boolean;
  readonly children: ReactNode;
}

/**
 * Renders a hint trigger: a button by default, the provider's link with
 * `href`, or a `span` with a tab stop when `inline`, which may hold other
 * triggers. `href` wins over `inline`.
 *
 * @component
 * @param {HintTriggerProps} props - Attributes, kind, content.
 * @returns {JSX.Element} Trigger.
 */
export const HintTrigger = ({
  attrs,
  href,
  inline,
  children,
}: HintTriggerProps): JSX.Element => {
  const { link: Link } = useArkhe();
  if (href !== undefined) {
    return (
      <Link {...attrs} href={href}>
        {children}
      </Link>
    );
  }
  if (inline) {
    return (
      <span tabIndex={0} {...attrs}>
        {children}
      </span>
    );
  }
  return (
    <button type='button' {...attrs}>
      {children}
    </button>
  );
};
