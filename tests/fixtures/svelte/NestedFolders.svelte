<!--
@component
Test fixture: folder tabs nested through a line tab set, three folders deep,
with the innermost panel showing the ground it reads.
-->
<script lang="ts">
  import { Tabs } from '@arkhe/svelte';
  import GroundProbe from './GroundProbe.svelte';

  const items = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
  ];
</script>

<Tabs look="folder" {items} label="Outer">
  {#snippet panel()}
    <Tabs {items} label="Line">
      {#snippet panel()}
        <Tabs look="folder" {items} label="Inner">
          {#snippet panel()}
            <Tabs look="folder" {items} label="Deepest">
              {#snippet panel()}<GroundProbe />{/snippet}
            </Tabs>
          {/snippet}
        </Tabs>
      {/snippet}
    </Tabs>
  {/snippet}
</Tabs>
