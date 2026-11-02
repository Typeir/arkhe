<!--
@component
Test fixture: hands the adapters it sees to `onread`.
-->
<script lang="ts">
  import { useArkhe, type ArkheContextValue } from '@arkhe/svelte';

  /**
   * Props of ContextProbe.
   *
   * @interface Props
   * @property {(value: ArkheContextValue) => void} onread - Receives the adapters.
   */
  interface Props {
    onread: (value: ArkheContextValue) => void;
  }

  const props: Props = $props();
  const arkhe = useArkhe();
  $effect.pre(() => props.onread(arkhe()));
</script>
