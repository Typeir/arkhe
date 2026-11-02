<!--
@component
Test fixture: removable chips, each in its own list item, that the host drops
when asked.
-->
<script lang="ts">
  import { Chip } from '@arkhe/svelte';

  let names = $state(['fire', 'frost', 'ward']);
</script>

<ul>
  {#each names as name (name)}
    <li>
      <Chip
        label={name}
        onRemove={() => (names = names.filter((other) => other !== name))} />
    </li>
  {/each}
</ul>
