<!--
@component
Test fixture: a parent that owns a NumericInput's value through a function
binding and clamps it to 10, or refuses every change, with or without telling
the field its `max`.
-->
<script lang="ts">
  import { NumericInput, type NumericValue } from '@arkhe/svelte';

  /**
   * Props of ClampedNumeric.
   *
   * @interface Props
   * @property {(value: NumericValue) => void} onCommit - Receives commits.
   * @property {boolean} [unbounded] - Leaves `max` off the field.
   * @property {boolean} [refuse] - Ignores every change instead of clamping.
   * @property {(value: NumericValue) => void} [onChange] - Receives reports.
   */
  interface Props {
    onCommit: (value: NumericValue) => void;
    unbounded?: boolean;
    refuse?: boolean;
    onChange?: (value: NumericValue) => void;
  }

  let {
    onCommit,
    unbounded = false,
    refuse = false,
    onChange,
  }: Props = $props();
  let value = $state<NumericValue>(5);
  const clamp = (next: NumericValue | undefined) => {
    if (refuse || next === undefined) return;
    value = next === null ? null : Math.min(next, 10);
  };
</script>

<NumericInput
  label="Speed"
  bind:value={() => value, clamp}
  max={unbounded ? undefined : 10}
  onValueChange={onChange}
  onValueCommit={onCommit} />
<output>{String(value)}</output>
