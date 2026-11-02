/**
 * @fileoverview ESLint flat config: typescript-eslint strict everywhere,
 * React hooks for React sources, Svelte rules for components, Node globals
 * for scripts and configs.
 *
 * @module eslint.config
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Paths excluded from linting: build output, dependencies, local scratch.
 *
 * @constant IGNORES
 * @type {string[]}
 */
const IGNORES = [
  '**/dist/**',
  '**/.svelte-kit/**',
  'coverage/**',
  'test-results/**',
  'node_modules/**',
  '.ignore/**',
];

export default defineConfig(
  { ignores: IGNORES },
  js.configs.recommended,
  tseslint.configs.strict,
  svelte.configs.recommended,
  {
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
      },
    },
  },
  {
    files: [
      'packages/react/**/*.{ts,tsx}',
      'apps/showcase/src/react/**/*.tsx',
      'tests/**/*.tsx',
    ],
    extends: [reactHooks.configs.flat['recommended-latest']],
  },
  {
    files: [
      '.github/scripts/**/*.mjs',
      '*.config.{ts,mjs,js}',
      '**/vite.config.ts',
    ],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['.github/scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
);
