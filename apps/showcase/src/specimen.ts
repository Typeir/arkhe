/**
 * @fileoverview Specimen data every target renders, so the React, Svelte and
 * static pages show the same components with the same values.
 *
 * @module apps/showcase/src/specimen
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import {
  ARKHE_ICON_NAMES,
  type ComboboxOption,
  type MenuEntry,
  type TabItem,
} from '@arkhe/core';

/**
 * Chips shown in the removable list, in order.
 *
 * @constant SPECIMEN_CHIPS
 * @type {readonly string[]}
 */
export const SPECIMEN_CHIPS = [
  'resistance',
  'reactive',
  'charge',
  'temp-hp',
] as const;

/**
 * Chip tones, one sample each.
 *
 * @constant SPECIMEN_TONES
 * @type {readonly string[]}
 */
export const SPECIMEN_TONES = [
  'neutral',
  'accent',
  'emphasis',
  'warning',
  'danger',
] as const;

/**
 * Icons in the icon grid: Arkhé's own, plus one name no set provides.
 *
 * @constant SPECIMEN_ICONS
 * @type {readonly string[]}
 */
export const SPECIMEN_ICONS: readonly string[] = [
  ...ARKHE_ICON_NAMES,
  'not-an-icon',
];

/**
 * Progress sample: starting value, maximum and markers.
 *
 * @constant SPECIMEN_PROGRESS
 * @type {{ readonly start: number; readonly max: number; readonly markers: readonly number[] }}
 */
export const SPECIMEN_PROGRESS = {
  start: 6,
  max: 10,
  markers: [2, 5, 8],
} as const;

/**
 * Section ids and titles, in page order.
 *
 * @constant SPECIMEN_SECTIONS
 * @type {Readonly<Record<string, string>>}
 */
export const SPECIMEN_SECTIONS = {
  buttons: 'Buttons',
  fields: 'Fields',
  numeric: 'Number fields',
  chips: 'Chips',
  icons: 'Icons',
  progress: 'Progress',
  skeleton: 'Skeleton',
  status: 'Status',
  tabs: 'Tabs',
  modal: 'Modal',
  floating: 'Floating',
  combobox: 'Combobox',
} as const;

/**
 * Spells offered by the specimen comboboxes.
 *
 * @constant SPECIMEN_SPELLS
 * @type {readonly ComboboxOption[]}
 */
export const SPECIMEN_SPELLS: readonly ComboboxOption[] = [
  { value: 'fireball', label: 'Fireball', description: 'Level 3 · evocation' },
  {
    value: 'frost-ray',
    label: 'Frost ray',
    description: 'Level 1 · evocation',
  },
  { value: 'ward', label: 'Ward', description: 'Level 2 · abjuration' },
  { value: 'paa', label: 'Pään suoja', description: 'Level 1 · abjuration' },
  {
    value: 'sealed',
    label: 'Sealed rite',
    description: 'Locked',
    disabled: true,
  },
];

/**
 * Grouped search results for the specimen search box.
 *
 * @constant SPECIMEN_SEARCH
 * @type {readonly ComboboxOption[]}
 */
export const SPECIMEN_SEARCH: readonly ComboboxOption[] = [
  ...SPECIMEN_SPELLS.slice(0, 3).map((spell) => ({
    ...spell,
    group: 'Spells',
  })),
  {
    value: 'goblin',
    label: 'Goblin',
    description: 'Creature',
    group: 'Creatures',
  },
  {
    value: 'wyrm',
    label: 'Ash wyrm',
    description: 'Creature',
    group: 'Creatures',
  },
];

/**
 * Menu actions shown in the specimen.
 *
 * @constant SPECIMEN_MENU
 * @type {readonly MenuEntry[]}
 */
export const SPECIMEN_MENU: readonly MenuEntry[] = [
  { value: 'rename', label: 'Rename', icon: 'check' },
  { value: 'duplicate', label: 'Duplicate', icon: 'plus' },
  { value: 'archive', label: 'Archive', disabled: true },
  { separator: true },
  { value: 'delete', label: 'Delete', icon: 'x', danger: true },
];

/**
 * Pretends to fetch a card body, to show a hover card loading.
 *
 * @function loadSpecimenCard
 * @returns {Promise<string>} Card text, after a short wait.
 */
export function loadSpecimenCard(): Promise<string> {
  return new Promise((resolve) =>
    setTimeout(
      () => resolve('Fire fills a sphere; everything in it burns.'),
      700,
    ),
  );
}

/**
 * Tabs shown in the specimen; one is disabled.
 *
 * @constant SPECIMEN_TABS
 * @type {readonly TabItem[]}
 */
export const SPECIMEN_TABS: readonly TabItem[] = [
  { value: 'stats', label: 'Stats' },
  { value: 'gear', label: 'Gear', disabled: true },
  { value: 'notes', label: 'Notes' },
];

/**
 * Panel text per tab value.
 *
 * @constant SPECIMEN_TAB_TEXT
 * @type {Readonly<Record<string, string>>}
 */
export const SPECIMEN_TAB_TEXT: Readonly<Record<string, string>> = {
  stats: 'Strength 3 · Agility 2 · Wits 4',
  gear: 'Nothing carried.',
  notes: 'Met the ferryman at dusk.',
};

/**
 * Keeps a number inside [0, 10]; null passes through.
 *
 * @function clampTen
 * @param {number | null} value - Field value.
 * @returns {number | null} Clamped value.
 */
export function clampTen(value: number | null): number | null {
  return value === null ? null : Math.min(Math.max(value, 0), 10);
}

/**
 * Returns the character readout of the name field.
 *
 * @function nameReadout
 * @param {string} name - Current name.
 * @returns {string} Readout, e.g. `7 / 24`.
 */
export function nameReadout(name: string): string {
  return `${name.length} / 24`;
}
