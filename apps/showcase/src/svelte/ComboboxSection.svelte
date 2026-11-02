<!--
@component
Svelte specimen section for Combobox: a searchable select, a picker that adds
to a list, and a grouped search box that takes free text.
-->
<script lang="ts">
  import { Combobox } from '@arkhe/svelte';
  import {
    SPECIMEN_SEARCH,
    SPECIMEN_SECTIONS,
    SPECIMEN_SPELLS,
  } from '../specimen';

  let known = $state<readonly string[]>([]);
  let searched = $state('nothing yet');
</script>

<section class="specimen" id="combobox">
  <h2>{SPECIMEN_SECTIONS.combobox}</h2>
  <div class="row">
    <Combobox
      label="Spell"
      items={SPECIMEN_SPELLS}
      placeholder="Choose a spell" />
    <Combobox
      label="Learn spell"
      items={SPECIMEN_SPELLS}
      placeholder="Add to the list"
      clearOnSelect
      onSelect={(spell) => {
        if (!known.includes(spell.label)) known = [...known, spell.label];
      }} />
    <Combobox
      label="Search"
      items={SPECIMEN_SEARCH}
      placeholder="Search, Enter for all results"
      onSubmit={(text) => (searched = text)} />
    <output>Known: {known.join(', ') || 'none'}</output>
    <output>Searched: {searched}</output>
  </div>
</section>
