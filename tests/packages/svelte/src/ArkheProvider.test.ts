import { DEFAULT_LABELS } from '@arkhe/core';
import type { ArkheContextValue } from '@arkhe/svelte';
import ContextProbe from '@tests/fixtures/svelte/ContextProbe.svelte';
import {
  renderWithProvider,
  type ProviderProps,
} from '@tests/fixtures/svelte/renderWithProvider';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

const Own = (() =>
  undefined) as unknown as ArkheContextValue['icons'][number]['x'];

function capture(provider: ProviderProps): ArkheContextValue {
  const seen: { value?: ArkheContextValue } = {};
  renderWithProvider(provider, ContextProbe, {
    onread: (value: ArkheContextValue) => (seen.value = value),
  });
  return seen.value as ArkheContextValue;
}

describe('ArkheProvider', () => {
  it('serves defaults outside any provider', () => {
    const seen: { value?: ArkheContextValue } = {};
    render(ContextProbe, { onread: (value) => (seen.value = value) });
    expect(seen.value?.labels).toEqual(DEFAULT_LABELS);
    expect(seen.value?.icons).toEqual([]);
    expect(seen.value?.link).toBeUndefined();
  });

  it('merges label overrides over the defaults', () => {
    const value = capture({ labels: { loading: 'Ladataan' } });
    expect(value.labels.loading).toBe('Ladataan');
    expect(value.labels.statusError).toBe(DEFAULT_LABELS.statusError);
  });

  it('carries only the app icon set', () => {
    expect(capture({ icons: { x: Own } }).icons).toEqual([{ x: Own }]);
  });
});
