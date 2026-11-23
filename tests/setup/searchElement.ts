/**
 * @fileoverview jsdom 30 does not know `<search>` and makes it an
 * `HTMLUnknownElement`, which React reports as an unrecognised tag.
 * Browsers have shipped it since 2023; here a created `search` element is
 * given `HTMLElement`'s prototype, as a browser would.
 *
 * @module tests/setup/searchElement
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

/**
 * The document's own `createElement`, wrapped to give `search` a prototype.
 *
 * @constant create
 * @type {Document["createElement"]}
 */
const create = Document.prototype.createElement;

Document.prototype.createElement = function createElement(
  this: Document,
  name: string,
  options?: ElementCreationOptions,
): HTMLElement {
  const element = create.call(this, name, options);
  if (
    name.toLowerCase() === 'search' &&
    element instanceof HTMLUnknownElement
  ) {
    Object.setPrototypeOf(element, HTMLElement.prototype);
  }
  return element;
} as typeof Document.prototype.createElement;
