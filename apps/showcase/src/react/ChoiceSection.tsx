/**
 * @fileoverview React specimen section for choice controls: checkboxes as
 * pips and boxes in every size, a select-all box that reads mixed, one with a
 * hint; radio groups as segments and as pips in two sizes; toggle groups with
 * a limit and clear, and a vertical single-press one.
 *
 * @module apps/showcase/src/react/ChoiceSection
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import { Checkbox, RadioGroup, ToggleGroup } from '@arkhe/react';
import { useState, type JSX } from 'react';
import {
  SPECIMEN_ASPECTS,
  SPECIMEN_BOONS,
  SPECIMEN_SECTIONS,
  SPECIMEN_TOOLS,
  SPECIMEN_UNITS,
} from '../specimen';

const SIZES = ['s', 'm', 'l'] as const;

/**
 * Renders the choice controls.
 *
 * @component
 * @returns {JSX.Element} Section.
 */
export const ChoiceSection = (): JSX.Element => {
  const [picked, setPicked] = useState<readonly boolean[]>([true, false]);
  const [units, setUnits] = useState('metric');
  const [aspects, setAspects] = useState<readonly string[]>(['tide']);
  const all = picked.every(Boolean);
  const some = picked.some(Boolean);
  return (
    <section className='specimen' id='choices'>
      <h2>{SPECIMEN_SECTIONS.choices}</h2>
      <div className='row'>
        {SIZES.map((size) => (
          <Checkbox key={`pip-${size}`} label={`Pip ${size}`} size={size} />
        ))}
        {SIZES.map((size) => (
          <Checkbox
            key={`box-${size}`}
            label={`Box ${size}`}
            look='box'
            size={size}
            defaultChecked
          />
        ))}
      </div>
      <div className='row'>
        <Checkbox
          label='All spells'
          look='box'
          checked={all}
          indeterminate={some && !all}
          onCheckedChange={(next) => setPicked(picked.map(() => next))}
        />
        {['Frost', 'Ember'].map((label, index) => (
          <Checkbox
            key={label}
            label={label}
            look='box'
            checked={picked[index] ?? false}
            onCheckedChange={(next) =>
              setPicked(picked.map((on, at) => (at === index ? next : on)))
            }
          />
        ))}
        <Checkbox label='Oath sworn' required hint='Needed before the rite.' />
        <Checkbox label='Disabled' disabled defaultChecked />
      </div>
      <div className='row'>
        <RadioGroup
          label='Units'
          items={SPECIMEN_UNITS}
          look='segmented'
          value={units}
          onValueChange={setUnits}
        />
        <RadioGroup
          label='Boon'
          items={SPECIMEN_BOONS}
          size='l'
          defaultValue='grace'
          hint='One per level.'
        />
        <RadioGroup
          label='Focus'
          items={SPECIMEN_BOONS}
          size='s'
          orientation='vertical'
          required
        />
        <p>Units: {units}</p>
      </div>
      <div className='row'>
        <ToggleGroup
          label='Aspects'
          items={SPECIMEN_ASPECTS}
          multiple
          clearable
          limit={4}
          value={aspects}
          onValueChange={setAspects}
        />
        <ToggleGroup
          label='Tools'
          items={SPECIMEN_TOOLS}
          orientation='vertical'
          deselectable
          defaultValue={['move']}
        />
        <p>Aspects: {aspects.join(', ') || 'none'}</p>
      </div>
    </section>
  );
};
