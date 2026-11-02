/**
 * @fileoverview Fails any test that writes to `console.warn` or
 * `console.error`, act() warnings included. A test that expects a warning
 * spies on the console itself, which bypasses this guard.
 *
 * @module tests/setup/quiet
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { afterEach, beforeEach } from 'vitest';

const original = { warn: console.warn, error: console.error };
const seen: string[] = [];

beforeEach(() => {
  seen.length = 0;
  const capture =
    (level: 'warn' | 'error') =>
    (...args: unknown[]) => {
      seen.push(`console.${level}: ${args.map(String).join(' ')}`);
      original[level](...args);
    };
  console.warn = capture('warn');
  console.error = capture('error');
});

afterEach(() => {
  console.warn = original.warn;
  console.error = original.error;
  if (seen.length > 0) {
    throw new Error(`Unexpected console output:\n${seen.join('\n')}`);
  }
});
