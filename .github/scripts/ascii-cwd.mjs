/**
 * @fileoverview Runs a command from an ASCII-only path. `svelte-package`
 * exits silently with code 127 when its working directory contains a
 * non-ASCII character, such as the `é` in `Arkhé`. Where the path has one,
 * this links the repo root into a fresh private temp directory, runs from
 * the link, and removes it afterwards.
 *
 * @module .github/scripts/ascii-cwd
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { spawnSync } from 'node:child_process';
import {
  lstatSync,
  mkdtempSync,
  realpathSync,
  rmdirSync,
  symlinkSync,
  unlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO_ROOT = resolve(import.meta.dirname, '../..');

/**
 * True when every character of `path` is ASCII.
 *
 * @function isAscii
 * @param {string} path - Path.
 * @returns {boolean} ASCII only.
 */
export function isAscii(path) {
  return [...path].every((char) => char.charCodeAt(0) < 128);
}

/**
 * Calls `run` with an ASCII path to `dir`: `dir` itself, or the same folder
 * reached through a junction to the repo root. The junction lives in a new
 * directory only this process created, is checked to resolve to the repo
 * before use, and is removed once `run` returns or throws.
 *
 * @function withAsciiPath
 * @template T
 * @param {string} dir - Directory inside the repo.
 * @param {(path: string) => T} run - Receives the ASCII path.
 * @returns {T} What `run` returns.
 * @throws {Error} When the junction does not resolve to the repo root.
 */
export function withAsciiPath(dir, run) {
  if (isAscii(dir)) return run(dir);
  const holder = mkdtempSync(join(tmpdir(), 'arkhe-ascii-'));
  const link = join(holder, 'repo');
  try {
    symlinkSync(REPO_ROOT, link, 'junction');
    if (realpathSync(link) !== realpathSync(REPO_ROOT)) {
      throw new Error(`${link} does not resolve to ${REPO_ROOT}.`);
    }
    return run(join(link, relative(REPO_ROOT, dir)));
  } finally {
    if (lstatSync(link, { throwIfNoEntry: false })) unlinkSync(link);
    rmdirSync(holder);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [command, ...args] = process.argv.slice(2);
  const result = withAsciiPath(process.cwd(), (cwd) =>
    spawnSync(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    }),
  );
  process.exit(result.status ?? 1);
}
