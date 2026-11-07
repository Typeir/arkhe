<!--
@component
Renders a trigger that opens a rich reference card on hover, focus or tap,
on Zag's hover-card machine; a tap outside or Escape closes it, unless
pinned. A tap on a link trigger opens the card; the header's link follows
it. Cards nest, load content on first open, and pin open until unpinned;
unpinning hands the card back to hover, so it stays open while the pointer
is over it. A card stays open while a card nested in it is open. A new
`load` loads afresh. The card mounts on first open, portalled into the
environment's container, so server markup holds the trigger alone and the
body may hold any content. Give `content`, or `load` with `loaded`.
-->
<script lang="ts" generics="T">
  import {
    ARKHE_CLASS,
    floatingMachineProps,
    formatLabel,
    type Placement,
  } from '@arkhe/core';
  import * as hoverCard from '@zag-js/hover-card';
  import {
    mergeProps,
    normalizeProps,
    portal,
    useMachine,
  } from '@zag-js/svelte';
  import { untrack, type Snippet } from 'svelte';
  import Button from './Button.svelte';
  import { useContentLoader } from './contentLoader.svelte.js';
  import { useArkhe } from './context.js';
  import { useArkheEnvironment } from './environment.js';
  import { useHint, useHintNode } from './hint.svelte.js';
  import HintScope from './HintScope.svelte';
  import HintTrigger from './HintTrigger.svelte';
  import Status from './Status.svelte';

  /**
   * Props of HoverCard.
   *
   * @interface Props
   * @property {string} title - Card heading; also names the pin button.
   * @property {Snippet} children - Trigger content.
   * @property {string} [href] - Makes the trigger the provider's link to this address, and adds the link to the card's header.
   * @property {boolean} [inline] - Makes the trigger inline text with a tab stop; it may hold other triggers.
   * @property {Snippet} [content] - Card body.
   * @property {() => Promise<T>} [load] - Fetches the body on first open.
   * @property {Snippet<[T]>} [loaded] - Renders what `load` returned.
   * @property {boolean} [pinnable] - Shows a pin button. Defaults to true.
   * @property {boolean} [open] - Open state; bindable. A function binding vetoes.
   * @property {boolean} [defaultOpen] - First open state when uncontrolled.
   * @property {(open: boolean) => void} [onOpenChange] - Reports open-state changes.
   * @property {Placement} [placement] - Side. Defaults to `bottom-start`.
   * @property {number} [openDelay] - Milliseconds before opening. Defaults to 400.
   * @property {number} [closeDelay] - Milliseconds before closing. Defaults to 200.
   */
  interface Props {
    title: string;
    children: Snippet;
    href?: string;
    inline?: boolean;
    content?: Snippet;
    load?: () => Promise<T>;
    loaded?: Snippet<[T]>;
    pinnable?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: Placement;
    openDelay?: number;
    closeDelay?: number;
  }

  let {
    title,
    children,
    href,
    inline,
    content,
    load,
    loaded,
    pinnable = true,
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    placement = 'bottom-start',
    openDelay = 400,
    closeDelay = 200,
  }: Props = $props();
  const id = $props.id();
  const arkhe = useArkhe();
  const env = useArkheEnvironment();
  const node = useHintNode();
  const body = useContentLoader(() => load);
  const initial = untrack(() => defaultOpen ?? false);
  const shown = $derived(open ?? initial);
  let pinned = $state(false);
  const change = (next: boolean) => {
    if (next === shown) return;
    open = next;
    onOpenChange?.(next);
  };
  const service = useMachine(hoverCard.machine, () => ({
    ...floatingMachineProps({
      id,
      open: shown,
      hold: pinned,
      placement,
      onOpenChange: (next: boolean) => {
        if (node.request(next)) change(next);
      },
      getRootNode: env().getRootNode,
    }),
    openDelay,
    closeDelay,
  }));
  const api = $derived(hoverCard.connect(service, normalizeProps));
  const hint = useHint(() => ({
    open: api.open,
    setOpen: (next: boolean) => {
      if (next || !pinned) change(next);
    },
    trigger: api.getTriggerProps(),
    positionerId: api.getPositionerProps().id ?? '',
    getRootNode: env().getRootNode,
    node,
    leaving: () => service.state.matches('closing'),
  }));
  $effect(() => {
    if (api.open) body.load();
  });
  const togglePin = () => {
    if (pinned) change(service.state.matches('open'));
    pinned = !pinned;
  };
  const pinLabel = $derived(
    formatLabel(pinned ? arkhe().labels.unpin : arkhe().labels.pin, {
      label: title,
    }),
  );
  const linkLabel = $derived(
    formatLabel(arkhe().labels.openLink, { label: title }),
  );
</script>

<span class={ARKHE_CLASS} data-scope="hover-card" data-part="root"
  ><HintTrigger attrs={hint.trigger} {href} {inline}
    >{@render children()}</HintTrigger
  >{#if hint.mounted}<div
      class={ARKHE_CLASS}
      use:portal={{
        container: env().container(),
        getRootNode: env().getRootNode,
      }}>
      <div {...mergeProps(api.getPositionerProps(), { hidden: !api.open })}>
        <div {...api.getContentProps()} data-pinned={pinned ? '' : undefined}>
          <div data-scope="hover-card" data-part="header">
            <span data-scope="hover-card" data-part="title">{title}</span>
            {#if href !== undefined}
              <Button
                variant="ghost"
                icon="external-link"
                label={linkLabel}
                {href} />
            {/if}
            {#if pinnable}
              <Button
                variant="ghost"
                icon={pinned ? 'pin-off' : 'pin'}
                label={pinLabel}
                pressed={pinned}
                onclick={togglePin} />
            {/if}
          </div>
          <div data-scope="hover-card" data-part="body">
            <HintScope {node}>
              {@render content?.()}
              {#if body.state.status === 'loading'}
                <Status kind="loading" />
              {:else if body.state.status === 'error'}
                <Status kind="error" />
              {:else if body.state.status === 'ready'}
                {@render loaded?.(body.state.value)}
              {/if}
            </HintScope>
          </div>
        </div>
      </div>
    </div>{/if}</span>
