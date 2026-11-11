/**
 * @fileoverview Gives jsdom a no-op `Element.prototype.scrollTo`. Zag's
 * select scrolls its list to the top on open; jsdom has no layout, so
 * nothing to scroll.
 *
 * @module tests/setup/scrollTo
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

Element.prototype.scrollTo ??= () => undefined;
