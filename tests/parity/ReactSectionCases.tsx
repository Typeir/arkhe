/**
 * @fileoverview React side of the section parity scenes: Collapsible,
 * Disclosure, Accordion, nested folder Tabs. Each must match its twin in
 * `SvelteSectionCases.svelte`.
 *
 * @module tests/parity/ReactSectionCases
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import type { ReactNode } from 'react';
import { Accordion, Button, Collapsible, Disclosure, Tabs } from '@arkhe/react';
import { SECTION_ITEMS, TAB_ITEMS, TAB_TEXT } from './scenes';

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
  'tabs-folder': () => (
    <Tabs
      look='folder'
      items={TAB_ITEMS}
      label='Outer'
      panels={(value) =>
        value === 'stats' ? (
          <Tabs
            look='folder'
            items={TAB_ITEMS}
            label='Inner'
            panels={TAB_TEXT}
          />
        ) : (
          TAB_TEXT[value]
        )
      }
    />
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
