<!--
@component
Test fixture: rows whose Delete button opens a confirmation Modal; confirming
removes the first row, opener included.
-->
<script lang="ts">
  import { Modal } from '@arkhe/svelte';

  let rows = $state(['a', 'b']);
  let open = $state(false);
</script>

{#each rows as row (row)}
  <div><button onclick={() => (open = true)}>Delete {row}</button></div>
{/each}
<Modal title="Sure?" bind:open>
  <button
    onclick={() => {
      rows = rows.slice(1);
      open = false;
    }}>Confirm</button>
</Modal>
