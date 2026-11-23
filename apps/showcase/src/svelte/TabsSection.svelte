<!--
@component
Svelte specimen section for tabs: line tabs, and folder tabs with many tabs,
nested three deep.
-->
<script lang="ts">
  import { Tabs } from '@arkhe/svelte';
  import {
    nestsFolder,
    SPECIMEN_FOLDERS,
    SPECIMEN_SECTIONS,
    SPECIMEN_TAB_TEXT,
    SPECIMEN_TABS,
  } from '../specimen';
</script>

{#snippet folder(depth: number)}
  <Tabs
    look="folder"
    items={SPECIMEN_FOLDERS[depth] ?? []}
    label={`Folder level ${depth + 1}`}>
    {#snippet panel(value: string)}
      {#if nestsFolder(depth, value)}
        {@render folder(depth + 1)}
      {:else}
        <p>Contents of {value}.</p>
      {/if}
    {/snippet}
  </Tabs>
{/snippet}

<section class="specimen" id="tabs">
  <h2>{SPECIMEN_SECTIONS.tabs}</h2>
  <div class="stack">
    <Tabs items={SPECIMEN_TABS} label="Sheet">
      {#snippet panel(key)}{SPECIMEN_TAB_TEXT[key]}{/snippet}
    </Tabs>
    {@render folder(0)}
  </div>
</section>
