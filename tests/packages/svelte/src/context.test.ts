import { resolveLabels } from '@arkhe/core';
import type { ArkheContextValue } from '@arkhe/svelte';
import ContextProbe from '@tests/fixtures/svelte/ContextProbe.svelte';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('useArkhe', () => {
  it('reads published adapters through the shared key', () => {
    const published: ArkheContextValue = {
      labels: resolveLabels({ loading: 'Ladataan' }),
      icons: [],
      link: undefined,
    };
    const seen: { value?: ArkheContextValue } = {};
    render(ContextProbe, {
      props: { onread: (value: ArkheContextValue) => (seen.value = value) },
      context: new Map([[Symbol.for('arkhe.context'), () => published]]),
    });
    expect(seen.value).toBe(published);
  });
});
