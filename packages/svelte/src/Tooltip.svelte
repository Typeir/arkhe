<!--
@component
Renders a trigger that shows a short description on hover, keyboard focus
and tap, on Zag's tooltip machine; a tap outside or Escape closes it. One is
open at a time. The content is phrasing only, never links or controls (an
ARIA tooltip); anything interactive belongs in a HoverCard. The body mounts
on first open, so server markup holds the trigger alone.
-->
<script lang="ts">
  import {
    ARKHE_CLASS,
    floatingMachineProps,
    type Placement,
  } from '@arkhe/core';
  import * as tooltip from '@zag-js/tooltip';
  import { mergeProps, normalizeProps, useMachine } from '@zag-js/svelte';
  import { untrack, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { useArkheEnvironment } from './environment.js';
  import { useHint } from './hint.svelte.js';
  import HintTrigger from './HintTrigger.svelte';

  /**
   * Props of Tooltip.
   *
   * @interface Props
   * @property {string | Snippet} content - Description; non-interactive phrasing content.
   * @property {Snippet} children - Trigger content.
   * @property {string} [href] - Makes the trigger the provider's link to this address.
   * @property {boolean} [inline] - Makes the trigger inline text with a tab stop; it may hold other triggers.
   * @property {boolean} [open] - Open state; bindable. A function binding vetoes.
   * @property {boolean} [defaultOpen] - First open state when uncontrolled.
   * @property {(open: boolean) => void} [onOpenChange] - Reports open-state changes.
   * @property {Placement} [placement] - Side. Defaults to `top`.
   * @property {number} [openDelay] - Milliseconds before opening. Defaults to 400.
   * @property {number} [closeDelay] - Milliseconds before closing. Defaults to 150.
   */
  interface Props {
    content: string | Snippet;
    children: Snippet;
    href?: string;
    inline?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: Placement;
    openDelay?: number;
    closeDelay?: number;
  }

  let {
    content,
    children,
    href,
    inline,
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    placement = 'top',
    openDelay = 400,
    closeDelay = 150,
  }: Props = $props();
  const id = $props.id();
  const env = useArkheEnvironment();
  const initial = untrack(() => defaultOpen ?? false);
  const shown = $derived(open ?? initial);
  const change = (next: boolean) => {
    if (next === shown) return;
    open = next;
    onOpenChange?.(next);
  };
  const service = useMachine(tooltip.machine, () => ({
    ...floatingMachineProps({
      id,
      open: shown,
      onOpenChange: change,
      placement,
      strategy: 'fixed',
      getRootNode: env().getRootNode,
    }),
    openDelay,
    closeDelay,
  }));
  const api = $derived(tooltip.connect(service, normalizeProps));
  const hint = useHint(() => ({
    open: api.open,
    setOpen: change,
    trigger: api.getTriggerProps() as HTMLAttributes<HTMLElement>,
    positionerId: api.getPositionerProps().id ?? '',
    getRootNode: env().getRootNode,
  }));
</script>

<span class={ARKHE_CLASS} data-scope="tooltip" data-part="root"
  ><HintTrigger attrs={hint.trigger} {href} {inline}
    >{@render children()}</HintTrigger
  >{#if hint.mounted}<span
      {...mergeProps(api.getPositionerProps(), { hidden: !api.open })}>
      <span {...api.getContentProps()}
        >{#if typeof content === 'string'}{content}{:else}{@render content()}{/if}</span>
    </span>{/if}</span>
