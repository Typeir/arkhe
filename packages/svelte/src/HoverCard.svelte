<!--
@component
Renders a trigger that opens a rich reference card on hover or focus, on
Zag's hover-card machine. Cards nest, load content on first open, and pin
open until unpinned; unpinning hands the card back to hover, so it stays open
while the pointer is over it. A new `load` loads afresh. The card renders in place, so a nested card stays inside
its parent's layer. Give `content`, or `load` with `loaded`.
-->
<script lang="ts" generics="T">
  import {
    ARKHE_CLASS,
    floatingMachineProps,
    formatLabel,
    type Placement,
  } from '@arkhe/core';
  import * as hoverCard from '@zag-js/hover-card';
  import { mergeProps, normalizeProps, useMachine } from '@zag-js/svelte';
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';
  import { useContentLoader } from './contentLoader.svelte.js';
  import { useArkhe } from './context.js';
  import { useArkheEnvironment } from './environment.js';
  import Status from './Status.svelte';

  /**
   * Props of HoverCard.
   *
   * @interface Props
   * @property {string} title - Card heading; also names the pin button.
   * @property {Snippet} children - Trigger content; wrapped in a button.
   * @property {Snippet} [content] - Card body.
   * @property {() => Promise<T>} [load] - Fetches the body on first open.
   * @property {Snippet<[T]>} [loaded] - Renders what `load` returned.
   * @property {boolean} [pinnable] - Shows a pin button. Defaults to true.
   * @property {Placement} [placement] - Side. Defaults to `bottom-start`.
   * @property {number} [openDelay] - Milliseconds before opening. Defaults to 400.
   * @property {number} [closeDelay] - Milliseconds before closing. Defaults to 200.
   */
  interface Props {
    title: string;
    children: Snippet;
    content?: Snippet;
    load?: () => Promise<T>;
    loaded?: Snippet<[T]>;
    pinnable?: boolean;
    placement?: Placement;
    openDelay?: number;
    closeDelay?: number;
  }

  let {
    title,
    children,
    content,
    load,
    loaded,
    pinnable = true,
    placement = 'bottom-start',
    openDelay = 400,
    closeDelay = 200,
  }: Props = $props();
  const id = $props.id();
  const arkhe = useArkhe();
  const env = useArkheEnvironment();
  const body = useContentLoader(() => load);
  let pinned = $state(false);
  let open = $state(false);
  const service = useMachine(hoverCard.machine, () => ({
    ...floatingMachineProps({
      id,
      open,
      hold: pinned,
      placement,
      strategy: 'fixed',
      onOpenChange: (next) => (open = next),
      getRootNode: env().getRootNode,
    }),
    openDelay,
    closeDelay,
  }));
  const api = $derived(hoverCard.connect(service, normalizeProps));
  $effect(() => {
    if (api.open) body.load();
  });
  const togglePin = () => {
    if (pinned) open = service.state.matches('open');
    pinned = !pinned;
  };
  const pinLabel = $derived(
    formatLabel(pinned ? arkhe().labels.unpin : arkhe().labels.pin, {
      label: title,
    }),
  );
</script>

<span class={ARKHE_CLASS} data-scope="hover-card" data-part="root">
  <button type="button" {...api.getTriggerProps()}>{@render children()}</button
  ><span {...mergeProps(api.getPositionerProps(), { hidden: !api.open })}>
    <span {...api.getContentProps()} data-pinned={pinned ? '' : undefined}>
      <span data-scope="hover-card" data-part="header">
        <span data-scope="hover-card" data-part="title">{title}</span>
        {#if pinnable}
          <Button
            variant="ghost"
            icon={pinned ? 'pin-off' : 'pin'}
            label={pinLabel}
            pressed={pinned}
            onclick={togglePin} />
        {/if}
      </span>
      <span data-scope="hover-card" data-part="body">
        {@render content?.()}
        {#if body.state.status === 'loading'}
          <Status kind="loading" />
        {:else if body.state.status === 'error'}
          <Status kind="error" />
        {:else if body.state.status === 'ready'}
          {@render loaded?.(body.state.value)}
        {/if}
      </span>
    </span>
  </span>
</span>
