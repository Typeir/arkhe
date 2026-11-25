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
`load` loads afresh. The machine sleeps until the first hover, focus or tap.
The card mounts on first open, portalled into the environment's container, so server markup holds the trigger alone and the
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
  import { ARKHE_CLASS, cardTriggerAria, partAttrs } from '@arkhe/core';
  import HintTrigger from './HintTrigger.svelte';
  import LiveHoverCard from './LiveHoverCard.svelte';
  import { useSleep } from './sleep.svelte.js';

  let { children, open = $bindable(), ...rest }: HoverCardProps<T> = $props();
  const id = $props.id();
  const sleep = useSleep(
    'hover-card',
    id,
    () => open === true,
    () => rest.defaultOpen === true,
  );
  const attrs = $derived(
    sleep.waking === null
      ? {
          ...sleep.attrs,
          ...cardTriggerAria({
            link: rest.href !== undefined,
            inline: Boolean(rest.inline),
            open: false,
            contentId: '',
            bodyId: '',
          }),
        }
      : sleep.attrs,
  );
</script>

<span class={ARKHE_CLASS} {...partAttrs('hover-card', 'root')}
  ><HintTrigger {attrs} href={rest.href} inline={rest.inline}
    >{@render children()}</HintTrigger
  >{#if sleep.waking !== null}<LiveHoverCard
      bind:open
      {...rest}
      defaultOpen={sleep.fresh ? rest.defaultOpen : undefined}
      {id}
      waking={sleep.waking}
      sleeper={sleep} />{/if}</span>
