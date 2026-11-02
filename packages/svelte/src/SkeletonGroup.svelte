<!--
@component
Groups skeletons into one loading region. Its only text is the hidden
`loading` label, re-inserted once mounted so it is spoken; the host removes the
group when the content arrives.
-->
<script lang="ts">
  import { ARKHE_CLASS, announceOnMount, partAttrs } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import { useArkhe } from './context.js';

  /**
   * Props of SkeletonGroup.
   *
   * @interface Props
   * @property {Snippet} children - Skeletons in the final layout's shape.
   */
  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
  const arkhe = useArkhe();
  let region = $state<HTMLDivElement>();
  $effect(() => (region ? announceOnMount(region) : undefined));
</script>

<div
  bind:this={region}
  class={ARKHE_CLASS}
  {...partAttrs('skeleton', 'group')}
  role="status"
  aria-label={arkhe().labels.loading}>
  <span {...partAttrs('skeleton', 'label')}>{arkhe().labels.loading}</span>
  {@render children()}
</div>
