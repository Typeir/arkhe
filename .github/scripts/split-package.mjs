/**
 * @fileoverview Splits one package out of the monorepo for consumers.
 * `split/<name>` is the package's own history from `git subtree split`;
 * `release/<name>` is that history plus one commit holding its built
 * `dist`, so a repo installed from it needs no build tools. A port's
 * release also carries core (`vendor-core.mjs`), so it installs alone.
 * Build first with `npm run build`. Usage:
 * `node .github/scripts/split-package.mjs core`.
 *
 * @module .github/scripts/split-package
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { vendorCore } from './vendor-core.mjs';

const REPO_ROOT = resolve(import.meta.dirname, '../..');

/**
 * Packages that split.
 *
 * @constant PACKAGES
 * @type {readonly string[]}
 */
export const PACKAGES = ['core', 'react', 'svelte'];

/**
 * Names the split and release branches of a package.
 *
 * @function branches
 * @param {string} name - Package folder under `packages/`.
 * @returns {{ split: string, release: string }} Branch names.
 */
export function branches(name) {
  return { split: `split/${name}`, release: `release/${name}` };
}

/**
 * Copies a directory tree file by file. Node 22's native `cpSync` exits the
 * process with code 127, without an error, when a path has a non-ASCII
 * character such as the `é` in `Arkhé`.
 *
 * @function copyTree
 * @param {string} from - Source directory.
 * @param {string} to - Target directory; created when missing.
 * @returns {void}
 */
export function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const source = join(from, entry.name);
    const target = join(to, entry.name);
    if (entry.isDirectory()) copyTree(source, target);
    else copyFileSync(source, target);
  }
}

/**
 * Runs git in the repo root and returns its trimmed output.
 *
 * @function git
 * @param {string[]} args - Git arguments.
 * @param {string} [cwd] - Working directory. Defaults to the repo root.
 * @returns {string} Output.
 */
export function git(args, cwd = REPO_ROOT) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

/**
 * Updates `split/<name>` and `release/<name>` from the current HEAD.
 *
 * @function splitPackage
 * @param {string} name - Package folder under `packages/`.
 * @param {(args: string[], cwd?: string) => string} [run] - Git runner.
 * @returns {{ split: string, release: string }} Commit of each branch.
 */
export function splitPackage(name, run = git) {
  if (!PACKAGES.includes(name)) {
    throw new Error(
      `Unknown package "${name}"; one of ${PACKAGES.join(', ')}.`,
    );
  }
  const dist = join(REPO_ROOT, 'packages', name, 'dist');
  if (!existsSync(dist)) {
    throw new Error(`packages/${name}/dist is missing; run npm run build.`);
  }
  const head = run(['rev-parse', '--short', 'HEAD']);
  const names = branches(name);
  const split = run(['subtree', 'split', `--prefix=packages/${name}`]);
  run(['branch', '-f', names.split, split]);
  const holder = mkdtempSync(join(tmpdir(), 'arkhe-split-'));
  const tree = join(holder, name);
  try {
    run(['worktree', 'add', '--detach', tree, split]);
    copyTree(dist, join(tree, 'dist'));
    if (name !== 'core') vendorCore(tree, join(REPO_ROOT, 'packages', 'core'));
    run(['add', '--force', 'dist', 'package.json'], tree);
    run(
      ['commit', '--quiet', '-m', `[build]: ${name} dist from ${head}`],
      tree,
    );
    run(['branch', '-f', names.release, run(['rev-parse', 'HEAD'], tree)]);
    return { split, release: run(['rev-parse', names.release]) };
  } finally {
    run(['worktree', 'remove', '--force', tree]);
    rmSync(holder, { recursive: true, force: true });
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const name = process.argv[2] ?? '';
  const out = splitPackage(name);
  process.stdout.write(
    `${branches(name).split} ${out.split}\n${branches(name).release} ${out.release}\n`,
  );
}
