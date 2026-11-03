/**
 * @fileoverview Data both ports' wrappers share: measure renderings and a
 * keyword body store that records each load, so a test can tell a lazy
 * body from an eager one.
 *
 * @module tests/mdx/data
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

const METRES: Readonly<Record<string, number>> = {
  stride: 1.5,
  league: 4800,
  burden: 20,
  volume: 2,
};

/**
 * A measure as the reader sees it, and its other renderings.
 *
 * @interface Measure
 * @property {string} label - Native text, e.g. `6 strides`.
 * @property {readonly string[]} renderings - Native, metric and imperial text.
 */
export interface Measure {
  readonly label: string;
  readonly renderings: readonly string[];
}

/**
 * Renders a quantity of a unit.
 *
 * @function measure
 * @param {string} value - Whole quantity, or numerator.
 * @param {string} unit - Unit name.
 * @param {string} [denominator] - Denominator of a fraction.
 * @returns {Measure} Label and renderings.
 */
export function measure(
  value: string,
  unit: string,
  denominator?: string,
): Measure {
  const amount = Number(value) / Number(denominator ?? 1);
  const quantity = denominator ? `${value}/${denominator}` : value;
  const label = `${quantity} ${unit}${amount === 1 ? '' : 's'}`;
  const metres = amount * (METRES[unit] ?? 1);
  return {
    label,
    renderings: [label, `${metres} m`, `${Math.round(metres * 3.28)} ft`],
  };
}

/**
 * Every keyword body requested so far, in order.
 *
 * @constant SHARD_LOADS
 * @type {string[]}
 */
export const SHARD_LOADS: string[] = [];

/**
 * Fetches a keyword's body, as the app fetches a shard.
 *
 * @function loadShard
 * @param {string} term - Keyword.
 * @returns {Promise<string>} Body text.
 */
export async function loadShard(term: string): Promise<string> {
  SHARD_LOADS.push(term);
  await new Promise((resolve) => setTimeout(resolve, 5));
  return `${term} is defined here.`;
}
