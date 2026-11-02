<!--
@component
Renders a trigger that shows a short text hint on hover and keyboard focus,
on Zag's tooltip machine. One is open at a time and it holds no controls;
rich or nested content belongs in a HoverCard.
-->
<script lang="ts">
  import {
    ARKHE_CLASS,
    floatingMachineProps,
    type Placement,
  } from '@arkhe/core';
  import * as tooltip from '@zag-js/tooltip';
  import { mergeProps, normalizeProps, useMachine } from '@zag-js/svelte';
  import type { Snippet } from 'svelte';
  import { useArkheEnvironment } from './environment.js';

  /**
   * Props of Tooltip.
   *
   * @interface Props
   * @property {string} content - Hint text.
   * @property {Snippet} children - Trigger content; wrapped in a button.
   * @property {Placement} [placement] - Side. Defaults to `top`.
   * @property {number} [openDelay] - Milliseconds before opening. Defaults to 400.
   * @property {number} [closeDelay] - Milliseconds before closing. Defaults to 150.
   */
  interface Props {
    content: string;
    children: Snippet;
    placement?: Placement;
    openDelay?: number;
    closeDelay?: number;
  }

  let {
    content,
    children,
    placement = 'top',
    openDelay = 400,
    closeDelay = 150,
  }: Props = $props();
  const id = $props.id();
  const env = useArkheEnvironment();
  const service = useMachine(tooltip.machine, () => ({
    ...floatingMachineProps({
      id,
      placement,
      strategy: 'fixed',
      getRootNode: env().getRootNode,
    }),
    openDelay,
    closeDelay,
  }));
  const api = $derived(tooltip.connect(service, normalizeProps));
</script>

<span class={ARKHE_CLASS} data-scope="tooltip" data-part="root">
  <button type="button" {...api.getTriggerProps()}>{@render children()}</button
  ><span {...mergeProps(api.getPositionerProps(), { hidden: !api.open })}>
    <span {...api.getContentProps()}>{content}</span>
  </span>
</span>
