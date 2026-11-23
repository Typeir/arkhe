/**
 * @fileoverview React side of the menu and select parity scenes: Menu with
 * a text or icon trigger, the plain Select with and without its empty
 * option, the searchable Select and Picker, long virtual lists. Each must
 * match its twin in
 * `SvelteCases.svelte`.
 *
 * @module tests/parity/ReactSelectCases
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

import type { ReactNode } from 'react';
import { Menu, Picker, Select, VirtualList } from '@arkhe/react';
import { COMBO_ITEMS, LONG_ITEMS, MENU_ITEMS } from './scenes';

/**
 * Menu and select scenes by name.
 *
 * @constant SELECT_SCENES
 * @type {Readonly<Record<string, () => ReactNode>>}
 */
export const SELECT_SCENES: Readonly<Record<string, () => ReactNode>> = {
  menu: () => (
    <Menu trigger='Actions' items={MENU_ITEMS} onSelect={() => undefined} />
  ),
  select: () => <Select label='Spell' items={COMBO_ITEMS} placeholder='Any' />,
  'select-empty': () => (
    <Select
      label='Spell'
      items={COMBO_ITEMS}
      emptyLabel='All'
      size='s'
      labelHidden
    />
  ),
  'menu-icon': () => (
    <Menu
      trigger='Actions'
      icon='plus'
      items={MENU_ITEMS}
      onSelect={() => undefined}
    />
  ),
  'select-searchable': () => (
    <Select label='Spell' items={COMBO_ITEMS} searchable />
  ),
  picker: () => (
    <Picker label='Spell' items={COMBO_ITEMS} onSelect={() => undefined} />
  ),
  'select-virtual': () => (
    <Select label='Rune' items={LONG_ITEMS} rowPitch={2} placeholder='Any' />
  ),
  'select-virtual-searchable': () => (
    <Select label='Rune' items={LONG_ITEMS} rowPitch={2} searchable />
  ),
  'virtual-list': () => (
    <VirtualList
      items={LONG_ITEMS}
      rowPitch={2}
      label='Runes'
      maxHeight='10rem'
      getKey={(item) => item.value}
      renderItem={(item, index) => `${index}: ${item.label}`}
    />
  ),
};
