<!--
@component
Renders a trigger that opens a rich reference card on hover, focus or tap,
on Zag's hover-card machine. A click or Enter on a button or inline trigger
pins it; a link trigger follows its link, and a tap on it opens the card.
Tab reaches into the open card and out past the trigger; focus leaving an
unpinned card closes it. Escape closes the innermost card, pinned or not,
and focus inside it returns to the trigger; a tap outside closes an unpinned
one. Cards nest, load content on first open, and pin open until unpinned;
unpinning hands the card back to hover, so it stays open while the pointer
is over it. A card stays open while a card nested in it is open. A new
`load` loads afresh. The card mounts on first open, portalled into the
environment's container, so server markup holds the trigger alone and the
body may hold any content. Give `content`, or `load` with `loaded`.
-->
<script module lang="ts">
  import type { Placement } from '@arkhe/core';
  import type { Snippet } from 'svelte';

  /**
   * Props of HoverCard.
   *
   * @interface HoverCardProps
   * @template T
   * @property {string} title - Card heading; also names the pin button.
   * @property {Snippet} children - Trigger content.
   * @property {string} [href] - Makes the trigger the provider's link to this address, and adds the link to the card's header.
   * @property {boolean} [headerLink] - `false` leaves the link out of the header; the trigger stays a link. Defaults to `true`.
   * @property {Snippet} [actions] - Host controls in the header, before the built-in buttons.
   * @property {boolean} [inline] - Makes the trigger inline text with a tab stop; it may hold other triggers.
   * @property {Snippet} [content] - Card body.
   * @property {() => Promise<T>} [load] - Fetches the body on first open.
   * @property {Snippet<[T]>} [loaded] - Renders what `load` returned.
   * @property {boolean} [pinnable] - Shows a pin button. Defaults to `true`.
   * @property {boolean} [open] - Open state; bindable. A function binding vetoes.
   * @property {boolean} [defaultOpen] - First open state when uncontrolled.
   * @property {(open: boolean) => void} [onOpenChange] - Reports open-state changes.
   * @property {Placement} [placement] - Side. Defaults to `bottom-start`.
   * @property {number} [openDelay] - Milliseconds before opening. Defaults to `400`.
   * @property {number} [closeDelay] - Milliseconds before closing. Defaults to `200`.
   * @property {'narrow' | 'wide'} [width] - Card width. Unset, it sits between the two.
   * @property {boolean} [card] - `false` opens this card on click only; overrides the provider's `hoverCards`.
   */
  export interface HoverCardProps<T> {
    title: string;
    children: Snippet;
    href?: string;
    headerLink?: boolean;
    actions?: Snippet;
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
    width?: 'narrow' | 'wide';
    card?: boolean;
  }
</script>

<script lang="ts" generics="T">
  import {
    ARKHE_CLASS,
    CardAccess,
    cardContentProps,
    cardTriggerAria,
    elementById,
    flag,
    floatingMachineProps,
    HINT_GUTTER,
    partAttrs,
    SVELTE_EVENTS,
  } from '@arkhe/core';
  import * as hoverCard from '@zag-js/hover-card';
  import {
    mergeProps,
    normalizeProps,
    portal,
    useMachine,
  } from '@zag-js/svelte';
  import { untrack } from 'svelte';
  import { useArkhe } from '../base/context.js';
  import { useArkheEnvironment } from '../base/environment.js';
  import { useContentLoader } from '../feedback/contentLoader.svelte.js';
  import Status from '../feedback/Status.svelte';
  import { useCardDrag } from './cardDrag.svelte.js';
  import CardHeader from './CardHeader.svelte';
  import { useHint, useHintNode } from './hint.svelte.js';
  import HintScope from './HintScope.svelte';
  import HintTrigger from './HintTrigger.svelte';

  let {
    title,
    children,
    href,
    headerLink = true,
    actions,
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
    width,
    card,
  }: HoverCardProps<T> = $props();
  const id = $props.id();
  const arkhe = useArkhe();
  const env = useArkheEnvironment();
  const node = useHintNode();
  const body = useContentLoader(() => load);
  const initial = untrack(() => defaultOpen ?? false);
  const shown = $derived(open ?? initial);
  let pinned = $state(false);
  let detached = $state(false);
  const commit = (next: boolean) => {
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
      gutter: HINT_GUTTER,
      onOpenChange: (next: boolean) => {
        if (node.request(next)) commit(next);
      },
      getRootNode: env().getRootNode,
    }),
    openDelay,
    closeDelay,
    disabled: !(card ?? arkhe().hoverCards),
  }));
  const api = $derived(hoverCard.connect(service, normalizeProps));
  const shownCard = $derived(api.open);
  const triggerId = $derived(api.getTriggerProps().id ?? '');
  const contentId = $derived(api.getContentProps().id ?? '');
  const togglePin = () => {
    if (pinned) commit(service.state.matches('open'));
    pinned = !pinned;
    detached = false;
  };
  const unpinAndClose = () => {
    pinned = false;
    detached = false;
    commit(false);
  };
  $effect(() => {
    if (!shown) detached = false;
  });
  $effect(() => {
    if (!shownCard) return undefined;
    const byId = (key: string) => elementById(env().getRootNode(), key);
    const [trigger, content] = [triggerId, contentId];
    const access = new CardAccess({
      getRootNode: env().getRootNode,
      trigger: () => byId(trigger),
      content: () => byId(content),
      node,
      close: () => {
        untrack(() => {
          commit(false);
        });
      },
      release: () => {
        untrack(unpinAndClose);
      },
    });
    access.pin(pinned);
    return access.attach();
  });
  const hint = useHint(() => ({
    open: api.open,
    setOpen: (next: boolean) => {
      if (next || !pinned) commit(next);
    },
    trigger: api.getTriggerProps(),
    positionerId: api.getPositionerProps().id ?? '',
    getRootNode: env().getRootNode,
    node,
    leaving: () => service.state.matches('closing'),
    activate: href === undefined ? togglePin : undefined,
    keys: href === undefined && Boolean(inline),
  }));
  const cardOpen = $derived(api.open && hint.mounted);
  const move = useCardDrag({
    open: () => cardOpen,
    contentId: () => contentId,
    triggerId: () => triggerId,
    getRootNode: () => env().getRootNode(),
    detached: () => detached,
    setDetached: (on: boolean) => {
      if (on) pinned = true;
      detached = on;
    },
    pin: () => {
      pinned = true;
    },
    title: () => title,
    labels: () => arkhe().labels,
    announce: (text: string) => {
      arkhe().announcer.announce(text);
    },
  });
  $effect(() => {
    if (api.open) body.load();
  });
</script>

<span class={ARKHE_CLASS} {...partAttrs('hover-card', 'root')}
  ><HintTrigger
    attrs={{
      ...hint.trigger,
      ...cardTriggerAria({
        link: href !== undefined,
        inline: Boolean(inline),
        open: shownCard,
        contentId,
        bodyId: `${id}body`,
      }),
    }}
    {href}
    {inline}>{@render children()}</HintTrigger
  >{#if hint.mounted}<div
      class={ARKHE_CLASS}
      {...partAttrs('hover-card', 'frame')}
      data-detached={flag(detached)}
      use:portal={{
        container: env().container(),
        getRootNode: env().getRootNode,
      }}>
      <div {...mergeProps(api.getPositionerProps(), { hidden: !api.open })}>
        <div
          {...mergeProps(
            cardContentProps(api.getContentProps(), pinned, SVELTE_EVENTS),
            {
              role: 'dialog',
              'aria-labelledby': `${id}title`,
            },
          )}
          data-pinned={flag(pinned)}
          data-width={width}>
          <CardHeader
            {title}
            titleId={`${id}title`}
            href={headerLink ? href : undefined}
            {actions}
            {pinnable}
            {pinned}
            {detached}
            onMove={move}
            onTogglePin={togglePin}
            onClose={() => {
              elementById(env().getRootNode(), triggerId)?.focus();
              unpinAndClose();
            }} />
          <div {...partAttrs('hover-card', 'body')} id={`${id}body`}>
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
