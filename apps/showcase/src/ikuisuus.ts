/**
 * @fileoverview Data for the Ikuisuus keyword clone: the two condition cards
 * its `Burning` keyword reaches, Ikuisuus's own strings and timings, and its
 * width rule. Shard sources are copied verbatim, since the width rule reads
 * their length.
 *
 * @module apps/showcase/src/ikuisuus
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

/**
 * Shard prose length at which Ikuisuus lays a card out wide.
 *
 * @constant IKUISUUS_WIDE_CHARS
 * @type {number}
 */
export const IKUISUUS_WIDE_CHARS = 668;

/**
 * Ikuisuus keyword timing: open after 200ms, close 300ms after leaving.
 *
 * @constant IKUISUUS_DELAYS
 * @type {{ readonly open: number; readonly close: number }}
 */
export const IKUISUUS_DELAYS = { open: 200, close: 300 } as const;

/**
 * Ikuisuus's `keywords` strings.
 *
 * @constant IKUISUUS_STRINGS
 * @type {{ readonly openRule: string }}
 */
export const IKUISUUS_STRINGS = {
  openRule: 'Open the full rule for {term}',
} as const;

/**
 * One keyword: its card title, rule anchor and shard source.
 *
 * @interface IkuisuusKeyword
 * @property {string} display - Text as the author wrote it.
 * @property {string} title - Card title, the defining heading.
 * @property {string} href - Rule address.
 * @property {string} source - Shard prose, verbatim.
 */
export interface IkuisuusKeyword {
  readonly display: string;
  readonly title: string;
  readonly href: string;
  readonly source: string;
}

/**
 * Keywords the clone shows, by term.
 *
 * @constant IKUISUUS_KEYWORDS
 * @type {Readonly<Record<'burning' | 'prone', IkuisuusKeyword>>}
 */
export const IKUISUUS_KEYWORDS = {
  burning: {
    display: 'Burning',
    title: 'Burning',
    href: '#ikuisuus',
    source: [
      'Sufferers are on fire and take ongoing heat damage.',
      '',
      '- At the start of each of their turns, sufferers take **[% 1d10 fire %].**',
      '- Sufferers can use a **Major Action** to **extinguish the flames** by dropping prone, rolling, or smothering themselves.',
      '  - Doing so **automatically ends the [# kw:condition:burning #]**, and they end their turn **[# kw:condition:prone #].**',
      '- Another creature within [= 1 stride =] may also use a **Major Action** to extinguish the flames.',
      '- While burning, sufferers shed **bright light in a [= 2 stride;ADJ =] radius** and **dim light for another [= 2 stride =].**',
    ].join('\n'),
  },
  prone: {
    display: 'prone',
    title: 'Prone',
    href: '#ikuisuus',
    source: [
      '- Sufferers’ only movement option is to **crawl**, unless they **stand up** and end the condition.',
      '- They have **disadvantage on attack rolls**.',
      '- **Attack rolls** against them have **advantage** if the attacker is within [= 1 stride =]; otherwise, those rolls have **disadvantage**.',
    ].join('\n'),
  },
} as const satisfies Readonly<Record<string, IkuisuusKeyword>>;

/**
 * A term the clone shows.
 *
 * @typedef {keyof typeof IKUISUUS_KEYWORDS} IkuisuusTerm
 */
export type IkuisuusTerm = keyof typeof IKUISUUS_KEYWORDS;

/**
 * Card width for a shard, by Ikuisuus's rule: wide from `IKUISUUS_WIDE_CHARS`.
 *
 * @function ikuisuusWidth
 * @param {string} source - Shard prose.
 * @returns {'narrow' | 'wide'} Card width.
 */
export function ikuisuusWidth(source: string): 'narrow' | 'wide' {
  return source.length >= IKUISUUS_WIDE_CHARS ? 'wide' : 'narrow';
}

/**
 * Fills `{term}` in one of Ikuisuus's strings.
 *
 * @function ikuisuusString
 * @param {keyof typeof IKUISUUS_STRINGS} key - String.
 * @param {string} term - Card title.
 * @returns {string} Text.
 */
export function ikuisuusString(
  key: keyof typeof IKUISUUS_STRINGS,
  term: string,
): string {
  return IKUISUUS_STRINGS[key].replace('{term}', term);
}
