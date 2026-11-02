/**
 * @fileoverview Per-file health checks. Each check names the files it reads
 * and returns failures for one file's text.
 *
 * @module .github/scripts/health/fileChecks
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import {
  AUTHORED,
  SCRIPT,
  SOURCE,
  TEST,
  codeLines,
  stripBlockComments,
} from './files.mjs';

/**
 * One problem in one file.
 *
 * @typedef {{ file: string, line?: number, message: string }} Failure
 */

/**
 * A check over single files.
 *
 * @typedef {{ name: string, applies: (file: string) => boolean, scan: (file: string, content: string) => Failure[] }} FileCheck
 */

/**
 * Heading tags every script-like file opens with.
 *
 * @constant HEADING_TAGS
 * @type {readonly string[]}
 */
export const HEADING_TAGS = [
  '@fileoverview',
  '@module',
  '@version',
  '@author',
  '@since',
];

/**
 * Line comments that tools need and the no-inline-comments rule allows.
 *
 * @constant ALLOWED_LINE_COMMENTS
 * @type {readonly RegExp[]}
 */
export const ALLOWED_LINE_COMMENTS = [
  /^\/\/\s*eslint/,
  /^\/\/\s*@ts-/,
  /^\/\/\s*prettier-ignore/,
  /^\/\/\s*@vitest-/,
];

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

const MAX_CODE_LINES = 250;
const TOKENS_FILE = 'packages/core/styles/_tokens.scss';
const COLOR =
  /(^|[^&\w{])#[0-9a-fA-F]{3,8}\b(?!\{)|\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\((?!\s*var\()/;
const DIALOG = /\b(alert|confirm|prompt)\s*\(/;
const CORE_IMPORT =
  /from\s+['"](react|react-dom|svelte|lucide-react|@lucide\/[^'"]+|node:[^'"]+)['"]/;
const EXPORT_DECL =
  /^export\s+(default\s+)?(async\s+)?(const|let|function|interface|type|class|enum)\s+[A-Za-z_$]/;
const ARROW_START = /^(export\s+)?const\s+[a-z]\w*\s*=\s*(async\s+)?\(/;
const NESTED_FUNCTION = /^\s+(async\s+)?function\s*\*?\s*\w+\s*\(/;

/**
 * Lines of `content` matching `test`, outside block comments.
 *
 * @function hits
 * @param {string} file - File path.
 * @param {string} content - Source text.
 * @param {(line: string) => boolean} test - Line predicate.
 * @param {string} message - Failure message.
 * @returns {Failure[]} One failure per matching line.
 */
function hits(file, content, test, message) {
  return stripBlockComments(content)
    .split('\n')
    .flatMap((line, index) =>
      test(line) ? [{ file, line: index + 1, message }] : [],
    );
}

/**
 * Says whether a top-level `const name = (` statement is an arrow function.
 *
 * @function isArrowAt
 * @param {string[]} lines - File lines.
 * @param {number} index - Statement start.
 * @returns {boolean} True when `=>` comes before the statement ends.
 */
function isArrowAt(lines, index) {
  const text = lines.slice(index, index + 12).join('\n');
  const arrow = text.indexOf('=>');
  const end = text.search(/;\s*$/m);
  return arrow >= 0 && (end < 0 || arrow < end);
}

/**
 * Checks the heading of one file by kind.
 *
 * @function headingFailures
 * @param {string} file - File path.
 * @param {string} content - Source text.
 * @returns {Failure[]} Missing heading parts.
 */
function headingFailures(file, content) {
  const body = content.replace(/^#!.*\n/, '').trimStart();
  if (file.endsWith('.svelte')) {
    return /^<!--\s*@component\b/.test(body)
      ? []
      : [{ file, line: 1, message: 'Missing <!-- @component --> doc.' }];
  }
  if (!body.startsWith('/**')) {
    return [{ file, line: 1, message: 'Missing file heading block.' }];
  }
  const heading = body.slice(0, body.indexOf('*/'));
  const wanted = file.endsWith('.scss') ? ['@fileoverview'] : HEADING_TAGS;
  const missing = wanted.filter((tag) => !heading.includes(tag));
  return missing.length
    ? [
        {
          file,
          line: 1,
          message: `Missing heading tags: ${missing.join(', ')}`,
        },
      ]
    : [];
}

/**
 * Says whether a JSDoc block, other than the file heading, ends right above
 * line `index`.
 *
 * @function docAbove
 * @param {string[]} lines - File lines.
 * @param {number} index - Declaration line.
 * @returns {boolean} True when documented.
 */
function docAbove(lines, index) {
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
 * Finds exported declarations with no JSDoc block right above them.
 *
 * @function undocumentedExports
 * @param {string} file - File path.
 * @param {string} content - Source text.
 * @returns {Failure[]} One failure per bare export.
 */
function undocumentedExports(file, content) {
  const lines = content.split('\n');
  return lines.flatMap((line, index) => {
    if (!EXPORT_DECL.test(line)) return [];
    return docAbove(lines, index)
      ? []
      : [
          {
            file,
            line: index + 1,
            message: `Export lacks JSDoc: ${line.trim()}`,
          },
        ];
  });
}

/**
 * Finds function-style breaks: top-level arrows, function components,
 * nested function declarations.
 *
 * @function functionStyleFailures
 * @param {string} file - File path.
 * @param {string} content - Source text.
 * @returns {Failure[]} One failure per break.
 */
function functionStyleFailures(file, content) {
  const lines = stripBlockComments(content).split('\n');
  const svelte = file.endsWith('.svelte');
  return lines.flatMap((line, index) => {
    const at = { file, line: index + 1 };
    if (!svelte && ARROW_START.test(line) && isArrowAt(lines, index)) {
      return [
        { ...at, message: 'Top-level helper: use a function declaration.' },
      ];
    }
    if (file.endsWith('.tsx') && /^export\s+function\s+[A-Z]/.test(line)) {
      return [{ ...at, message: 'Component: declare as const.' }];
    }
    if (NESTED_FUNCTION.test(line)) {
      return [{ ...at, message: 'Local function: use a const arrow.' }];
    }
    return [];
  });
}

/**
 * Every per-file check, in report order.
 *
 * @constant FILE_CHECKS
 * @type {readonly FileCheck[]}
 */
export const FILE_CHECKS = [
  {
    name: 'file-length',
    applies: (file) => AUTHORED.test(file),
    scan: (file, content) => {
      const count = codeLines(content);
      return count < MAX_CODE_LINES
        ? []
        : [{ file, message: `${count} code lines; limit ${MAX_CODE_LINES}.` }];
    },
  },
  {
    name: 'jsdoc-heading',
    applies: (file) =>
      AUTHORED.test(file) && !TEST.test(file) && !file.endsWith('.d.ts'),
    scan: headingFailures,
  },
  {
    name: 'jsdoc-exports',
    applies: (file) =>
      AUTHORED.test(file) && SCRIPT.test(file) && !TEST.test(file),
    scan: undocumentedExports,
  },
  {
    name: 'no-inline-comments',
    applies: (file) => AUTHORED.test(file),
    scan: (file, content) =>
      hits(
        file,
        content,
        (line) =>
          line.trim().startsWith('//') &&
          !ALLOWED_LINE_COMMENTS.some((rule) => rule.test(line.trim())),
        'Inline comment: move the reason into JSDoc or a named helper.',
      ),
  },
  {
    name: 'no-browser-dialogs',
    applies: (file) => SOURCE.test(file),
    scan: (file, content) =>
      hits(file, content, (line) => DIALOG.test(line), 'Browser dialog call.'),
  },
  {
    name: 'color-literals',
    applies: (file) =>
      AUTHORED.test(file) && !file.startsWith('tests/') && file !== TOKENS_FILE,
    scan: (file, content) =>
      hits(
        file,
        content,
        (line) => COLOR.test(line),
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
      ),
  },
  {
    name: 'core-purity',
    applies: (file) => file.startsWith('packages/core/src/'),
    scan: (file, content) =>
      hits(
        file,
        content,
        (line) => CORE_IMPORT.test(line),
        'Core imports a framework or Node module.',
      ),
  },
  {
    name: 'function-style',
    applies: (file) =>
      (SOURCE.test(file) ||
        file.startsWith('.github/scripts/') ||
        file.startsWith('tests/fixtures/')) &&
      /\.(ts|tsx|mjs|svelte)$/.test(file),
    scan: functionStyleFailures,
  },
];
