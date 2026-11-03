/**
 * @fileoverview Publishes every package to its read-only mirror. Builds,
 * splits each package (core first, since the ports pin core's tag), then
 * pushes `split/<name>` to `main` (fast-forward only, so a commit made on a
 * mirror stops the push), `release/<name>` to `release` (forced: it is
 * rebuilt on every split), and the `v<version>` tag when the mirror lacks
 * it. A published tag never moves; bump the version to release again.
 * Usage: `node .github/scripts/publish.mjs`.
 *
 * @module .github/scripts/publish
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  OWNER,
  PACKAGES,
  branches,
  git,
  splitPackage,
} from './split-package.mjs';

const REPO_ROOT = resolve(import.meta.dirname, '../..');

/**
 * URL of a package's mirror.
 *
 * @function mirror
 * @param {string} name - Package folder under `packages/`.
 * @returns {string} HTTPS clone URL.
 */
export function mirror(name) {
  return `https://github.com/${OWNER}/arkhe-${name}.git`;
}

/**
 * Builds the `git push` arguments for one package.
 *
 * @function pushArgs
 * @param {string} name - Package folder under `packages/`.
 * @param {string} version - Package version.
 * @param {boolean} tagged - True when the mirror already has `v<version>`.
 * @returns {string[]} Arguments after `git`.
 */
export function pushArgs(name, version, tagged) {
  const { split, release } = branches(name);
  const refs = [`${split}:refs/heads/main`, `+${release}:refs/heads/release`];
  if (!tagged) refs.push(`${release}:refs/tags/v${version}`);
  return ['push', '--quiet', mirror(name), ...refs];
}

/**
 * Builds, splits and pushes every package.
 *
 * @function publish
 * @param {(args: string[], cwd?: string) => string} [run] - Git runner.
 * @param {() => void} [build] - Builds every package.
 * @returns {string[]} One line per package: name, version, tag state.
 */
export function publish(
  run = git,
  build = () =>
    execFileSync('npm', ['run', 'build'], {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    }),
) {
  build();
  return PACKAGES.map((name) => {
    const manifest = join(REPO_ROOT, 'packages', name, 'package.json');
    const { version } = JSON.parse(readFileSync(manifest, 'utf8'));
    splitPackage(name, run);
    const tagged =
      run(['ls-remote', '--tags', mirror(name), `v${version}`]) !== '';
    run(pushArgs(name, version, tagged));
    return `${name} ${version} ${tagged ? 'tag kept' : 'tagged'}`;
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.stdout.write(`${publish().join('\n')}\n`);
}
