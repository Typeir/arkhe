/**
 * @fileoverview Checks the MDX harness runs on rendered markup: interactive
 * elements nested in buttons or links, floating bodies that should not be
 * there yet, triggers, and markup weight. Plus a server-side render guard
 * that hides the DOM globals, as a server has none.
 *
 * @module tests/mdx/audit
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { vi } from 'vitest';

const INTERACTIVE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
const FLOATING = [
  '[data-part="positioner"]',
  '[data-part="content"]',
  '[role="tooltip"]',
  '[role="dialog"]',
  '[role="menu"]',
  '[role="listbox"]',
].join(', ');
const TRIGGER = '[data-part="trigger"]';

/**
 * Lists every interactive element inside a `<button>` or a link.
 *
 * @function nestingViolations
 * @param {ParentNode} root - Tree to scan.
 * @returns {string[]} One line per violation, e.g. `button > span[tabindex]`.
 */
export function nestingViolations(root: ParentNode): string[] {
  return [...root.querySelectorAll('button, a[href]')].flatMap((host) =>
    [...host.querySelectorAll(INTERACTIVE)].map(
      (inner) =>
        `${host.tagName.toLowerCase()} > ${inner.tagName.toLowerCase()} "${inner.textContent?.trim()}"`,
    ),
  );
}

/**
 * Lists ids that more than one element in the document carries, as when
 * server markup survives next to its client copy.
 *
 * @function duplicateIds
 * @returns {string[]} Repeated ids.
 */
export function duplicateIds(): string[] {
  const ids = [...document.querySelectorAll('[id]')].map((node) => node.id);
  return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
}

/**
 * Parses markup into a detached tree.
 *
 * @function parse
 * @param {string} html - Markup.
 * @returns {DocumentFragment} Parsed tree.
 */
export function parse(html: string): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content;
}

/**
 * Lists floating parts (positioners, contents, role-bearing panels) in
 * server markup.
 *
 * @function floatingParts
 * @param {string} html - Server markup.
 * @returns {string[]} `scope:part` or `role` per element found.
 */
export function floatingParts(html: string): string[] {
  return [...parse(html).querySelectorAll(FLOATING)].map(
    (node) =>
      `${node.getAttribute('data-scope') ?? ''}:${node.getAttribute('data-part') ?? node.getAttribute('role')}`,
  );
}

/**
 * Counts tooltip and hover-card triggers in markup.
 *
 * @function countTriggers
 * @param {string} html - Markup.
 * @returns {number} Trigger count.
 */
export function countTriggers(html: string): number {
  return parse(html).querySelectorAll(TRIGGER).length;
}

/**
 * UTF-8 size of markup.
 *
 * @function byteSize
 * @param {string} html - Markup.
 * @returns {number} Bytes.
 */
export function byteSize(html: string): number {
  return new TextEncoder().encode(html).length;
}

/**
 * Runs `render` with `window` and `document` gone, as on a server.
 *
 * @function onServer
 * @template T
 * @param {() => T} render - Server render.
 * @returns {T} Its result.
 */
export function onServer<T>(render: () => T): T {
  vi.stubGlobal('window', undefined);
  vi.stubGlobal('document', undefined);
  try {
    return render();
  } finally {
    vi.unstubAllGlobals();
  }
}
