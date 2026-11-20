<!--
@component
Sets where the Arkhé components below live: the root node Zag queries, and
the element portals mount into.
-->
<script lang="ts">
  import { createEnvironment, type RootNode } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import { provideArkheEnvironment } from './environment.js';

  /**
   * Props of ArkheEnvironment.
   *
   * @interface Props
   * @property {() => RootNode} [rootNode] - Returns the root node, e.g. a shadow root.
   * @property {HTMLElement} [container] - Portal target. Defaults to the root node's body.
   * @property {Snippet} children - Subtree.
   */
  interface Props {
    rootNode?: () => RootNode;
    container?: HTMLElement;
    children: Snippet;
  }

  let { rootNode, container, children }: Props = $props();
  const environment = $derived(createEnvironment({ rootNode, container }));
  provideArkheEnvironment(() => environment);
</script>

{@render children()}
