import { DEFAULT_LABELS, FxLoader } from '@arkhe/core';
import { ArkheProvider, useArkhe, type ArkheContextValue } from '@arkhe/react';
import { render } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { FX_LOG, resetFx } from '@tests/fixtures/fakeFx';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@arkhe/core/fx', () => import('@tests/fixtures/fakeFx'));

beforeEach(resetFx);

const Own = () => <svg data-testid='own' />;

const Probe = ({ onRead }: { onRead: (value: ArkheContextValue) => void }) => {
  onRead(useArkhe());
  return null;
};

function capture(tree: (probe: ReactNode) => ReactNode): ArkheContextValue {
  const seen: { value?: ArkheContextValue } = {};
  render(tree(<Probe onRead={(value) => (seen.value = value)} />));
  return seen.value as ArkheContextValue;
}

describe('ArkheProvider', () => {
  it('serves defaults outside any provider', () => {
    const value = capture((probe) => probe);
    expect(value.labels).toEqual(DEFAULT_LABELS);
    expect(value.icons).toEqual([]);
    expect(value.link).toBe('a');
  });

  it('merges label overrides over the defaults', () => {
    const value = capture((probe) => (
      <ArkheProvider labels={{ loading: 'Ladataan' }}>{probe}</ArkheProvider>
    ));
    expect(value.labels.loading).toBe('Ladataan');
    expect(value.labels.statusError).toBe(DEFAULT_LABELS.statusError);
  });

  it('carries only the app icon set', () => {
    const value = capture((probe) => (
      <ArkheProvider icons={{ x: Own }}>{probe}</ArkheProvider>
    ));
    expect(value.icons).toEqual([{ x: Own }]);
  });

  it('takes a link renderer', () => {
    const Link = (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a {...props} />
    );
    const value = capture((probe) => (
      <ArkheProvider link={Link}>{probe}</ArkheProvider>
    ));
    expect(value.link).toBe(Link);
  });

  it('serves a shared default engine handle outside any provider', () => {
    const value = capture((probe) => probe);
    expect(value.effects).toBeInstanceOf(FxLoader);
    expect(capture((probe) => probe).effects).toBe(value.effects);
  });

  it('owns one engine, made on request with its options', async () => {
    const value = capture((probe) => (
      <ArkheProvider effects={{ maxFps: 60 }}>{probe}</ArkheProvider>
    ));
    expect(value.effects.setting).toEqual({ maxFps: 60 });
    expect(value.effects.engine).toBeNull();
    const engine = await value.effects.request();
    expect(value.effects.engine).toBe(engine);
  });

  it('never loads an engine with effects off', async () => {
    const value = capture((probe) => (
      <ArkheProvider effects={false}>{probe}</ArkheProvider>
    ));
    expect(await value.effects.request()).toBeNull();
  });

  it('destroys its engine when it unmounts', async () => {
    const seen: { value?: ArkheContextValue } = {};
    const { unmount } = render(
      <ArkheProvider>
        <Probe onRead={(value) => (seen.value = value)} />
      </ArkheProvider>,
    );
    await seen.value?.effects.request();
    unmount();
    expect(FX_LOG).toEqual(['destroy']);
  });
});
