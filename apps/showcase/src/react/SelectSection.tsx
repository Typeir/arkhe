/**
 * @fileoverview React specimen section for Select, Picker and Search: a
 * plain grouped select, a searchable select, a picker that adds to a list,
 * and a grouped search box that filters here and takes free text.
 *
 * @module apps/showcase/src/react/SelectSection
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { filterOptions } from '@arkhe/core';
import { Picker, Search, Select } from '@arkhe/react';
import { useState, type JSX } from 'react';
import {
  SPECIMEN_SCHOOLS,
  SPECIMEN_SEARCH,
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
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState('nothing yet');
  return (
    <section className='specimen' id='select'>
      <h2>{SPECIMEN_SECTIONS.select}</h2>
      <div className='row'>
        <Select
          label='School'
          items={SPECIMEN_SCHOOLS}
          placeholder='Any school'
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
          onSelect={(spell) =>
            setKnown((list) =>
              list.includes(spell.label) ? list : [...list, spell.label],
            )
          }
        />
        <Search
          label='Search'
          items={filterOptions(SPECIMEN_SEARCH, query)}
          placeholder='Search, Enter for all results'
          onInputChange={setQuery}
          onSubmit={setSearched}
        />
        <output>School: {school ?? 'any'}</output>
        <output>Known: {known.join(', ') || 'none'}</output>
        <output>Searched: {searched}</output>
      </div>
    </section>
  );
};
