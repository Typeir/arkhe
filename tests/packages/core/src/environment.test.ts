// @vitest-environment jsdom
import {
  DEFAULT_ENVIRONMENT,
  createEnvironment,
  documentOf,
} from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('documentOf', () => {
  it('returns a document as is and a shadow root its owner', () => {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    expect(documentOf(document)).toBe(document);
    expect(documentOf(shadow)).toBe(document);
  });
});

describe('createEnvironment', () => {
  it('defaults to the main document and its body', () => {
    expect(DEFAULT_ENVIRONMENT.getRootNode()).toBe(document);
    expect(DEFAULT_ENVIRONMENT.container()).toBe(document.body);
  });

  it('portals into the root node own document', () => {
    const other = document.implementation.createHTMLDocument('pop-out');
    const env = createEnvironment({ rootNode: () => other });
    expect(env.container()).toBe(other.body);
  });

  it('takes a container element or getter', () => {
    const box = document.createElement('div');
    expect(createEnvironment({ container: box }).container()).toBe(box);
    expect(createEnvironment({ container: () => box }).container()).toBe(box);
  });
});
