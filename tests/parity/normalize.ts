/**
 * @fileoverview Turns a DOM tree into comparable lines, removing what may
 * differ between ports without changing meaning: generated ids (element ids
 * and the instance ids Zag stamps into `data-ownedby` and `data-uid`),
 * attribute and class order, style formatting, whitespace, comments. Form
 * controls compare by their live value, not the `value` attribute.
 *
 * @module tests/parity/normalize
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

/**
 * A difference both ports may show, with the reason it is acceptable.
 *
 * @interface Tolerance
 * @property {RegExp} pattern - Matches normalised lines to drop.
 * @property {string} reason - Why the difference does not matter.
 */
export interface Tolerance {
  readonly pattern: RegExp;
  readonly reason: string;
}

const INSTANCE_ID_ATTRIBUTES = ['data-ownedby', 'data-uid'];

/**
 * Maps every id in `root` to `id-1`, `id-2`… in document order.
 *
 * @function canonicalIds
 * @param {Element} root - Tree to scan.
 * @returns {Map<string, string>} Original id to canonical id.
 */
function canonicalIds(root: Element): Map<string, string> {
  const ids = new Map<string, string>();
  const add = (id: string | null) => {
    if (id && !ids.has(id)) ids.set(id, `id-${ids.size + 1}`);
  };
  for (const element of root.querySelectorAll('*')) {
    add(element.getAttribute('id'));
    for (const name of INSTANCE_ID_ATTRIBUTES) add(element.getAttribute(name));
  }
  return ids;
}

/**
 * Normalises one attribute value: id references, class order, style order.
 *
 * @function attributeValue
 * @param {Attr} attribute - Attribute.
 * @param {Map<string, string>} ids - Canonical ids.
 * @returns {string} Normalised value.
 */
function attributeValue(attribute: Attr, ids: Map<string, string>): string {
  if (attribute.name === 'style') {
    return attribute.value
      .split(';')
      .map((rule) => rule.trim().replace(/\s*:\s*/, ': '))
      .filter(Boolean)
      .sort()
      .join('; ');
  }
  const tokens = attribute.value.split(/\s+/).filter(Boolean);
  const mapped = tokens.map((token) => ids.get(token) ?? token);
  return attribute.name === 'class'
    ? mapped.sort().join(' ')
    : mapped.join(' ');
}

/**
 * Serialises `node` and its subtree into indented lines.
 *
 * @function lines
 * @param {Node} node - Node.
 * @param {Map<string, string>} ids - Canonical ids.
 * @param {string} indent - Current indent.
 * @returns {string[]} Lines.
 */
function lines(node: Node, ids: Map<string, string>, indent: string): string[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
    return text ? [`${indent}"${text}"`] : [];
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return [];
  const element = node as Element;
  const live =
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
      ? [`.value="${element.value}"`]
      : [];
  const attributes = [...element.attributes]
    .filter((attribute) => !(live.length && attribute.name === 'value'))
    .map((attribute) => `${attribute.name}="${attributeValue(attribute, ids)}"`)
    .concat(live)
    .sort();
  const open = [element.localName, ...attributes].join(' ');
  return [
    `${indent}<${open}>`,
    ...[...element.childNodes].flatMap((child) =>
      lines(child, ids, `${indent}  `),
    ),
  ];
}

/**
 * Normalises the tree under `root` into lines, minus tolerated ones.
 *
 * @function normalizeDom
 * @param {Element} root - Tree to normalise.
 * @param {readonly Tolerance[]} [tolerances] - Accepted differences.
 * @returns {string[]} Comparable lines.
 */
export function normalizeDom(
  root: Element,
  tolerances: readonly Tolerance[] = [],
): string[] {
  const ids = canonicalIds(root);
  return [...root.childNodes]
    .flatMap((child) => lines(child, ids, ''))
    .filter((line) => !tolerances.some(({ pattern }) => pattern.test(line)));
}
