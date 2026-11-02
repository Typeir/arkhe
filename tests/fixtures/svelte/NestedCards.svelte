<!--
@component
Test fixture: a hover card whose body holds another hover card.
-->
<script lang="ts">
  import { HoverCard } from '@arkhe/svelte';
</script>

<HoverCard title="Charge" openDelay={0}>
  charge
  {#snippet content()}
    <HoverCard title="Action" openDelay={0}>
      act
      {#snippet content()}One per turn.{/snippet}
    </HoverCard>
  {/snippet}
</HoverCard>
<span>elsewhere</span>
