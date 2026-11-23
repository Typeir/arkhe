<!--
@component
Renders a collapsible section: a trigger button, optionally inside a heading,
actions beside it, and a region find-in-page can open; when the browser
reveals it, the section opens. Height animates in CSS. `open` binds.
-->
<script module lang="ts">
  import type { HeadingLevel } from '@arkhe/core';
  import type { Snippet } from 'svelte';

  /**
   * Props of Collapsible.
   *
   * @interface CollapsibleProps
   * @property {string} title - Trigger text; names the button and never changes.
   * @property {boolean} [open] - Open state; bindable.
   * @property {boolean} [defaultOpen] - First state when uncontrolled.
   * @property {(open: boolean) => void} [onOpenChange] - Reports changes, find-in-page included.
   * @property {HeadingLevel} [heading] - Wraps the trigger in a heading of this level.
   * @property {Snippet} [actions] - Controls beside the trigger, outside it.
   * @property {boolean} [lazy] - Mounts the content on first open, then keeps it.
   * @property {boolean} [disabled] - The trigger stays focusable and ignores presses.
   * @property {Snippet} children - Content.
   */
  export interface CollapsibleProps {
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
</script>

<script lang="ts">
  import {
    ARKHE_CLASS,
    type CollapsibleAction,
    collapsibleIds,
    collapsibleReduce,
    dispatch,
    findableRegion,
    headingTag,
    partAttrs,
    sectionTags,
  } from '@arkhe/core';
  import { untrack } from 'svelte';
  import Icon from '../base/Icon.svelte';
  import { useLatch } from '../base/mounted.svelte.js';

  let {
    title,
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    heading,
    actions,
    lazy,
    disabled,
    children,
  }: CollapsibleProps = $props();
  const id = $props.id();
  const ids = collapsibleIds(id);
  const initial = untrack(() => defaultOpen ?? false);
  const shown = $derived(open ?? initial);
  const tag = $derived(headingTag(heading));
  const tags = $derived(sectionTags(heading));
  const seen = useLatch(() => shown);
  const mounted = $derived(!lazy || seen.current || shown);
  const commit = (next: boolean) => {
    open = next;
    onOpenChange?.(next);
  };
  const act = (action: CollapsibleAction) => {
    dispatch(collapsibleReduce, shown, action, { disabled }, commit);
  };
</script>

{#snippet trigger()}
  <button
    type="button"
    {...partAttrs('collapsible', 'trigger')}
    id={ids.trigger}
    aria-expanded={shown}
    aria-controls={ids.content}
    aria-disabled={disabled ? true : undefined}
    onclick={() => {
      act({ type: 'toggle' });
    }}>
    <span {...partAttrs('collapsible', 'marker')}
      ><Icon name="chevron-down" /></span>
    <span {...partAttrs('collapsible', 'title')}>{title}</span>
  </button>
{/snippet}

<svelte:element
  this={tags.root}
  {@attach (node: HTMLElement) =>
    findableRegion(node, () => {
      act({ type: 'reveal' });
    })}
  class={ARKHE_CLASS}
  {...partAttrs('collapsible', 'root')}
  data-state={shown ? 'open' : 'closed'}>
  <svelte:element this={tags.header} {...partAttrs('collapsible', 'header')}>
    {#if tag}
      <svelte:element this={tag} {...partAttrs('collapsible', 'heading')}
        >{@render trigger()}</svelte:element>
    {:else}
      {@render trigger()}
    {/if}
    {#if actions}
      <div {...partAttrs('collapsible', 'actions')}>{@render actions()}</div>
    {/if}
  </svelte:element>
  <div
    {...partAttrs('collapsible', 'content')}
    id={ids.content}
    data-findable=""
    hidden={!shown}>
    <div {...partAttrs('collapsible', 'body')}>
      {#if mounted}{@render children()}{/if}
    </div>
  </div>
</svelte:element>
