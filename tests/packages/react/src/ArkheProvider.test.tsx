import { DEFAULT_LABELS } from '@arkhe/core';
import { ArkheProvider, useArkhe, type ArkheContextValue } from '@arkhe/react';
import { render } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

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
});
