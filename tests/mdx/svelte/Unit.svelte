<!--
@component
A measure with its renderings in a tooltip, on an inline trigger.
-->
<script lang="ts">
  import { Tooltip } from '@arkhe/svelte';
  import { measure } from '../data';

  let {
    value,
    unit,
    denominator,
  }: { value: string; unit: string; denominator?: string } = $props();
  const shown = $derived(measure(value, unit, denominator));
</script>

<Tooltip inline
  >{shown.label}{#snippet content()}{#each shown.renderings as text (text)}<span
        >{text}
      </span>{/each}{/snippet}</Tooltip>
