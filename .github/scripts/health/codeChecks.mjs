/**
 * @fileoverview Health checks on what source text says: colour literals
 * outside the token file, app and game words in the packages, and
 * TypeScript access modifiers where a `#` private member belongs.
 *
 * @module .github/scripts/health/codeChecks
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import { AUTHORED, hits, SCRIPT, SOURCE } from './files.mjs';

/**
 * Game and app words that must not leak into the library packages.
 *
 * @constant BANNED_WORDS
 * @type {readonly string[]}
 */
export const BANNED_WORDS = [
  'ikuisuus',
  'flamelost',
  'bloodline',
  'homunculus',
  'spell',
  'encounter',
  'dither',
];

/**
 * The one stylesheet allowed to hold colour literals.
 *
 * @constant TOKENS_FILE
 * @type {string}
 */
const TOKENS_FILE = 'packages/core/styles/_tokens.scss';
/**
 * A hex colour, or a colour function not built from a variable.
 *
 * @constant COLOR
 * @type {RegExp}
 */
const COLOR =
  /(^|[^&\w{])#[0-9a-fA-F]{3,8}\b(?!\{)|\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\((?!\s*var\()/;
/**
 * A TypeScript `private` or `protected` modifier, on a member or a constructor parameter.
 *
 * @constant TS_ACCESS
 * @type {RegExp}
 */
const TS_ACCESS =
  /(^|[\s(,])(private|protected)\s+(?:(?:static|readonly|override|async)\s+)*[\w$#[]/;
/**
 * A `#` private member name and what introduces it; removed from script lines before the colour test.
 *
 * @constant PRIVATE_NAME
 * @type {RegExp}
 */
const PRIVATE_NAME = /(\.|\b(?:readonly|static)\s+|^\s+)#[\w$]+/g;

/**
 * Says whether `line` holds a colour literal. In scripts, `#` private
 * member names are not colours, even when spelled in hex letters.
 *
 * @function hasColour
 * @param {string} file - File path.
 * @param {string} line - Source line.
 * @returns {boolean} A colour literal is on the line.
 */
function hasColour(file, line) {
  return COLOR.test(SCRIPT.test(file) ? line.replace(PRIVATE_NAME, '') : line);
}

/**
 * Checks on source text, run with the other file checks.
 *
 * @constant CODE_CHECKS
 * @type {readonly import('./fileChecks.mjs').FileCheck[]}
 */
export const CODE_CHECKS = [
  {
    name: 'color-literals',
    applies: (file) =>
      AUTHORED.test(file) && !file.startsWith('tests/') && file !== TOKENS_FILE,
    scan: (file, content) =>
      hits(
        file,
        content,
        (line) => hasColour(file, line),
        `Colour literal: define a token in ${TOKENS_FILE}.`,
      ),
  },
  {
    name: 'banned-words',
    applies: (file) => file.startsWith('packages/') && AUTHORED.test(file),
    scan: (file, content) =>
      hits(
        file,
        content,
        (line) =>
          BANNED_WORDS.some((word) => new RegExp(`\\b${word}`, 'i').test(line)),
        'App or game word in a library package.',
        true,
      ),
  },
  {
    name: 'private-fields',
    applies: (file) => SOURCE.test(file) && /\.(ts|tsx|svelte)$/.test(file),
    scan: (file, content) =>
      hits(
        file,
        content,
        (line) => TS_ACCESS.test(line),
        'TypeScript private/protected: use a # private member.',
      ),
  },
];
