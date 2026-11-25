/**
 * @fileoverview HoverCard lookups shared by both ports' tests: the card by
 * its title, and whether it shows. A closed card goes back to sleep and
 * leaves the DOM, so "not shown" holds for a hidden card and a missing one.
 *
 * @module tests/fixtures/cards
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import { screen } from '@testing-library/dom';

/**
 * The open card's content element, found by its title.
 *
 * @function card
 * @param {string} title - Card title.
 * @returns {HTMLElement} Content element.
 */
export function card(title: string): HTMLElement {
  return screen
    .getAllByText(title, { selector: '[data-part="title"]' })[0]
    .closest('[data-part="content"]') as HTMLElement;
}

/**
 * Whether a card with this title is in the DOM and not hidden.
 *
 * @function shown
 * @param {string} title - Card title.
 * @returns {boolean} Shown.
 */
export function shown(title: string): boolean {
  const content = screen
    .queryAllByText(title, { selector: '[data-part="title"]' })
    .at(0)
    ?.closest('[data-part="content"]');
  return (
    content !== null &&
    content !== undefined &&
    content.closest('[hidden]') === null
  );
}
