/**
 * @fileoverview Root vitest config. One project per package; run one with
 * `--project <name>`. Tests mirror sources under `tests/<workspace>/src`.
 *
 * @module vitest.config
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { svelte } from '@sveltejs/vite-plugin-svelte';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const alias = {
  '@arkhe/core/styles': resolve('packages/core/styles'),
  '@arkhe/core/fx': resolve('packages/core/src/fx/index.ts'),
  '@arkhe/core': resolve('packages/core/src/index.ts'),
  '@arkhe/react': resolve('packages/react/src/index.ts'),
  '@arkhe/svelte': resolve('packages/svelte/src/index.ts'),
  '@tests': resolve('tests'),
};

export default defineConfig({
  resolve: { alias },
  test: {
    clearMocks: true,
    restoreMocks: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'core',
          environment: 'node',
          setupFiles: ['tests/setup/quiet.ts'],
          include: [
            'tests/packages/core/**/*.test.ts',
            'tests/scripts/**/*.test.ts',
          ],
        },
      },
      {
        extends: true,
        plugins: [react()],
        test: {
          name: 'react',
          environment: 'jsdom',
          setupFiles: ['tests/setup/react.ts'],
          include: ['tests/packages/react/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        plugins: [svelte()],
        resolve: { conditions: ['browser'] },
        test: {
          name: 'svelte',
          environment: 'jsdom',
          setupFiles: ['tests/setup/svelte.ts'],
          server: { deps: { inline: ['@lucide/svelte', '@zag-js/svelte'] } },
          include: ['tests/packages/svelte/**/*.test.ts'],
        },
      },
      {
        extends: true,
        plugins: [react(), svelte()],
        resolve: { conditions: ['browser'] },
        test: {
          name: 'showcase',
          environment: 'jsdom',
          setupFiles: ['tests/setup/react.ts', 'tests/setup/svelte.ts'],
          server: { deps: { inline: ['@lucide/svelte', '@zag-js/svelte'] } },
          include: [
            'tests/apps/showcase/**/*.test.{ts,tsx}',
            'tests/parity/**/*.test.{ts,tsx}',
          ],
        },
      },
      {
        extends: true,
        plugins: [react(), svelte()],
        resolve: { conditions: ['browser'] },
        test: {
          name: 'mdx',
          environment: 'jsdom',
          setupFiles: ['tests/setup/react.ts', 'tests/setup/svelte.ts'],
          server: { deps: { inline: ['@lucide/svelte', '@zag-js/svelte'] } },
          include: ['tests/mdx/**/*.test.{ts,tsx}'],
        },
      },
    ],
  },
});
