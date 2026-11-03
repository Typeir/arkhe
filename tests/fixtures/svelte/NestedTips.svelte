<!--
@component
Test fixture: an inline tooltip trigger holding another inline tooltip
trigger, and text outside both.
-->
<script lang="ts">
  import { Tooltip } from '@arkhe/svelte';
</script>

<Tooltip inline openDelay={0} content="Outer"
  >outer <Tooltip inline openDelay={0} content="Inner">inner</Tooltip></Tooltip>
<p>elsewhere</p>
