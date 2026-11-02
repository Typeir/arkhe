<!--
@component
Groups skeletons into one busy region announced with the `loading` label.
-->
<script lang="ts">
  import { ARKHE_CLASS, partAttrs } from '@arkhe/core';
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
</script>

<div
  class={ARKHE_CLASS}
  {...partAttrs('skeleton', 'group')}
  role="status"
  aria-busy="true"
  aria-label={arkhe().labels.loading}>
  {@render children()}
</div>
