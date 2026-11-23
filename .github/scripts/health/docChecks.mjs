/**
 * @fileoverview JSDoc health check (R7): every declaration carries a JSDoc
 * block, exported or not, so maintaining Arkhé is reading, not reverse
 * engineering. Covers top-level declarations of scripts and the members of
 * top-level classes; interface members are described by the interface's
 * `@property` tags, and locals inside functions and components are not
 * declarations of the module.
 *
 * @module .github/scripts/health/docChecks
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import { AUTHORED, SCRIPT, stripBlockComments, TEST } from './files.mjs';

/**
 * A top-level declaration: binding, function, class, interface, type, enum.
 *
 * @constant TOP_DECL
 * @type {RegExp}
 */
const TOP_DECL =
  /^(export\s+(default\s+)?)?(declare\s+)?(abstract\s+)?(async\s+)?(const|let|var|function\*?|class|interface|type|enum)\s+[A-Za-z_$]/;

/**
 * The opening line of a top-level class.
 *
 * @constant CLASS_OPEN
 * @type {RegExp}
 */
const CLASS_OPEN = /^(export\s+(default\s+)?)?(abstract\s+)?class\s/;

/**
 * A member declaration at the class body's indent: field, method, accessor
 * or constructor, private or not.
 *
 * @constant MEMBER_DECL
 * @type {RegExp}
 */
const MEMBER_DECL =
  /^ {2}(?:(?:static|readonly|async|get|set|override|declare|accessor)\s+)*(#?[A-Za-z_$][\w$]*)\s*(?:[(<:=;?!]|$)/;

/**
 * Says whether a JSDoc block, other than the file heading, ends right above
 * line `index`.
 *
 * @function docAbove
 * @param {string[]} lines - File lines.
 * @param {number} index - Declaration line.
 * @returns {boolean} True when documented.
 */
export function docAbove(lines, index) {
  let end = index - 1;
  while (end >= 0 && !lines[end].trim()) end -= 1;
  if (end < 0 || !lines[end].trim().endsWith('*/')) return false;
  let start = end;
  while (start > 0 && !lines[start].trim().startsWith('/**')) start -= 1;
  return !lines
    .slice(start, end + 1)
    .some((line) => line.includes('@fileoverview'));
}

/**
 * Finds declarations with no JSDoc block right above them.
 *
 * @function undocumentedDeclarations
 * @param {string} file - File path.
 * @param {string} content - Source text.
 * @returns {{ file: string, line: number, message: string }[]} One failure per bare declaration.
 */
export function undocumentedDeclarations(file, content) {
  const lines = content.split('\n');
  const code = stripBlockComments(content).split('\n');
  const failures = [];
  let inClass = false;
  for (const [index, line] of code.entries()) {
    if (inClass && line.startsWith('}')) inClass = false;
    const top = TOP_DECL.test(line);
    const member = inClass && MEMBER_DECL.test(line);
    if ((top || member) && !docAbove(lines, index)) {
      failures.push({
        file,
        line: index + 1,
        message: top
          ? 'Declaration without JSDoc.'
          : 'Class member without JSDoc.',
      });
    }
    if (CLASS_OPEN.test(line) && !line.trimEnd().endsWith('}')) inClass = true;
  }
  return failures;
}

/**
 * JSDoc checks, run with the other file checks.
 *
 * @constant DOC_CHECKS
 * @type {readonly import('./fileChecks.mjs').FileCheck[]}
 */
export const DOC_CHECKS = [
  {
    name: 'jsdoc-declarations',
    applies: (file) =>
      AUTHORED.test(file) && SCRIPT.test(file) && !TEST.test(file),
    scan: undocumentedDeclarations,
  },
];
