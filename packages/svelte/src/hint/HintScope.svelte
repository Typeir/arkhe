<!--
@component
Makes a card's hint node the parent of the hints rendered in its body, so
only the body links nested hints to the card, not its trigger.
-->
<script module lang="ts">
  import type { HintNode } from '@arkhe/core';
  import type { Snippet } from 'svelte';

  /**
   * Props of HintScope.
   *
   * @interface HintScopeProps
   * @property {HintNode} node - The card's node.
   * @property {Snippet} children - Card body.
   */
  export interface HintScopeProps {
    node: HintNode;
    children: Snippet;
  }
</script>

<script lang="ts">
  import { provideHintNode } from './hint.svelte.js';

  let { node, children }: HintScopeProps = $props();
  provideHintNode(() => node);
</script>

{@render children()}
