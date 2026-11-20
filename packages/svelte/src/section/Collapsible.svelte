<!--
@component
Renders a collapsible section: a trigger button, optionally inside a heading,
actions beside it, and a region find-in-page can open; when the browser
reveals it, the section opens. Height animates in CSS. `open` binds.
-->
<script lang="ts">
  import {
    ARKHE_CLASS,
    collapsibleIds,
    findableRegion,
    headingTag,
    partAttrs,
    type HeadingLevel,
  } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import Icon from '../base/Icon.svelte';

  /**
   * Props of Collapsible.
   *
   * @interface Props
   * @property {string} title - Trigger text; names the button and never changes.
   * @property {boolean} [open] - Open state; bindable.
   * @property {boolean} [defaultOpen] - First state when unbound.
   * @property {(open: boolean) => void} [onOpenChange] - Reports changes, find-in-page included.
   * @property {HeadingLevel} [heading] - Wraps the trigger in a heading of this level.
   * @property {Snippet} [actions] - Controls beside the trigger, outside it.
   * @property {boolean} [lazy] - Mounts the content on first open, then keeps it.
   * @property {boolean} [disabled] - The trigger stays focusable and ignores presses.
   * @property {Snippet} children - Content.
   */
  interface Props {
    title: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    heading?: HeadingLevel;
    actions?: Snippet;
    lazy?: boolean;
    disabled?: boolean;
    children: Snippet;
  }

  let {
    title,
    defaultOpen = false,
    open = $bindable(defaultOpen),
    onOpenChange,
    heading,
    actions,
    lazy,
    disabled,
    children,
  }: Props = $props();
  const id = $props.id();
  const ids = collapsibleIds(id);
  const tag = $derived(headingTag(heading));
  let seen = $state(false);
  $effect(() => {
    if (open) seen = true;
  });
  const mounted = $derived(!lazy || seen || open);
  const change = (next: boolean) => {
    open = next;
    onOpenChange?.(next);
  };
</script>

{#snippet trigger()}
  <button
    type="button"
    {...partAttrs('collapsible', 'trigger')}
    id={ids.trigger}
    aria-expanded={open}
    aria-controls={ids.content}
    aria-disabled={disabled ? true : undefined}
    onclick={() => {
      if (!disabled) change(!open);
    }}>
    <span {...partAttrs('collapsible', 'marker')}
      ><Icon name="chevron-down" /></span>
    <span {...partAttrs('collapsible', 'title')}>{title}</span>
  </button>
{/snippet}

<div
  {@attach (node) =>
    findableRegion(node, () => {
      if (!open) change(true);
    })}
  class={ARKHE_CLASS}
  {...partAttrs('collapsible', 'root')}
  data-state={open ? 'open' : 'closed'}>
  <div {...partAttrs('collapsible', 'header')}>
    {#if tag}
      <svelte:element this={tag} {...partAttrs('collapsible', 'heading')}
        >{@render trigger()}</svelte:element>
    {:else}
      {@render trigger()}
    {/if}
    {#if actions}
      <div {...partAttrs('collapsible', 'actions')}>{@render actions()}</div>
    {/if}
  </div>
  <div
    {...partAttrs('collapsible', 'content')}
    id={ids.content}
    data-findable=""
    hidden={!open}>
    <div {...partAttrs('collapsible', 'body')}>
      {#if mounted}{@render children()}{/if}
    </div>
  </div>
</div>
