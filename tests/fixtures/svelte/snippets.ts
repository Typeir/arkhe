/**
 * @fileoverview Snippet builders for Svelte component tests.
 *
 * @module tests/fixtures/svelte/snippets
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import type { FieldControlAttrs } from '@arkhe/core';
import { createRawSnippet, type Snippet } from 'svelte';

/**
 * Builds a snippet that renders `text` in a span.
 *
 * @function textSnippet
 * @param {string} text - Visible text.
 * @returns {Snippet} Snippet.
 */
export function textSnippet(text: string): Snippet {
  return createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));
}

/**
 * Builds a Field control snippet: a text input carrying the given attributes.
 *
 * @function inputSnippet
 * @returns {Snippet<[FieldControlAttrs]>} Snippet.
 */
export function inputSnippet(): Snippet<[FieldControlAttrs]> {
  return createRawSnippet<[FieldControlAttrs]>((control) => ({
    render: () => '<input type="text" />',
    setup: (node) => {
      for (const [name, value] of Object.entries(control())) {
        if (value !== undefined) node.setAttribute(name, String(value));
      }
    },
  }));
}

/**
 * Builds a Tabs panel snippet that prints `panel <value>`.
 *
 * @function panelSnippet
 * @returns {Snippet<[string]>} Snippet.
 */
export function panelSnippet(): Snippet<[string]> {
  return createRawSnippet<[string]>((value) => ({
    render: () => `<p>panel ${value()}</p>`,
  }));
}

/**
 * Builds a snippet that prints its argument in a paragraph.
 *
 * @function valueSnippet
 * @returns {Snippet<[string]>} Snippet.
 */
export function valueSnippet(): Snippet<[string]> {
  return createRawSnippet<[string]>((value) => ({
    render: () => `<p>${value()}</p>`,
  }));
}
