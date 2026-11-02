<!--
@component
Groups skeletons into one placeholder. Its only text is the hidden `loading`
label, which the announcer speaks on mount; the host removes the group when
the content arrives.
-->
<script lang="ts">
  import { ARKHE_CLASS, announceText, partAttrs } from '@arkhe/core';
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
  let label = $state<HTMLSpanElement>();
  $effect(() =>
    label ? announceText(label, arkhe().announcer, () => 'polite') : undefined,
  );
</script>

<div class={ARKHE_CLASS} {...partAttrs('skeleton', 'group')}>
  <span bind:this={label} {...partAttrs('skeleton', 'label')}
    >{arkhe().labels.loading}</span>
  {@render children()}
</div>
