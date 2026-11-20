import { DEFAULT_LABELS, FxLoader } from '@arkhe/core';
import type { ArkheContextValue } from '@arkhe/svelte';
import ContextProbe from '@tests/fixtures/svelte/ContextProbe.svelte';
import {
  renderWithProvider,
  type ProviderProps,
} from '@tests/fixtures/svelte/renderWithProvider';
import { render } from '@testing-library/svelte';
import { FX_LOG, resetFx } from '@tests/fixtures/fakeFx';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@arkhe/core/fx', () => import('@tests/fixtures/fakeFx'));

beforeEach(resetFx);

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
    expect(seen.value?.locale).toBe('en');
  });

  it('merges label overrides over the defaults', () => {
    const value = capture({ labels: { loading: 'Ladataan' } });
    expect(value.labels.loading).toBe('Ladataan');
    expect(value.labels.statusError).toBe(DEFAULT_LABELS.statusError);
  });

  it('carries the locale', () => {
    expect(capture({ locale: 'fi' }).locale).toBe('fi');
  });

  it('carries only the app icon set', () => {
    expect(capture({ icons: { x: Own } }).icons).toEqual([{ x: Own }]);
  });

  it('serves a shared default engine handle outside any provider', () => {
    const seen: { value?: ArkheContextValue } = {};
    render(ContextProbe, { onread: (value) => (seen.value = value) });
    expect(seen.value?.effects).toBeInstanceOf(FxLoader);
  });

  it('owns one engine, made on request with its options', async () => {
    const value = capture({ effects: { maxFps: 60 } });
    expect(value.effects.setting).toEqual({ maxFps: 60 });
    expect(value.effects.engine).toBeNull();
    const engine = await value.effects.request();
    expect(value.effects.engine).toBe(engine);
  });

  it('never loads an engine with effects off', async () => {
    expect(await capture({ effects: false }).effects.request()).toBeNull();
  });

  it('destroys its engine when it unmounts', async () => {
    const seen: { value?: ArkheContextValue } = {};
    const { unmount } = renderWithProvider({}, ContextProbe, {
      onread: (value: ArkheContextValue) => (seen.value = value),
    });
    await seen.value?.effects.request();
    unmount();
    expect(FX_LOG).toEqual(['destroy']);
  });
});
