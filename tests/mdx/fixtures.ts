/**
 * @fileoverview MDX sources modelled on the app's content: a lineage page
 * with measures in prose, in a list and inside an MDX Tooltip trigger; a
 * creature sheet with keywords and the floating controls; and one dense
 * paragraph of a hundred measures and keywords.
 *
 * @module tests/mdx/fixtures
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

/**
 * Lineage page: Units in prose and inside a Tooltip trigger.
 *
 * @constant LINEAGE_MDX
 * @type {string}
 */
export const LINEAGE_MDX = `# Empyrean

They see in the dark to [= 6 stride =] and walk [= 5 stride =] a turn.

- Standard vision
- <Tooltip><span>Tremorsense [= 6 stride =]</span><span>Only while in contact with the same solid surface as the target.</span></Tooltip>

Age: <Tooltip><span>Centuries (Foulblood ~100 yr)</span><span>They do not visibly age the way *Edaphites* do; most live around 100 years.</span></Tooltip>.

A creature that is [# kw:condition:Charmed #] or [# kw:condition:Frightened #] cannot [# kw:dash #] while within [= 1/2 league =] of the source.
`;

/**
 * Creature sheet: keywords in a trait, then Popover, Menu and Combobox.
 *
 * @constant SHEET_MDX
 * @type {string}
 */
export const SHEET_MDX = `## Traits

**More Than One Ring.** The hoarder casts at [= 12 stride =] and ignores [# kw:damage bonus;damage bonuses #].

It wears <Popover trigger="Rings" title="Ring list">Only the rings it carries.</Popover> on every finger.

<Popover trigger="Hoard">Coins and relics.</Popover>

<Menu trigger="Actions" items={[{ value: 'rename', label: 'Rename' }, { separator: true }, { value: 'drop', label: 'Drop', danger: true }]} />

<Combobox label="Ring" items={[{ value: 'ward', label: 'Ward' }, { value: 'blink', label: 'Blink' }]} />
`;

/**
 * Triggers in the dense paragraph.
 *
 * @constant DENSE_TRIGGERS
 * @type {number}
 */
export const DENSE_TRIGGERS = 100;

/**
 * One paragraph of fifty measures and fifty keywords.
 *
 * @constant DENSE_MDX
 * @type {string}
 */
export const DENSE_MDX = `${Array.from(
  { length: DENSE_TRIGGERS / 2 },
  (_, index) => `reach [= ${index + 1} stride =] then [# kw:term ${index} #]`,
).join(', ')}.
`;
