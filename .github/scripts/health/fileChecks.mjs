/**
 * @fileoverview Per-file health checks. Each check names the files it reads
 * and returns failures for one file's text.
 *
 * @module .github/scripts/health/fileChecks
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { builtinModules } from 'node:module';
import { API_CHECKS } from './apiChecks.mjs';
import { CODE_CHECKS } from './codeChecks.mjs';
import { DOC_CHECKS } from './docChecks.mjs';
import {
  AUTHORED,
  codeLines,
  comments,
  hits,
  SOURCE,
  stripBlockComments,
  TEST,
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
 * Comments the no-inline-comments rule allows: JSDoc blocks, the Svelte
 * component doc, and directives that tools need.
 *
 * @constant ALLOWED_COMMENTS
 * @type {readonly RegExp[]}
 */
export const ALLOWED_COMMENTS = [
  /^\/\*\*\s/,
  /^\/\/\s*(eslint|@ts-|prettier-ignore|@vitest-)/,
  /^\/\*\s*(eslint|prettier-ignore|global\s)/,
  /^<!--\s*(@component\b|svelte-ignore\b|prettier-ignore\b)/,
];

/**
 * Code lines every file must stay under.
 *
 * @constant MAX_CODE_LINES
 * @type {number}
 */
const MAX_CODE_LINES = 250;
/**
 * Modules core must not load: frameworks, their Zag adapters, icon sets,
 * Node. Each also bans its subpaths.
 *
 * @constant CORE_BANNED_MODULES
 * @type {readonly string[]}
 */
export const CORE_BANNED_MODULES = [
  'react',
  'react-dom',
  'svelte',
  'lucide-react',
  'lucide-svelte',
  '@lucide',
  '@zag-js/react',
  '@zag-js/svelte',
  ...builtinModules.filter((name) => !name.startsWith('_')),
];

/**
 * A call to a blocking browser dialog.
 *
 * @constant DIALOG
 * @type {RegExp}
 */
const DIALOG = /\b(alert|confirm|prompt)\s*\(/;
/**
 * A module specifier in any import form: static, side-effect, re-export, dynamic, `require`.
 *
 * @constant MODULE_SPECIFIER
 * @type {RegExp}
 */
const MODULE_SPECIFIER =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)(['"])([^'"\n]+)\1/g;
/**
 * A top-level binding whose initialiser opens an arrow or a function expression.
 *
 * @constant ARROW_START
 * @type {RegExp}
 */
const ARROW_START =
  /^(export\s+)?(const|let|var)\s+[a-z_$][\w$]*\s*(:[^=]+(=>[^=]+)*)?=\s*(async\s+)?(<[^>]*>\s*)?(\(|[\w$]+\s*=>|function\b)/;
/**
 * A function declaration named like a component.
 *
 * @constant FUNCTION_COMPONENT
 * @type {RegExp}
 */
const FUNCTION_COMPONENT = /^(export\s+(default\s+)?)?function\s+[A-Z]/;
/**
 * A function declaration nested inside another block.
 *
 * @constant NESTED_FUNCTION
 * @type {RegExp}
 */
const NESTED_FUNCTION = /^\s+(async\s+)?function\s*\*?\s*\w+\s*\(/;

/**
 * Says whether `specifier` names a module core must not load.
 *
 * @function isCoreBanned
 * @param {string} specifier - Module specifier.
 * @returns {boolean} True for a banned module or one of its subpaths.
 */
export function isCoreBanned(specifier) {
  const name = specifier.replace(/^node:/, '');
  return (
    specifier.startsWith('node:') ||
    CORE_BANNED_MODULES.some(
      (banned) => name === banned || name.startsWith(`${banned}/`),
    )
  );
}

/**
 * Finds imports of banned modules in any form: static, side-effect,
 * re-export, dynamic, `require`, across line breaks.
 *
 * @function coreImportFailures
 * @param {string} file - File path.
 * @param {string} content - Source text.
 * @returns {Failure[]} One failure per banned import.
 */
function coreImportFailures(file, content) {
  const text = stripBlockComments(content);
  return [...text.matchAll(MODULE_SPECIFIER)]
    .filter((match) => isCoreBanned(match[2]))
    .map((match) => ({
      file,
      line: text.slice(0, match.index).split('\n').length,
      message: `Core imports a framework or Node module: ${match[2]}.`,
    }));
}

/**
 * Finds comments other than JSDoc, the component doc and tool directives.
 *
 * @function inlineCommentFailures
 * @param {string} file - File path.
 * @param {string} content - Source text.
 * @returns {Failure[]} One failure per comment.
 */
function inlineCommentFailures(file, content) {
  return comments(content)
    .filter(
      (comment) => !ALLOWED_COMMENTS.some((rule) => rule.test(comment.text)),
    )
    .map((comment) => ({
      file,
      line: comment.line,
      message: 'Inline comment: move the reason into JSDoc or a named helper.',
    }));
}

/**
 * Says whether the top-level statement whose initialiser starts at `index`
 * is an arrow function.
 *
 * @function isArrowAt
 * @param {string[]} lines - File lines.
 * @param {number} index - Statement start line.
 * @param {number} column - Initialiser start on that line.
 * @returns {boolean} True when `=>` comes before the statement ends.
 */
function isArrowAt(lines, index, column) {
  const text = [
    lines[index].slice(column),
    ...lines.slice(index + 1, index + 12),
  ].join('\n');
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
    const arrow = svelte ? null : ARROW_START.exec(line);
    const opener = arrow?.[7];
    if (
      arrow &&
      (opener !== '(' ||
        isArrowAt(lines, index, arrow[0].length - opener.length))
    ) {
      return [
        { ...at, message: 'Top-level helper: use a function declaration.' },
      ];
    }
    if (file.endsWith('.tsx') && FUNCTION_COMPONENT.test(line)) {
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
  ...DOC_CHECKS,
  {
    name: 'no-inline-comments',
    applies: (file) => AUTHORED.test(file),
    scan: inlineCommentFailures,
  },
  {
    name: 'no-browser-dialogs',
    applies: (file) => SOURCE.test(file),
    scan: (file, content) =>
      hits(file, content, (line) => DIALOG.test(line), 'Browser dialog call.'),
  },
  ...CODE_CHECKS,
  ...API_CHECKS,
  {
    name: 'core-purity',
    applies: (file) => file.startsWith('packages/core/src/'),
    scan: coreImportFailures,
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
