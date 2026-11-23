/**
 * @fileoverview React specimen section for sections that open: a
 * collapsible with a heading and a lock that disables its controls, one
 * nested in another, a lazy one hiding a phrase find-in-page can reach, one
 * that grows while open, two disclosures in a single-open group, and
 * accordions.
 *
 * @module apps/showcase/src/react/CollapseSection
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import {
  Accordion,
  Button,
  Checkbox,
  Collapsible,
  Disclosure,
} from '@arkhe/react';
import { useState, type JSX } from 'react';
import {
  SPECIMEN_ACCORDION,
  SPECIMEN_ACCORDION_TEXT,
  SPECIMEN_SECTIONS,
} from '../specimen';

/**
 * Renders the opening sections.
 *
 * @component
 * @returns {JSX.Element} Section.
 */
export const CollapseSection = (): JSX.Element => {
  const [lines, setLines] = useState(1);
  const [locked, setLocked] = useState(false);
  return (
    <section className='specimen' id='sections'>
      <h2>{SPECIMEN_SECTIONS.sections}</h2>
      <div className='stack'>
        <Collapsible
          title='Layer'
          heading={3}
          defaultOpen
          actions={
            <Button pressed={locked} onClick={() => setLocked(!locked)}>
              Lock
            </Button>
          }>
          <fieldset className='bare' disabled={locked}>
            <p>Halftone dots over the base image.</p>
            <Checkbox label='Dither' defaultChecked />
          </fieldset>
          <Collapsible title='Inner'>
            <p>Dots per inch, angle and ink.</p>
          </Collapsible>
        </Collapsible>
        <Collapsible title='Growing' defaultOpen>
          <Button onClick={() => setLines(lines + 1)}>Grow</Button>
          {Array.from({ length: lines }, (_, line) => (
            <p key={line}>Line {line + 1}</p>
          ))}
        </Collapsible>
        <Collapsible title='Hidden lore' lazy>
          <p>Silent bells over the marsh.</p>
        </Collapsible>
        <Collapsible title='Sealed lore'>
          <p>Lanterns under the ice.</p>
        </Collapsible>
      </div>
      <div className='stack'>
        <Disclosure summary='Palette in 3D' name='views' defaultOpen>
          <p>A cube of every colour.</p>
        </Disclosure>
        <Disclosure summary='LUT colours in 3D' name='views'>
          <p>A lattice of mapped colours.</p>
        </Disclosure>
      </div>
      <div className='stack'>
        <Accordion
          items={SPECIMEN_ACCORDION}
          panels={SPECIMEN_ACCORDION_TEXT}
          expandAll
        />
        <Accordion
          items={SPECIMEN_ACCORDION}
          panels={SPECIMEN_ACCORDION_TEXT}
          multiple={false}
          collapsible={false}
          heading={4}
          defaultValue={['senses']}
        />
      </div>
    </section>
  );
};
