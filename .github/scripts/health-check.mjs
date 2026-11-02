/**
 * @fileoverview Health check runner: every file and project check, one line
 * per check, details for failures. Exits 1 on any failure.
 *
 * @module .github/scripts/health-check
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { FILE_CHECKS } from './health/fileChecks.mjs';
import { listFiles } from './health/files.mjs';
import { PROJECT_CHECKS } from './health/projectChecks.mjs';

/**
 * Result of one check.
 *
 * @typedef {{ name: string, scanned: number, failures: import('./health/fileChecks.mjs').Failure[] }} CheckResult
 */

/**
 * Runs every check over the repository at `root`.
 *
 * @function runHealthCheck
 * @param {string} root - Repository root.
 * @returns {CheckResult[]} Results in report order.
 */
export function runHealthCheck(root) {
  const files = listFiles(root);
  const cache = new Map();
  const read = (file) => {
    if (!cache.has(file))
      cache.set(file, readFileSync(join(root, file), 'utf8'));
    return cache.get(file);
  };
  const fileResults = FILE_CHECKS.map((check) => {
    const scoped = files.filter(check.applies);
    return {
      name: check.name,
      scanned: scoped.length,
      failures: scoped.flatMap((file) => check.scan(file, read(file))),
    };
  });
  const projectResults = PROJECT_CHECKS.map((check) => ({
    name: check.name,
    ...check.run(files, read),
  }));
  return [...fileResults, ...projectResults];
}

/**
 * Formats results for the terminal.
 *
 * @function formatResults
 * @param {CheckResult[]} results - Check results.
 * @returns {string} Report text.
 */
export function formatResults(results) {
  const lines = results.flatMap(({ name, scanned, failures }) => {
    if (!failures.length) return [`PASS ${name} (${scanned} files)`];
    return [
      `FAIL ${name}: ${failures.length}`,
      ...failures.map(
        (failure) =>
          `  ${failure.file}${failure.line ? `:${failure.line}` : ''} ${failure.message}`,
      ),
    ];
  });
  const failed = results.filter((result) => result.failures.length).length;
  lines.push(failed ? `${failed} check(s) failed.` : 'All checks passed.');
  return lines.join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const results = runHealthCheck(resolve(import.meta.dirname, '../..'));
  console.log(formatResults(results));
  process.exitCode = results.some((result) => result.failures.length) ? 1 : 0;
}
