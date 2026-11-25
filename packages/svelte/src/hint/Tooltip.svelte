<!--
@component
Renders a trigger that shows a short description on hover, keyboard focus
and tap, on Zag's tooltip machine; a tap outside or Escape closes it. One is
open at a time. The content is phrasing only, never links or controls (an
ARIA tooltip); anything interactive, a link trigger included, belongs in a
HoverCard. The body mounts on first open, portalled into the environment's
container, so server markup holds the trigger alone.
-->
<script module lang="ts">
  import type { Placement } from '@arkhe/core';
  import type { Snippet } from 'svelte';

  /**
   * Props of Tooltip.
   *
   * @interface TooltipProps
   * @property {string | Snippet} content - Description; non-interactive phrasing content.
   * @property {Snippet} children - Trigger content.
   * @property {boolean} [inline] - Makes the trigger inline text with a tab stop; it may hold other triggers.
   * @property {boolean} [open] - Open state; bindable. A function binding vetoes.
   * @property {boolean} [defaultOpen] - First open state when uncontrolled.
   * @property {(open: boolean) => void} [onOpenChange] - Reports open-state changes.
   * @property {Placement} [placement] - Side. Defaults to `top`.
   * @property {number} [openDelay] - Milliseconds before opening. Defaults to `400`.
   * @property {number} [closeDelay] - Milliseconds before closing. Defaults to `150`.
   */
  export interface TooltipProps {
    content: string | Snippet;
    children: Snippet;
    inline?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: Placement;
    openDelay?: number;
    closeDelay?: number;
  }
</script>

<script lang="ts">
  import { ARKHE_CLASS, partAttrs } from '@arkhe/core';
  import HintTrigger from './HintTrigger.svelte';
  import LiveTooltip from './LiveTooltip.svelte';
  import { useSleep } from './sleep.svelte.js';

  let {
    content,
    children,
    inline,
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    placement,
    openDelay,
    closeDelay,
  }: TooltipProps = $props();
  const id = $props.id();
  const sleep = useSleep(
    'tooltip',
    id,
    () => open === true,
    () => defaultOpen === true,
  );
</script>

<span class={ARKHE_CLASS} {...partAttrs('tooltip', 'root')}
  ><HintTrigger attrs={sleep.attrs} {inline}>{@render children()}</HintTrigger
  >{#if sleep.waking !== null}<LiveTooltip
      bind:open
      {content}
      defaultOpen={sleep.fresh ? defaultOpen : undefined}
      {onOpenChange}
      {placement}
      {openDelay}
      {closeDelay}
      {id}
      waking={sleep.waking}
      sleeper={sleep} />{/if}</span>
