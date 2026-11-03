/**
 * @fileoverview Makes a port's release tree self-contained. It copies core's
 * built `dist` and SCSS sources into the port's `dist/core`, rewrites every
 * `@arkhe/core` import to a relative path, drops the dependency, and exports
 * the stylesheet as `<port>/arkhe.css`. A site that uses both ports gets two
 * copies of core; such a site can depend on the split repos through git.
 *
 * @module .github/scripts/vendor-core
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, relative, sep } from 'node:path';
import { copyTree } from './split-package.mjs';

const IMPORT = /(['"])@arkhe\/core(\/fx)?\1/g;
const REWRITTEN = /\.(js|ts|svelte)$/;

/**
 * Rewrites `@arkhe/core` and `@arkhe/core/fx` specifiers in one file to
 * relative paths into the vendored copy.
 *
 * @function rewriteCoreImports
 * @param {string} source - File contents.
 * @param {string} fileDir - Directory of the file.
 * @param {string} coreDir - Directory of the vendored core `dist`.
 * @returns {string} Rewritten contents.
 */
export function rewriteCoreImports(source, fileDir, coreDir) {
  return source.replace(IMPORT, (_, quote, fx) => {
    const target = join(coreDir, fx ? 'fx' : '', 'index.js');
    const path = relative(fileDir, target).split(sep).join(posix.sep);
    return `${quote}${path.startsWith('.') ? path : `./${path}`}${quote}`;
  });
}

/**
 * Lists every file under `dir`, skipping `skip`.
 *
 * @function files
 * @param {string} dir - Directory to walk.
 * @param {string} skip - Directory left out, with everything below it.
 * @returns {string[]} File paths.
 */
function files(dir, skip) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (path === skip) return [];
    return entry.isDirectory() ? files(path, skip) : [path];
  });
}

/**
 * Vendors core into a port's release tree and rewrites its manifest.
 *
 * @function vendorCore
 * @param {string} tree - Root of the port's release tree, with `dist` copied in.
 * @param {string} core - Root of `packages/core`, built.
 * @returns {number} Files whose imports were rewritten.
 */
export function vendorCore(tree, core) {
  const coreDir = join(tree, 'dist', 'core');
  copyTree(join(core, 'dist'), coreDir);
  copyTree(join(core, 'styles'), join(coreDir, 'styles'));
  let rewritten = 0;
  for (const file of files(join(tree, 'dist'), coreDir)) {
    if (!REWRITTEN.test(file)) continue;
    const before = readFileSync(file, 'utf8');
    const after = rewriteCoreImports(before, dirname(file), coreDir);
    if (after === before) continue;
    writeFileSync(file, after);
    rewritten += 1;
  }
  const manifest = join(tree, 'package.json');
  const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
  delete pkg.dependencies['@arkhe/core'];
  pkg.sideEffects = ['*.css', '*.scss'];
  pkg.exports = {
    ...pkg.exports,
    './arkhe.css': './dist/core/arkhe.css',
    './styles/*': './dist/core/styles/*',
  };
  writeFileSync(manifest, `${JSON.stringify(pkg, null, 2)}\n`);
  return rewritten;
}
