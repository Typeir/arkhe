/**
 * @fileoverview Whole-repository health checks: mirrored tests, exact
 * dependency pins, and matching React and Svelte exports.
 *
 * @module .github/scripts/health/projectChecks
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { SOURCE } from './files.mjs';

/**
 * One problem in one file.
 *
 * @typedef {{ file: string, line?: number, message: string }} Failure
 */

/**
 * A check over the whole file list.
 *
 * @typedef {{ name: string, run: (files: string[], read: (file: string) => string) => { failures: Failure[], scanned: number } }} ProjectCheck
 */

/**
 * Sources that need no mirrored test: barrels, entries, declarations.
 *
 * @constant TEST_EXEMPT
 * @type {readonly RegExp[]}
 */
export const TEST_EXEMPT = [
  /(^|\/)index\.ts$/,
  /(^|\/)main\.tsx?$/,
  /\.d\.ts$/,
  /\.scss$/,
];

const EXACT_VERSION = /^\d+\.\d+\.\d+(-[\w.]+)?$/;
const CARET_VERSION = /^\^\d+\.\d+\.\d+(-[\w.]+)?$/;
const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];
const DECLARED_EXPORT =
  /^export\s+(?:default\s+)?(?:async\s+)?(?:const(?!\s+enum\b)|let|var|function\*?|class|enum)\s+([\w$]+)/gm;
const REACT_INDEX = 'packages/react/src/index.ts';
const SVELTE_INDEX = 'packages/svelte/src/index.ts';

/**
 * Lists the mirrored test paths that would cover `source`.
 *
 * @function expectedTests
 * @param {string} source - Source path.
 * @returns {string[]} Candidate test paths.
 */
export function expectedTests(source) {
  const stem = source.replace(/\.(ts|tsx|svelte)$/, '');
  return [`tests/${stem}.test.ts`, `tests/${stem}.test.tsx`];
}

/**
 * Collects value export names from a barrel: `export { … }` lists,
 * declarations and `export * as name`. Type-only exports are skipped.
 *
 * @function valueExports
 * @param {string} content - Barrel source.
 * @returns {string[]} Sorted export names.
 */
export function valueExports(content) {
  const names = [];
  for (const match of content.matchAll(DECLARED_EXPORT)) names.push(match[1]);
  for (const match of content.matchAll(/export\s*\*\s*as\s+([\w$]+)/g)) {
    names.push(match[1]);
  }
  for (const match of content.matchAll(/export\s+(type\s+)?\{([^}]*)\}/g)) {
    if (match[1]) continue;
    for (const raw of match[2].split(',')) {
      const entry = raw.trim();
      if (!entry || entry.startsWith('type ')) continue;
      names.push(
        entry
          .split(/\s+as\s+/)
          .pop()
          .trim(),
      );
    }
  }
  return names.sort();
}

/**
 * Lists the specifiers of `export * from` lines, whose names a barrel
 * scan cannot see. Type-only star exports are skipped.
 *
 * @function starExports
 * @param {string} content - Barrel source.
 * @returns {string[]} Re-exported module specifiers.
 */
export function starExports(content) {
  return [...content.matchAll(/export\s*\*\s*from\s*['"]([^'"]+)['"]/g)].map(
    (match) => match[1],
  );
}

/**
 * Collects version ranges in npm `overrides`, yarn `resolutions` and
 * `pnpm.overrides`, walking nested override objects. A `$name` reference to
 * a direct dependency is a pin by proxy and is skipped.
 *
 * @function overrideRanges
 * @param {Record<string, unknown>} manifest - Parsed package.json.
 * @returns {{ path: string, version: string }[]} Ranges that are not exact.
 */
export function overrideRanges(manifest) {
  const walk = (value, path) =>
    typeof value === 'string'
      ? EXACT_VERSION.test(value) || value.startsWith('$')
        ? []
        : [{ path, version: value }]
      : Object.entries(value ?? {}).flatMap(([key, inner]) =>
          walk(inner, `${path}.${key}`),
        );
  return [
    ...walk(manifest.overrides, 'overrides'),
    ...walk(manifest.resolutions, 'resolutions'),
    ...walk(manifest.pnpm?.overrides, 'pnpm.overrides'),
  ];
}

/**
 * Every whole-repository check, in report order.
 *
 * @constant PROJECT_CHECKS
 * @type {readonly ProjectCheck[]}
 */
export const PROJECT_CHECKS = [
  {
    name: 'test-gaps',
    run: (files) => {
      const present = new Set(files);
      const sources = files.filter(
        (file) =>
          SOURCE.test(file) &&
          /\.(ts|tsx|svelte)$/.test(file) &&
          !TEST_EXEMPT.some((rule) => rule.test(file)),
      );
      const failures = sources
        .filter(
          (file) => !expectedTests(file).some((test) => present.has(test)),
        )
        .map((file) => ({
          file,
          message: `No test at ${expectedTests(file)[0]}(x).`,
        }));
      return { failures, scanned: sources.length };
    },
  },
  {
    name: 'exact-pins',
    run: (files, read) => {
      const manifests = files.filter((file) =>
        /(^|\/)package\.json$/.test(file),
      );
      const failures = manifests.flatMap((file) => {
        const manifest = JSON.parse(read(file));
        const overrides = overrideRanges(manifest).map(({ path, version }) => ({
          file,
          message: `${path} is "${version}"; pin an exact version.`,
        }));
        return DEPENDENCY_FIELDS.flatMap((field) => {
          const peer = field === 'peerDependencies';
          const shape = peer ? CARET_VERSION : EXACT_VERSION;
          const want = peer ? 'use a caret range' : 'pin an exact version';
          return Object.entries(manifest[field] ?? {})
            .filter(([, version]) => !shape.test(version))
            .map(([name, version]) => ({
              file,
              message: `${field}.${name} is "${version}"; ${want}.`,
            }));
        }).concat(overrides);
      });
      return { failures, scanned: manifests.length };
    },
  },
  {
    name: 'export-parity',
    run: (files, read) => {
      if (!files.includes(REACT_INDEX) || !files.includes(SVELTE_INDEX)) {
        return { failures: [], scanned: 0 };
      }
      const react = valueExports(read(REACT_INDEX));
      const svelte = valueExports(read(SVELTE_INDEX));
      const missing = (from, other, file) =>
        from
          .filter((name) => !other.includes(name))
          .map((name) => ({
            file,
            message: `Exports ${name}; the other port does not.`,
          }));
      const stars = (file) =>
        starExports(read(file)).map((specifier) => ({
          file,
          message: `export * from '${specifier}' hides its names; list them.`,
        }));
      return {
        failures: [
          ...stars(REACT_INDEX),
          ...stars(SVELTE_INDEX),
          ...missing(react, svelte, REACT_INDEX),
          ...missing(svelte, react, SVELTE_INDEX),
        ],
        scanned: 2,
      };
    },
  },
];
