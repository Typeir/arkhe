<!--
@component
Test fixture: hands the environment it sees to `onread`.
-->
<script lang="ts">
  import type { ArkheEnvironmentValue } from '@arkhe/core';
  import { useArkheEnvironment } from '@arkhe/svelte';

  /**
   * Props of EnvironmentProbe.
   *
   * @interface Props
   * @property {(value: ArkheEnvironmentValue) => void} onread - Receives the environment.
   */
  interface Props {
    onread: (value: ArkheEnvironmentValue) => void;
  }

  const props: Props = $props();
  const env = useArkheEnvironment();
  $effect.pre(() => props.onread(env()));
</script>
