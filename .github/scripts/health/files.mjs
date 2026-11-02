/**
 * @fileoverview File discovery and scopes shared by the health checks.
 *
 * @module .github/scripts/health/files
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Library and app sources: everything shipped or shown.
 *
 * @constant SOURCE
 * @type {RegExp}
 */
export const SOURCE = /^(packages\/[^/]+\/src|apps\/showcase\/src)\//;

/**
 * Hand-written code the checks read: sources, styles, scripts, tests, configs.
 *
 * @constant AUTHORED
 * @type {RegExp}
 */
export const AUTHORED =
  /^((packages|apps|tests|\.github\/scripts)\/.*\.(ts|tsx|mjs|js|svelte|scss)|[^/]+\.config\.(ts|mjs|js))$/;

/**
 * Script-like files that carry a JSDoc heading block.
 *
 * @constant SCRIPT
 * @type {RegExp}
 */
export const SCRIPT = /\.(ts|tsx|mjs|js)$/;

/**
 * Test and browser-spec files, exempt from heading and export-doc rules.
 *
 * @constant TEST
 * @type {RegExp}
 */
export const TEST = /\.(test|spec)\.tsx?$/;

/**
 * Lists tracked and untracked, non-ignored files under `root`.
 *
 * @function listFiles
 * @param {string} root - Repository root.
 * @returns {string[]} Paths relative to `root`, forward slashes.
 */
export function listFiles(root) {
  const output = execFileSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    { cwd: root, encoding: 'utf8' },
  );
  return output
    .split('\0')
    .filter(Boolean)
    .filter((file) => existsSync(join(root, file)));
}

/**
 * Removes block comments, keeping line count.
 *
 * @function stripBlockComments
 * @param {string} content - Source text.
 * @returns {string} Text with comment bodies blanked.
 */
export function stripBlockComments(content) {
  const blank = (comment) => comment.replace(/[^\n]/g, ' ');
  return content
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank);
}

/**
 * Counts lines holding code: not blank, not comment.
 *
 * @function codeLines
 * @param {string} content - Source text.
 * @returns {number} Code line count.
 */
export function codeLines(content) {
  return stripBlockComments(content)
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('//')).length;
}
