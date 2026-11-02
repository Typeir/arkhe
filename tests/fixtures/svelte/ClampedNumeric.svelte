<!--
@component
Test fixture: a parent that holds a NumericInput's value and clamps it to 10,
with or without telling the field its `max`.
-->
<script lang="ts">
  import { NumericInput, type NumericValue } from '@arkhe/svelte';

  /**
   * Props of ClampedNumeric.
   *
   * @interface Props
   * @property {(value: NumericValue) => void} onCommit - Receives commits.
   * @property {boolean} [unbounded] - Leaves `max` off the field.
   */
  interface Props {
    onCommit: (value: NumericValue) => void;
    unbounded?: boolean;
  }

  let { onCommit, unbounded = false }: Props = $props();
  let value = $state<NumericValue>(5);
  const clamp = (next: NumericValue) => {
    value = next === null ? null : Math.min(next, 10);
  };
</script>

<NumericInput
  label="Speed"
  {value}
  max={unbounded ? undefined : 10}
  onValueChange={clamp}
  onValueCommit={onCommit} />
<output>{String(value)}</output>
