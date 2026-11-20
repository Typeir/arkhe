/**
 * @fileoverview React side of the section parity scenes: Collapsible,
 * Disclosure, Accordion. Each must match its twin in
 * `SvelteSectionCases.svelte`.
 *
 * @module tests/parity/ReactSectionCases
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import { Accordion, Button, Collapsible, Disclosure } from '@arkhe/react';
import type { ReactNode } from 'react';
import { SECTION_ITEMS } from './scenes';

/**
 * Section scenes by name.
 *
 * @constant SECTION_SCENES
 * @type {Readonly<Record<string, () => ReactNode>>}
 */
export const SECTION_SCENES: Readonly<Record<string, () => ReactNode>> = {
  collapsible: () => (
    <>
      <Collapsible title='Lore'>Old roads.</Collapsible>
      <Collapsible
        title='Layer'
        heading={3}
        defaultOpen
        actions={<Button>Lock</Button>}>
        Body
      </Collapsible>
      <Collapsible title='Hidden' lazy>
        Late
      </Collapsible>
    </>
  ),
  disclosure: () => (
    <>
      <Disclosure summary='Palette' name='views' defaultOpen>
        Cube
      </Disclosure>
      <Disclosure summary='LUT' name='views'>
        Grid
      </Disclosure>
    </>
  ),
  accordion: () => (
    <Accordion
      items={SECTION_ITEMS}
      panels={(value) => `panel ${value}`}
      expandAll
      defaultValue={['senses']}
    />
  ),
};
