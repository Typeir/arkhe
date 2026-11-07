<!--
@component
Makes a card's hint node the parent of the hints rendered in its body, so
only the body links nested hints to the card, not its trigger.
-->
<script lang="ts">
  import type { HintNode } from '@arkhe/core';
  import { untrack, type Snippet } from 'svelte';
  import { provideHintNode } from './hint.svelte.js';

  /**
   * Props of HintScope.
   *
   * @interface Props
   * @property {HintNode} node - The card's node.
   * @property {Snippet} children - Card body.
   */
  interface Props {
    node: HintNode;
    children: Snippet;
  }

  let { node, children }: Props = $props();
  provideHintNode(untrack(() => node));
</script>

{@render children()}
