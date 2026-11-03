/**
 * @fileoverview Reduced copies of the app's inline remark plugins: `[= … =]`
 * measures become `<Unit>` and `[# kw: … #]` keywords become `<Keyword>`,
 * both inline MDX JSX elements with string attributes, as the app emits
 * them. Every keyword resolves, to a route under `library/keywords/`.
 *
 * @module tests/mdx/remark
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

/**
 * The part of an mdast node the plugins read and write.
 *
 * @interface MdNode
 * @property {string} type - Node type.
 * @property {string} [value] - Text of a text node.
 * @property {MdNode[]} [children] - Child nodes.
 */
interface MdNode {
  type: string;
  value?: string;
  children?: MdNode[];
}

/**
 * Builds an inline JSX element node, or `null` to keep the match as text.
 *
 * @typedef {Function} BuildElement
 */
type BuildElement = (inner: string) => MdNode | null;

const UNIT = /\[=\s*(.*?)\s*=\]/g;
const KEYWORD = /\[#\s*(.*?)\s*#\]/g;
const QUANTITY = /^(\d+)(?:\s*\/\s*(\d+))?\s+(stride|league|burden|volume)$/;
const KEYWORD_INNER = /^kw:\s*(.+)$/;

/**
 * Builds an inline JSX element with string attributes.
 *
 * @function element
 * @param {string} name - Component name.
 * @param {Record<string, string | undefined>} attributes - Attributes; undefined ones are dropped.
 * @returns {MdNode} Element node.
 */
function element(
  name: string,
  attributes: Record<string, string | undefined>,
): MdNode {
  return {
    type: 'mdxJsxTextElement',
    name,
    attributes: Object.entries(attributes)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => ({ type: 'mdxJsxAttribute', name: key, value })),
    children: [],
  } as MdNode;
}

/**
 * Splits text nodes on `pattern` and swaps each match for `build`'s node.
 *
 * @function replaceInline
 * @param {MdNode} node - Subtree to rewrite in place.
 * @param {RegExp} pattern - Global pattern whose first group is the inner text.
 * @param {BuildElement} build - Builds the replacement.
 * @returns {void}
 */
function replaceInline(
  node: MdNode,
  pattern: RegExp,
  build: BuildElement,
): void {
  if (!node.children) return;
  node.children = node.children.flatMap((child) => {
    if (child.type !== 'text') {
      replaceInline(child, pattern, build);
      return [child];
    }
    const text = child.value ?? '';
    const parts: MdNode[] = [];
    let cursor = 0;
    for (const match of text.matchAll(pattern)) {
      const replacement = build(match[1] ?? '');
      if (!replacement) continue;
      if (match.index > cursor) {
        parts.push({ type: 'text', value: text.slice(cursor, match.index) });
      }
      parts.push(replacement);
      cursor = match.index + match[0].length;
    }
    if (cursor === 0) return [child];
    if (cursor < text.length) {
      parts.push({ type: 'text', value: text.slice(cursor) });
    }
    return parts;
  });
}

/**
 * Parses `6 stride` or `1/2 league` into Unit attributes.
 *
 * @function unitElement
 * @param {string} inner - Text between the brackets.
 * @returns {MdNode | null} `<Unit>` node, or null when malformed.
 */
function unitElement(inner: string): MdNode | null {
  const match = QUANTITY.exec(inner);
  if (!match) return null;
  return element('Unit', {
    value: match[1],
    denominator: match[2],
    unit: match[3],
  });
}

/**
 * Parses `kw:term`, `kw:namespace:term` or `kw:term;display` into Keyword
 * attributes.
 *
 * @function keywordElement
 * @param {string} inner - Text between the brackets.
 * @returns {MdNode | null} `<Keyword>` node, or null when malformed.
 */
function keywordElement(inner: string): MdNode | null {
  const match = KEYWORD_INNER.exec(inner.trim());
  if (!match?.[1]) return null;
  const [target = '', display] = match[1].split(';').map((part) => part.trim());
  const cut = target.indexOf(':');
  const namespace = cut === -1 ? undefined : target.slice(0, cut).trim();
  const shown = cut === -1 ? target : target.slice(cut + 1).trim();
  const term = shown.toLowerCase();
  if (!term) return null;
  return element('Keyword', {
    term,
    display: display || shown,
    namespace,
    href: `library/keywords/${term.replaceAll(' ', '-')}`,
  });
}

/**
 * Remark plugin: `[= … =]` to `<Unit>`.
 *
 * @function remarkUnit
 * @returns {(tree: MdNode) => void} Transformer.
 */
export function remarkUnit(): (tree: MdNode) => void {
  return (tree) => replaceInline(tree, UNIT, unitElement);
}

/**
 * Remark plugin: `[# kw: … #]` to `<Keyword>`.
 *
 * @function remarkKeyword
 * @returns {(tree: MdNode) => void} Transformer.
 */
export function remarkKeyword(): (tree: MdNode) => void {
  return (tree) => replaceInline(tree, KEYWORD, keywordElement);
}
