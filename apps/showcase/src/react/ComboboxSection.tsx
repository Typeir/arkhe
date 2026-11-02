/**
 * @fileoverview React specimen section for Combobox: a searchable select, a
 * picker that adds to a list, and a grouped search box that takes free text.
 *
 * @module apps/showcase/src/react/ComboboxSection
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { Combobox } from '@arkhe/react';
import { useState, type JSX } from 'react';
import {
  SPECIMEN_SEARCH,
  SPECIMEN_SECTIONS,
  SPECIMEN_SPELLS,
} from '../specimen';

/**
 * Renders the three combobox jobs and what each one reported.
 *
 * @component
 * @returns {JSX.Element} Section.
 */
export const ComboboxSection = (): JSX.Element => {
  const [known, setKnown] = useState<readonly string[]>([]);
  const [searched, setSearched] = useState('nothing yet');
  return (
    <section className='specimen' id='combobox'>
      <h2>{SPECIMEN_SECTIONS.combobox}</h2>
      <div className='row'>
        <Combobox
          label='Spell'
          items={SPECIMEN_SPELLS}
          placeholder='Choose a spell'
        />
        <Combobox
          label='Learn spell'
          items={SPECIMEN_SPELLS}
          placeholder='Add to the list'
          clearOnSelect
          onSelect={(spell) =>
            setKnown((list) =>
              list.includes(spell.label) ? list : [...list, spell.label],
            )
          }
        />
        <Combobox
          label='Search'
          items={SPECIMEN_SEARCH}
          placeholder='Search, Enter for all results'
          onSubmit={setSearched}
        />
        <output>Known: {known.join(', ') || 'none'}</output>
        <output>Searched: {searched}</output>
      </div>
    </section>
  );
};
