<!--
@component
Test fixture: a hint probe inside a HintScope for `node`, and one outside.
-->
<script lang="ts">
  import type { HintNode } from '@arkhe/core';
  import HintScope from '../../../packages/svelte/src/HintScope.svelte';
  import HintProbe from './HintProbe.svelte';

  /**
   * Props of HintScoped.
   *
   * @interface Props
   * @property {HintNode} node - Scope's node.
   * @property {(node: HintNode) => void} inside - Receives the inner probe's node.
   * @property {(node: HintNode) => void} outside - Receives the outer probe's node.
   */
  interface Props {
    node: HintNode;
    inside: (node: HintNode) => void;
    outside: (node: HintNode) => void;
  }

  let { node, inside, outside }: Props = $props();
</script>

<HintProbe onread={outside} />
<HintScope {node}><HintProbe onread={inside} /></HintScope>
