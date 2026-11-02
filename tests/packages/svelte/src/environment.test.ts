import type { ArkheEnvironmentValue } from '@arkhe/core';
import EnvironmentProbe from '@tests/fixtures/svelte/EnvironmentProbe.svelte';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('useArkheEnvironment', () => {
  it('defaults to the main document', () => {
    const seen: { value?: ArkheEnvironmentValue } = {};
    render(EnvironmentProbe, { onread: (value) => (seen.value = value) });
    expect(seen.value?.getRootNode()).toBe(document);
    expect(seen.value?.container()).toBe(document.body);
  });

  it('reads an environment published under the shared key', () => {
    const box = document.createElement('div');
    const published: ArkheEnvironmentValue = {
      getRootNode: () => document,
      container: () => box,
    };
    const seen: { value?: ArkheEnvironmentValue } = {};
    render(EnvironmentProbe, {
      props: { onread: (value: ArkheEnvironmentValue) => (seen.value = value) },
      context: new Map([[Symbol.for('arkhe.environment'), () => published]]),
    });
    expect(seen.value).toBe(published);
  });
});
