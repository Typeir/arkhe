/**
 * @fileoverview Data both parity scene files share.
 *
 * @module tests/parity/scenes
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import type { ComboboxOption, MenuEntry, TabItem } from '@arkhe/core';

/**
 * Tabs for the tabs scene.
 *
 * @constant TAB_ITEMS
 * @type {readonly TabItem[]}
 */
export const TAB_ITEMS: readonly TabItem[] = [
  { value: 'stats', label: 'Stats' },
  { value: 'gear', label: 'Gear', disabled: true },
  { value: 'notes', label: 'Notes' },
];

/**
 * Panel text per tab.
 *
 * @constant TAB_TEXT
 * @type {Readonly<Record<string, string>>}
 */
export const TAB_TEXT: Readonly<Record<string, string>> = {
  stats: 'Strength 3',
  gear: 'Nothing.',
  notes: 'Met the ferryman.',
};

/**
 * Actions for the menu scene.
 *
 * @constant MENU_ITEMS
 * @type {readonly MenuEntry[]}
 */
export const MENU_ITEMS: readonly MenuEntry[] = [
  { value: 'rename', label: 'Rename', icon: 'check' },
  { value: 'locked', label: 'Locked', disabled: true },
  { separator: true },
  { value: 'delete', label: 'Delete', danger: true },
];

/**
 * Options for the combobox scene, in two groups.
 *
 * @constant COMBO_ITEMS
 * @type {readonly ComboboxOption[]}
 */
export const COMBO_ITEMS: readonly ComboboxOption[] = [
  {
    value: 'fireball',
    label: 'Fireball',
    description: 'Level 3',
    group: 'Spells',
  },
  { value: 'frost', label: 'Frost ray', group: 'Spells' },
  { value: 'goblin', label: 'Goblin', group: 'Creatures', disabled: true },
];

/**
 * Tabs whose values repeat, for the duplicates scene.
 *
 * @constant TWIN_TABS
 * @type {readonly TabItem[]}
 */
export const TWIN_TABS: readonly TabItem[] = [
  { value: 'stats', label: 'Stats' },
  { value: 'stats', label: 'Stats again' },
  { value: 'notes', label: 'Notes' },
];

/**
 * Options whose values repeat, for the duplicates scene.
 *
 * @constant TWIN_OPTIONS
 * @type {readonly ComboboxOption[]}
 */
export const TWIN_OPTIONS: readonly ComboboxOption[] = [
  { value: 'frost', label: 'Frost ray' },
  { value: 'frost', label: 'Frost ray again' },
  { value: 'fireball', label: 'Fireball' },
];
