<!--
@component
Test fixture: a parent that binds a NumericInput to a value that starts
undefined and shows what the binding holds.
-->
<script lang="ts">
  import { NumericInput, type NumericValue } from '@arkhe/svelte';

  let qty = $state<NumericValue | undefined>();
</script>

<NumericInput label="Qty" bind:value={qty} />
<output>{String(qty)}</output>
