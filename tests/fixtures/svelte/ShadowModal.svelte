<!--
@component
Test fixture: an open Modal whose environment lives in a shadow root.
-->
<script lang="ts">
  import { ArkheEnvironment, Modal } from '@arkhe/svelte';

  /**
   * Props of ShadowModal.
   *
   * @interface Props
   * @property {ShadowRoot} shadow - Root the app lives in.
   * @property {HTMLElement} container - Portal target inside `shadow`.
   */
  interface Props {
    shadow: ShadowRoot;
    container: HTMLElement;
  }

  let { shadow, container }: Props = $props();
</script>

<ArkheEnvironment rootNode={() => shadow} {container}>
  <Modal title="Rest" defaultOpen />
</ArkheEnvironment>
