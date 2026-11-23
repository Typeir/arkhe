/**
 * @fileoverview Showcase build: one multi-page app, landing plus
 * one page per target, all served from one origin.
 *
 * @module apps/showcase/vite.config
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { svelte } from '@sveltejs/vite-plugin-svelte';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/**
 * Resolves `path` from the showcase folder.
 *
 * @function here
 * @param {string} path - Relative path.
 * @returns {string} Absolute path.
 */
const here = (path: string) => resolve(import.meta.dirname, path);
/**
 * Resolves `path` inside the packages folder.
 *
 * @function pkg
 * @param {string} path - Path inside packages/.
 * @returns {string} Absolute path.
 */
const pkg = (path: string) => here(`../../packages/${path}`);

export default defineConfig({
  base: './',
  plugins: [react(), svelte()],
  resolve: {
    alias: [
      {
        find: /^@arkhe\/core\/styles\/(.*)$/,
        replacement: pkg('core/styles/$1'),
      },
      {
        find: /^@arkhe\/core\/fx$/,
        replacement: pkg('core/src/feedback/fx/index.ts'),
      },
      { find: /^@arkhe\/core$/, replacement: pkg('core/src/index.ts') },
      { find: /^@arkhe\/react$/, replacement: pkg('react/src/index.ts') },
      { find: /^@arkhe\/svelte$/, replacement: pkg('svelte/src/index.ts') },
    ],
  },
  build: {
    cssTarget: 'chrome131',
    rolldownOptions: {
      input: {
        landing: here('index.html'),
        react: here('targets/react/index.html'),
        svelte: here('targets/svelte/index.html'),
        static: here('targets/static/index.html'),
      },
    },
  },
});
