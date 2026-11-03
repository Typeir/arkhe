<!--
@component
Renders a Tooltip or HoverCard trigger: a button by default, the provider's
link (or an `a`) with `href`, or a `span` with a tab stop when `inline`,
which may hold other triggers. `href` wins over `inline`.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { useArkhe } from './context.js';

  /**
   * Props of HintTrigger.
   *
   * @interface Props
   * @property {HTMLAttributes<HTMLElement>} attrs - Trigger props from `useHint`.
   * @property {string} [href] - Renders a link to this address.
   * @property {boolean} [inline] - Renders inline text with a tab stop.
   * @property {Snippet} children - Trigger content.
   */
  interface Props {
    attrs: HTMLAttributes<HTMLElement>;
    href?: string;
    inline?: boolean;
    children: Snippet;
  }

  let { attrs, href, inline, children }: Props = $props();
  const arkhe = useArkhe();
  const Link = $derived(arkhe().link);
</script>

{#if href !== undefined && Link}
  <Link {...attrs} {href}>{@render children()}</Link>
{:else if href !== undefined}
  <a {...attrs} {href}>{@render children()}</a>
{:else if inline}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <span tabindex="0" {...attrs}>{@render children()}</span>
{:else}
  <button type="button" {...attrs}>{@render children()}</button>
{/if}
