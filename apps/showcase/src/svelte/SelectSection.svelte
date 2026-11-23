<!--
@component
Svelte specimen section for Select, Picker and Search: a plain grouped
select, a searchable select, a picker that adds to a list, and a grouped
search box that asks its request and takes free text, and two thousand runes
as virtual rows: a select and a plain list.
-->
<script lang="ts">
  import { Picker, Search, Select, VirtualList } from '@arkhe/svelte';
  import {
    searchSpecimen,
    SPECIMEN_RUNES,
    SPECIMEN_SCHOOLS,
    SPECIMEN_SECTIONS,
    SPECIMEN_SPELLS,
  } from '../specimen';

  let school = $state<string | null>(null);
  let known = $state<readonly string[]>([]);
  let searched = $state('nothing yet');
</script>

<section class="specimen" id="select">
  <h2>{SPECIMEN_SECTIONS.select}</h2>
  <div class="row">
    <Select
      label="School"
      items={SPECIMEN_SCHOOLS}
      emptyLabel="Any school"
      bind:value={school} />
    <Select
      label="Spell"
      items={SPECIMEN_SPELLS}
      placeholder="Choose a spell"
      searchable />
    <Picker
      label="Learn spell"
      items={SPECIMEN_SPELLS}
      placeholder="Add to the list"
      onSelect={(spell) => {
        if (!known.includes(spell.label)) known = [...known, spell.label];
      }} />
    <Search
      label="Search"
      search={searchSpecimen}
      placeholder="Search, Enter for all results"
      onSubmit={(text) => (searched = text)} />
    <Select
      label="Rune"
      items={SPECIMEN_RUNES}
      placeholder="One of 2000"
      rowPitch={2} />
    <VirtualList
      label="Runes"
      items={SPECIMEN_RUNES}
      rowPitch={2}
      maxHeight="12rem"
      getKey={(rune) => rune.value}>
      {#snippet item(rune)}{rune.label}{/snippet}
    </VirtualList>
    <output>School: {school ?? 'any'}</output>
    <output>Known: {known.join(', ') || 'none'}</output>
    <output>Searched: {searched}</output>
  </div>
</section>
