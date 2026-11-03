import { FX_LOG, resetFx } from '@tests/fixtures/fakeFx';
import { screen, waitFor } from '@testing-library/dom';
import {
  act,
  cleanup as cleanupReact,
  render as renderReact,
} from '@testing-library/react';
import {
  cleanup as cleanupSvelte,
  render as renderSvelte,
} from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReactCases } from './ReactCases';
import SvelteCases from './SvelteCases.svelte';

vi.mock('@arkhe/core/fx', () => import('@tests/fixtures/fakeFx'));

interface Port {
  readonly mount: () => void;
  readonly settle: () => Promise<void>;
  readonly unmount: () => void;
}

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 30));

const REACT: Port = {
  mount: () => void renderReact(<ReactCases name='skeleton-loading' fx />),
  settle: () => act(wait),
  unmount: cleanupReact,
};

const SVELTE: Port = {
  mount: () =>
    void renderSvelte(SvelteCases, { name: 'skeleton-loading', fx: true }),
  settle: wait,
  unmount: cleanupSvelte,
};

const owned = () => FX_LOG.filter((call) => call !== 'destroy');

async function calls(port: Port): Promise<string[][]> {
  resetFx();
  port.mount();
  await waitFor(() => expect(FX_LOG).toContain('attach'));
  await port.settle();
  const steps = [owned()];
  for (let i = 0; i < 2; i += 1) {
    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle loading' }),
    );
    await port.settle();
    steps.push(owned());
  }
  port.unmount();
  steps.push(owned());
  document.body.replaceChildren();
  return steps;
}

describe('React and Svelte drive the effect engine the same way', () => {
  it('attach on mount, ready on load, attach on reload, detach on unmount', async () => {
    const react = await calls(REACT);
    const svelte = await calls(SVELTE);
    expect(react).toEqual([
      ['attach'],
      ['attach', 'ready'],
      ['attach', 'ready', 'attach'],
      ['attach', 'ready', 'attach', 'detach'],
    ]);
    expect(svelte).toEqual(react);
  });
});
