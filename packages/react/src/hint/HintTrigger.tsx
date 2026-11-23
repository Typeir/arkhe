/**
 * @fileoverview What Tooltip and HoverCard share: a body mounted on first
 * open after hydration and kept after, a place in the hint tree, tap
 * handling, and a trigger that is a button, a link or inline text.
 *
 * @module packages/react/src/hint/HintTrigger
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  HintNode,
  hintTriggerProps,
  type PointerMemory,
  REACT_EVENTS,
  watchOutsideTap,
} from '@arkhe/core';
import {
  createContext,
  type HTMLAttributes,
  type JSX,
  type ReactNode,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from 'react';
import { useArkheEnvironment } from '../base/ArkheEnvironment.js';
import { useArkhe } from '../base/ArkheProvider.js';
import { useHydrated } from '../base/useHydrated.js';

/**
 * Node of the card a hint renders in; HoverCard provides it to its card.
 *
 * @constant HintContext
 * @type {import('react').Context<HintNode | undefined>}
 */
export const HintContext = createContext<HintNode | undefined>(undefined);

/**
 * Returns this hint's tree node, a child of the card it renders in.
 *
 * @function useHintNode
 * @returns {HintNode} Node, stable across renders.
 */
export function useHintNode(): HintNode {
  const parent = useContext(HintContext);
  const [node] = useState(() => new HintNode(parent));
  return node;
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
 * @property {HintNode} node - The hint's tree node, from `useHintNode`.
 * @property {() => boolean} leaving - Whether Zag waits to close it after the pointer left.
 * @property {() => void} [activate] - A click that is not a tap; pins a card.
 * @property {boolean} [keys] - Enter and Space also activate.
 */
export interface HintInput<P extends object> {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly trigger: P & { readonly id?: string | null };
  readonly positionerId: string;
  readonly node: HintNode;
  readonly leaving: () => boolean;
  readonly activate?: () => void;
  readonly keys?: boolean;
}

/**
 * Returns the trigger props with tap handling, and whether the body is
 * mounted: from the first open after hydration on, so server markup holds
 * none and CSS exit transitions still run after. Keeps the node in the
 * hint tree.
 *
 * @function useHint
 * @template {object} P
 * @param {HintInput<P>} input - Open state, trigger props, positioner id, node.
 * @returns {{ trigger: P; mounted: boolean }} Trigger props and mount flag.
 */
export function useHint<P extends object>({
  open,
  setOpen,
  trigger,
  positionerId,
  node,
  leaving,
  activate,
  keys,
}: HintInput<P>): { trigger: P; mounted: boolean } {
  const env = useArkheEnvironment();
  const hydrated = useHydrated();
  const [opened, setOpened] = useState(false);
  if (open && hydrated && !opened) setOpened(true);
  const [memory] = useState<PointerMemory>(() => ({ current: null }));
  const close = useEffectEvent(() => {
    setOpen(false);
  });
  const closing = useEffectEvent(() => leaving());
  const triggerId = trigger.id ?? '';
  useEffect(
    () =>
      node.attach({
        close: () => {
          close();
        },
        leaving: () => closing(),
        ids: () => [triggerId, positionerId],
      }),
    [node, triggerId, positionerId],
  );
  useEffect(() => {
    node.report(open);
  }, [node, open]);
  useEffect(() => {
    if (!open) return undefined;
    return watchOutsideTap(
      env.getRootNode(),
      () => node.ids(),
      () => {
        close();
      },
    );
  }, [open, env, node]);
  return {
    trigger: hintTriggerProps(trigger, {
      open,
      setOpen,
      memory,
      names: REACT_EVENTS,
      holds: (target) => node.holds(env.getRootNode(), target),
      activate,
      keys,
    }),
    mounted: opened,
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
 * Renders a hint trigger: the provider's link with `href`, a `span` with a
 * tab stop when `inline`, which may hold other triggers, else a button.
 * `href` wins over `inline`.
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
