/**
 * @fileoverview Splits one package out of the monorepo for consumers.
 * `split/<name>` is the package's own history from `git subtree split`;
 * `release/<name>` is that history plus one commit holding its built
 * `dist`, so a repo installed from it needs no build tools. Build first
 * with `npm run build`. Usage: `node .github/scripts/split-package.mjs core`.
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
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO_ROOT = resolve(import.meta.dirname, '../..');

/**
 * Packages that split.
 *
 * @constant PACKAGES
 * @type {readonly string[]}
 */
export const PACKAGES = ['core', 'react', 'svelte'];

/**
 * GitHub owner of the split repos, each named `arkhe-<name>`.
 *
 * @constant OWNER
 * @type {string}
 */
export const OWNER = 'typeir';

/**
 * Points a port manifest's `@arkhe/core` at the core release repo's tag for
 * that version, so the port resolves core through git.
 *
 * @function pinCore
 * @param {Record<string, any>} pkg - Port `package.json` contents.
 * @param {string} version - Core version, tagged `v<version>`.
 * @returns {Record<string, any>} The manifest, changed in place.
 */
export function pinCore(pkg, version) {
  if (pkg.dependencies?.['@arkhe/core'] === undefined) return pkg;
  pkg.dependencies['@arkhe/core'] = `github:${OWNER}/arkhe-core#v${version}`;
  return pkg;
}

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
    const manifest = join(tree, 'package.json');
    const core = join(REPO_ROOT, 'packages', 'core', 'package.json');
    const pkg = pinCore(
      JSON.parse(readFileSync(manifest, 'utf8')),
      JSON.parse(readFileSync(core, 'utf8')).version,
    );
    writeFileSync(manifest, `${JSON.stringify(pkg, null, 2)}\n`);
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
