<!--
@component
Test fixture: hands the hint node it gets to `onread`.
-->
<script lang="ts">
  import type { HintNode } from '@arkhe/core';
  import { useHintNode } from '../../../packages/svelte/src/hint.svelte';

  /**
   * Props of HintProbe.
   *
   * @interface Props
   * @property {(node: HintNode) => void} onread - Receives the node.
   */
  interface Props {
    onread: (node: HintNode) => void;
  }

  const props: Props = $props();
  const node = useHintNode();
  $effect.pre(() => props.onread(node));
</script>
