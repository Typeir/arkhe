/**
 * @fileoverview Turns a DOM tree into comparable lines, removing what may
 * differ between ports without changing meaning: generated ids (element ids
 * and the instance ids Zag stamps into `data-ownedby` and `data-uid`),
 * attribute and class order, style formatting, text node splits, whitespace
 * that does not render, comments. Form controls compare by their live value,
 * checked and selected state, not the attributes that seed them.
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
const SPACE = '␠';
const INLINE_ELEMENTS = new Set([
  'a',
  'abbr',
  'b',
  'button',
  'code',
  'em',
  'i',
  'img',
  'input',
  'kbd',
  'label',
  'mark',
  's',
  'select',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'svg',
  'textarea',
  'time',
  'u',
]);

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
 * Live form state as `[property, value]` pairs: what the user sees, which
 * the matching attributes only seed.
 *
 * @function liveState
 * @param {Element} element - Element.
 * @returns {[string, string][]} Properties to compare.
 */
function liveState(element: Element): [string, string][] {
  if (element instanceof HTMLInputElement) {
    const toggle = element.type === 'checkbox' || element.type === 'radio';
    return [
      ['value', element.value],
      ...(toggle
        ? ([
            ['checked', String(element.checked)],
            ['indeterminate', String(element.indeterminate)],
          ] as [string, string][])
        : []),
    ];
  }
  if (
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    return [['value', element.value]];
  }
  if (element instanceof HTMLOptionElement) {
    return [['selected', String(element.selected)]];
  }
  return [];
}

/**
 * Says whether `node` is an element laid out inline, where the whitespace
 * next to it renders as a space.
 *
 * @function isInline
 * @param {Node | string | undefined} node - Neighbour.
 * @returns {boolean} True for an inline element.
 */
function isInline(node: Node | string | undefined): boolean {
  return node instanceof Element && INLINE_ELEMENTS.has(node.localName);
}

/**
 * Serialises the children of `parent`. Adjacent text nodes merge, so how a
 * port splits text does not matter. Whitespace runs collapse to one space;
 * a space next to an inline element is kept as `␠`, since it renders.
 *
 * @function childLines
 * @param {Node} parent - Parent node.
 * @param {Map<string, string>} ids - Canonical ids.
 * @param {string} indent - Indent of the children.
 * @returns {string[]} Lines.
 */
function childLines(
  parent: Node,
  ids: Map<string, string>,
  indent: string,
): string[] {
  const runs: (Element | string)[] = [];
  for (const child of parent.childNodes) {
    if (child instanceof Element) {
      runs.push(child);
    } else if (child.nodeType === Node.TEXT_NODE) {
      const last = runs.length - 1;
      const text = child.textContent ?? '';
      if (typeof runs[last] === 'string') runs[last] += text;
      else runs.push(text);
    }
  }
  return runs.flatMap((run, index) => {
    if (typeof run !== 'string') return lines(run, ids, indent);
    const text = run.replace(/\s+/g, ' ');
    const lead = text.startsWith(' ') && isInline(runs[index - 1]) ? SPACE : '';
    const trail = text.endsWith(' ') && isInline(runs[index + 1]) ? SPACE : '';
    const core = text.trim();
    if (!core) return [];
    return [`${indent}"${lead}${core}${trail}"`];
  });
}

/**
 * Serialises `element` and its subtree into indented lines.
 *
 * @function lines
 * @param {Element} element - Element.
 * @param {Map<string, string>} ids - Canonical ids.
 * @param {string} indent - Current indent.
 * @returns {string[]} Lines.
 */
function lines(
  element: Element,
  ids: Map<string, string>,
  indent: string,
): string[] {
  const live = liveState(element);
  const attributes = [...element.attributes]
    .filter((attribute) => !live.some(([name]) => name === attribute.name))
    .map((attribute) => `${attribute.name}="${attributeValue(attribute, ids)}"`)
    .concat(live.map(([name, value]) => `.${name}="${value}"`))
    .sort();
  const open = [element.localName, ...attributes].join(' ');
  return [`${indent}<${open}>`, ...childLines(element, ids, `${indent}  `)];
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
  return childLines(root, ids, '').filter(
    (line) => !tolerances.some(({ pattern }) => pattern.test(line)),
  );
}
