import type { ArkheEnvironmentValue } from '@arkhe/core';
import WithEnvironment from '@tests/fixtures/svelte/WithEnvironment.svelte';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('ArkheEnvironment', () => {
  it('publishes a root node and container to its subtree', () => {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    const box = document.createElement('div');
    const seen: { value?: ArkheEnvironmentValue } = {};
    render(WithEnvironment, {
      rootNode: () => shadow,
      container: box,
      onread: (value) => (seen.value = value),
    });
    expect(seen.value?.getRootNode()).toBe(shadow);
    expect(seen.value?.container()).toBe(box);
  });

  it('portals into the root node document body without a container', () => {
    const other = document.implementation.createHTMLDocument('pop-out');
    const seen: { value?: ArkheEnvironmentValue } = {};
    render(WithEnvironment, {
      rootNode: () => other,
      onread: (value) => (seen.value = value),
    });
    expect(seen.value?.container()).toBe(other.body);
  });
});
