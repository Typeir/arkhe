/**
 * @fileoverview React specimen section for Select, Picker and Search: a
 * plain grouped select, a searchable select, a picker that adds to a list,
 * a grouped search box that asks its request and takes free text, and two
 * thousand runes as virtual rows: a select and a plain list.
 *
 * @module apps/showcase/src/react/SelectSection
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { Picker, Search, Select, VirtualList } from '@arkhe/react';
import { type JSX, useState } from 'react';
import {
  searchSpecimen,
  SPECIMEN_RUNES,
  SPECIMEN_SCHOOLS,
  SPECIMEN_SECTIONS,
  SPECIMEN_SPELLS,
} from '../specimen';

/**
 * Renders the select family and what each one reported.
 *
 * @component
 * @returns {JSX.Element} Section.
 */
export const SelectSection = (): JSX.Element => {
  const [school, setSchool] = useState<string | null>(null);
  const [known, setKnown] = useState<readonly string[]>([]);
  const [searched, setSearched] = useState('nothing yet');
  return (
    <section className='specimen' id='select'>
      <h2>{SPECIMEN_SECTIONS.select}</h2>
      <div className='row'>
        <Select
          label='School'
          items={SPECIMEN_SCHOOLS}
          emptyLabel='Any school'
          value={school}
          onValueChange={setSchool}
        />
        <Select
          label='Spell'
          items={SPECIMEN_SPELLS}
          placeholder='Choose a spell'
          searchable
        />
        <Picker
          label='Learn spell'
          items={SPECIMEN_SPELLS}
          placeholder='Add to the list'
          onSelect={(spell) => {
            setKnown((list) =>
              list.includes(spell.label) ? list : [...list, spell.label],
            );
          }}
        />
        <Search
          label='Search'
          search={searchSpecimen}
          placeholder='Search, Enter for all results'
          onSubmit={setSearched}
        />
        <Select
          label='Rune'
          items={SPECIMEN_RUNES}
          placeholder='One of 2000'
          rowPitch={2}
        />
        <VirtualList
          label='Runes'
          items={SPECIMEN_RUNES}
          rowPitch={2}
          maxHeight='12rem'
          getKey={(rune) => rune.value}
          renderItem={(rune) => rune.label}
        />
        <output>School: {school ?? 'any'}</output>
        <output>Known: {known.join(', ') || 'none'}</output>
        <output>Searched: {searched}</output>
      </div>
    </section>
  );
};
