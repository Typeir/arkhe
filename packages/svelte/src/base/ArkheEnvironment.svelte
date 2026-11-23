<!--
@component
Sets where the Arkhé components below live: the root node Zag queries, and
the element portals mount into.
-->
<script module lang="ts">
  import type { RootNode } from '@arkhe/core';
  import type { Snippet } from 'svelte';

  /**
   * Props of ArkheEnvironment.
   *
   * @interface ArkheEnvironmentProps
   * @property {() => RootNode} [rootNode] - Returns the root node, e.g. a shadow root.
   * @property {HTMLElement} [container] - Portal target. Defaults to the root node's body.
   * @property {Snippet} children - Subtree.
   */
  export interface ArkheEnvironmentProps {
    rootNode?: () => RootNode;
    container?: HTMLElement;
    children: Snippet;
  }
</script>

<script lang="ts">
  import { createEnvironment } from '@arkhe/core';
  import { provideArkheEnvironment } from './environment.js';

  let { rootNode, container, children }: ArkheEnvironmentProps = $props();
  const environment = $derived(createEnvironment({ rootNode, container }));
  provideArkheEnvironment(() => environment);
</script>

{@render children()}
