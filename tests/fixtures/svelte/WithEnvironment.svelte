<!--
@component
Test fixture: an ArkheEnvironment around an EnvironmentProbe.
-->
<script lang="ts">
  import type { ArkheEnvironmentValue, RootNode } from '@arkhe/core';
  import { ArkheEnvironment } from '@arkhe/svelte';
  import EnvironmentProbe from './EnvironmentProbe.svelte';

  /**
   * Props of WithEnvironment.
   *
   * @interface Props
   * @property {() => RootNode} [rootNode] - Environment root node.
   * @property {HTMLElement} [container] - Environment portal target.
   * @property {(value: ArkheEnvironmentValue) => void} onread - Receives the environment.
   */
  interface Props {
    rootNode?: () => RootNode;
    container?: HTMLElement;
    onread: (value: ArkheEnvironmentValue) => void;
  }

  let { rootNode, container, onread }: Props = $props();
</script>

<ArkheEnvironment {rootNode} {container}>
  <EnvironmentProbe {onread} />
</ArkheEnvironment>
