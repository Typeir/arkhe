/**
 * @fileoverview ESLint flat config: typescript-eslint strict everywhere,
 * typed rules for sources, React hooks for React sources, Svelte rules for
 * components, sorted imports, Node globals for scripts and configs.
 *
 * @module eslint.config
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import js from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import reactHooks from 'eslint-plugin-react-hooks';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
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

/**
 * Syntax banned in every authored source file.
 *
 * @constant SOURCE_SYNTAX
 * @type {{ selector: string, message: string }[]}
 */
const SOURCE_SYNTAX = [
  {
    selector: "CallExpression[callee.name='Symbol']",
    message: 'Context keys use Symbol.for, shared by every copy of Arkhé.',
  },
  {
    selector:
      "ConditionalExpression[consequent.value=''][alternate.type='Identifier'][alternate.name='undefined']",
    message: 'Use flag() for a present-or-absent attribute.',
  },
  {
    selector:
      "BinaryExpression[operator='instanceof'][right.name=/^(Element|HTMLElement|Node|Document|ShadowRoot|Text)$/]",
    message:
      'instanceof fails across windows; use isElement / isNode from core.',
  },
  {
    selector: "CallExpression[callee.property.name='forEach']",
    message: 'Use for...of.',
  },
];

/**
 * Syntax banned in React components (R5, and the boolean attribute form):
 * stand-ins for `react/destructuring-assignment` and
 * `react/jsx-boolean-value`, whose plugin does not run on ESLint 10.
 *
 * @constant REACT_SYNTAX
 * @type {{ selector: string, message: string }[]}
 */
const REACT_SYNTAX = [
  {
    selector: "MemberExpression[object.type='Identifier'][object.name='props']",
    message: 'Destructure props in the signature (R5).',
  },
  {
    selector: 'JSXAttribute > JSXExpressionContainer > Literal[value=true]',
    message: 'Write the bare attribute, not ={true}.',
  },
];

/**
 * Syntax banned in Svelte components (R5).
 *
 * @constant SVELTE_SYNTAX
 * @type {{ selector: string, message: string }[]}
 */
const SVELTE_SYNTAX = [
  {
    selector:
      "VariableDeclarator[id.type='Identifier'] > CallExpression.init[callee.name='$props']",
    message: 'Destructure $props() (R5).',
  },
];

/**
 * Style rules for authored source, from the style review (P79 and its
 * rulings): one way to write each construct.
 *
 * @constant SOURCE_STYLE
 * @type {import('eslint').Linter.RulesRecord}
 */
const SOURCE_STYLE = {
  curly: ['error', 'multi-line', 'consistent'],
  'consistent-return': 'error',
  'no-implicit-coercion': [
    'error',
    { boolean: true, number: false, string: false },
  ],
  'no-plusplus': 'error',
  'no-nested-ternary': 'error',
  'id-length': [
    'error',
    {
      min: 2,
      exceptions: ['_', 'x', 'y', 'w', 'h', 't', 'i', 'j', 'k'],
      properties: 'never',
    },
  ],
  'no-restricted-syntax': ['error', ...SOURCE_SYNTAX],
  '@typescript-eslint/method-signature-style': ['error', 'property'],
  '@typescript-eslint/parameter-properties': [
    'error',
    { prefer: 'class-property' },
  ],
  '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  '@typescript-eslint/explicit-module-boundary-types': 'error',
};

/**
 * Window members core may not reach as globals (R6): core runs in any window
 * and shadow root, so it goes through the owner document's window.
 *
 * @constant WINDOW_GLOBALS
 * @type {string[]}
 */
const WINDOW_GLOBALS = [
  'window',
  'document',
  'self',
  'innerWidth',
  'innerHeight',
  'scrollX',
  'scrollY',
  'devicePixelRatio',
  'matchMedia',
  'getComputedStyle',
  'addEventListener',
  'removeEventListener',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'MutationObserver',
  'ResizeObserver',
  'IntersectionObserver',
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
  {
    files: [
      'packages/*/src/**/*.{ts,tsx,svelte}',
      'apps/showcase/src/**/*.{ts,tsx,svelte}',
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...SOURCE_STYLE,
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        { allowNullableBoolean: true },
      ],
      '@typescript-eslint/no-confusing-void-expression': 'error',
    },
  },
  {
    files: ['packages/react/src/**/*.tsx', 'apps/showcase/src/react/**/*.tsx'],
    rules: {
      'no-restricted-syntax': ['error', ...SOURCE_SYNTAX, ...REACT_SYNTAX],
    },
  },
  {
    files: [
      'packages/svelte/src/**/*.svelte',
      'apps/showcase/src/svelte/**/*.svelte',
    ],
    rules: {
      'no-restricted-syntax': ['error', ...SOURCE_SYNTAX, ...SVELTE_SYNTAX],
    },
  },
  {
    files: ['**/*.{ts,tsx,mjs,svelte}'],
    plugins: { perfectionist },
    rules: {
      'perfectionist/sort-imports': ['error', { newlinesBetween: 0 }],
      'perfectionist/sort-named-imports': 'error',
    },
  },
  {
    files: ['packages/core/src/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...WINDOW_GLOBALS.map((name) => ({
          name,
          message:
            "Reach the owner document's window; core runs in any window.",
        })),
      ],
    },
  },
);
