<!--
@component
Test fixture: a parent that binds a NumericInput and clamps its value to 10.
-->
<script lang="ts">
  import { NumericInput, type NumericValue } from '@arkhe/svelte';

  /**
   * Props of ClampedNumeric.
   *
   * @interface Props
   * @property {(value: NumericValue) => void} onCommit - Receives commits.
   */
  interface Props {
    onCommit: (value: NumericValue) => void;
  }

  let { onCommit }: Props = $props();
  let value = $state<NumericValue>(5);
  const clamp = (next: NumericValue) => {
    value = next === null ? null : Math.min(next, 10);
  };
</script>

<NumericInput
  label="Speed"
  {value}
  max={10}
  onValueChange={clamp}
  onValueCommit={onCommit} />
