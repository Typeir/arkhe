<!--
@component
Svelte specimen section for Select, Picker and Search: a plain grouped
select, a searchable select, a picker that adds to a list, and a grouped
search box that filters here and takes free text.
-->
<script lang="ts">
  import { filterOptions } from '@arkhe/core';
  import { Picker, Search, Select } from '@arkhe/svelte';
  import {
    SPECIMEN_SCHOOLS,
    SPECIMEN_SEARCH,
    SPECIMEN_SECTIONS,
    SPECIMEN_SPELLS,
  } from '../specimen';

  let school = $state<string | null>(null);
  let known = $state<readonly string[]>([]);
  let query = $state('');
  let searched = $state('nothing yet');
</script>

<section class="specimen" id="select">
  <h2>{SPECIMEN_SECTIONS.select}</h2>
  <div class="row">
    <Select
      label="School"
      items={SPECIMEN_SCHOOLS}
      placeholder="Any school"
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
      items={filterOptions(SPECIMEN_SEARCH, query)}
      placeholder="Search, Enter for all results"
      onInputChange={(text) => (query = text)}
      onSubmit={(text) => (searched = text)} />
    <output>School: {school ?? 'any'}</output>
    <output>Known: {known.join(', ') || 'none'}</output>
    <output>Searched: {searched}</output>
  </div>
</section>
