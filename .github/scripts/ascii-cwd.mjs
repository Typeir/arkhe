/**
 * @fileoverview Runs a command from an ASCII-only path. `svelte-package`
 * exits silently with code 127 when its working directory contains a
 * non-ASCII character, such as the `é` in `Arkhé`. Where the path has one,
 * this links the repo root into the temp directory and runs from the link.
 *
 * @module .github/scripts/ascii-cwd
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

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
 * Returns an ASCII path to `dir`: `dir` itself, or the same folder reached
 * through a junction to the repo root in the temp directory. The junction
 * is named after a hash of the root, so a moved repo gets a fresh one.
 *
 * @function asciiPath
 * @param {string} dir - Directory inside the repo.
 * @returns {string} ASCII path to the same directory.
 */
export function asciiPath(dir) {
  if (isAscii(dir)) return dir;
  const links = join(tmpdir(), 'arkhe-ascii');
  const hash = createHash('sha1').update(REPO_ROOT).digest('hex').slice(0, 10);
  const link = join(links, `repo-${hash}`);
  mkdirSync(links, { recursive: true });
  if (!existsSync(link)) symlinkSync(REPO_ROOT, link, 'junction');
  return join(link, relative(REPO_ROOT, dir));
}

const [command, ...args] = process.argv.slice(2);
if (command) {
  const result = spawnSync(command, args, {
    cwd: asciiPath(process.cwd()),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  process.exit(result.status ?? 1);
}
