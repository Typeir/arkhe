/**
 * @fileoverview Health checks for the shape of Arkhé's sources (P79): part
 * attributes through `partAttrs()`, `@module` tags that name their file,
 * `'use client'` on every React module, one phrasing for documented
 * defaults, and readonly arrays out of core.
 *
 * @module .github/scripts/health/apiChecks
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import { AUTHORED, hits, SCRIPT, SOURCE, TEST } from './files.mjs';

/**
 * A part attribute written by hand in markup or a props object.
 *
 * @constant RAW_PART
 * @type {RegExp}
 */
const RAW_PART = /(^|[\s{,])['"]?data-scope['"]?\s*[=:]/;

/**
 * A documented default phrased "X by default".
 *
 * @constant BY_DEFAULT
 * @type {RegExp}
 */
const BY_DEFAULT = /^\s*\*.*\bby default\b/i;

/**
 * A core signature returning a mutable array: `): T[] {`.
 *
 * @constant MUTABLE_RETURN
 * @type {RegExp}
 */
const MUTABLE_RETURN = /\)\s*:(?!\s*readonly\b)\s*[\w$<>, |.]*\[\]\s*\{\s*$/;

/**
 * The `@module` path a file should carry: its path without the extension.
 *
 * @function modulePath
 * @param {string} file - File path.
 * @returns {string} Expected module path.
 */
export function modulePath(file) {
  return file.replace(/\.(ts|tsx|mjs|js)$/, '');
}

/**
 * Finds a `@module` tag that does not name its own file.
 *
 * @function moduleTagFailures
 * @param {string} file - File path.
 * @param {string} content - Source text.
 * @returns {{ file: string, line: number, message: string }[]} At most one failure.
 */
function moduleTagFailures(file, content) {
  const match = /^ \* @module (\S+)/m.exec(content);
  if (!match || match[1] === modulePath(file)) return [];
  const line = content.slice(0, match.index).split('\n').length;
  return [
    {
      file,
      line,
      message: `@module ${match[1]} should be ${modulePath(file)}.`,
    },
  ];
}

/**
 * Shape checks, run with the other file checks.
 *
 * @constant API_CHECKS
 * @type {readonly import('./fileChecks.mjs').FileCheck[]}
 */
export const API_CHECKS = [
  {
    name: 'part-attrs',
    applies: (file) =>
      /^packages\/(react|svelte)\/src\//.test(file) &&
      /\.(tsx|svelte)$/.test(file),
    scan: (file, content) =>
      hits(
        file,
        content,
        (line) => RAW_PART.test(line),
        'Part attributes by hand: use partAttrs().',
      ),
  },
  {
    name: 'module-tag',
    applies: (file) =>
      AUTHORED.test(file) && SCRIPT.test(file) && !TEST.test(file),
    scan: moduleTagFailures,
  },
  {
    name: 'use-client',
    applies: (file) =>
      /^packages\/react\/src\/.*\.(ts|tsx)$/.test(file) &&
      file !== 'packages/react/src/index.ts',
    scan: (file, content) =>
      /^'use client';$/m.test(content)
        ? []
        : [{ file, line: 1, message: "React module without 'use client'." }],
  },
  {
    name: 'jsdoc-defaults',
    applies: (file) => SOURCE.test(file) && /\.(ts|tsx|svelte)$/.test(file),
    scan: (file, content) =>
      hits(
        file,
        content,
        (line) => BY_DEFAULT.test(line),
        'Phrase defaults as "Defaults to X."',
        true,
      ),
  },
  {
    name: 'readonly-returns',
    applies: (file) => /^packages\/core\/src\/.*\.ts$/.test(file),
    scan: (file, content) =>
      hits(
        file,
        content,
        (line) => MUTABLE_RETURN.test(line),
        'Return readonly T[] from core.',
      ),
  },
];
