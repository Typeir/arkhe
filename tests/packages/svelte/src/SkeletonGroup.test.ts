import { SkeletonGroup } from '@arkhe/svelte';
import { announced } from '@tests/fixtures/announced';
import {
  FX_LOG,
  FX_MODE,
  finishReveals,
  resetFx,
} from '@tests/fixtures/fakeFx';
import {
  renderWithProvider,
  type ProviderProps,
} from '@tests/fixtures/svelte/renderWithProvider';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { waitFor } from '@testing-library/svelte';
import { createRawSnippet, tick } from 'svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@arkhe/core/fx', () => import('@tests/fixtures/fakeFx'));

const skeleton = createRawSnippet(() => ({
  render: () => '<span data-scope="skeleton" data-part="root"></span>',
}));

const props = (
  loading: boolean,
  extra: { onRevealed?: () => void; effect?: boolean } = {},
) => ({ loading, skeleton, children: textSnippet('Content'), ...extra });

const mount = (
  loading: boolean,
  extra: { onRevealed?: () => void; effect?: boolean } = {},
  provider: ProviderProps = {},
) => {
  const view = renderWithProvider(
    provider,
    SkeletonGroup,
    props(loading, extra),
  );
  const set = async (next: boolean) => {
    await view.rerender({
      provider,
      component: SkeletonGroup,
      innerProps: props(next, extra),
    });
    await tick();
  };
  return { ...view, set };
};

beforeEach(resetFx);

describe('SkeletonGroup', () => {
  it('speaks its hidden loading label once mounted, holding no live region', async () => {
    const { container } = mount(true, {}, { effects: false });
    await waitFor(() => expect(announced()).toBe('Loading'));
    const root = container.querySelector('[data-part="group"]');
    expect(root).not.toHaveAttribute('role');
    expect(root).toHaveAttribute('data-loading');
    expect(root).toHaveTextContent('Loading');
    expect(root?.querySelector('[data-part="root"]')).not.toBeNull();
  });

  it('uses the translated loading label', async () => {
    mount(true, {}, { labels: { loading: 'Ladataan' }, effects: false });
    await waitFor(() => expect(announced()).toBe('Ladataan'));
  });

  it('swaps in the content when loading ends and reports the reveal at once without an effect', async () => {
    const revealed = vi.fn();
    const { container, set } = mount(
      true,
      { onRevealed: revealed },
      { effects: false },
    );
    await set(false);
    const root = container.querySelector('[data-part="group"]');
    expect(root).not.toHaveAttribute('data-loading');
    expect(root).toHaveTextContent('Content');
    expect(root?.querySelector('[data-part="label"]')).toBeNull();
    expect(revealed).toHaveBeenCalledTimes(1);
    expect(FX_LOG).toEqual([]);
  });

  it('reports no reveal when it mounts loaded', async () => {
    const revealed = vi.fn();
    mount(false, { onRevealed: revealed });
    await tick();
    expect(revealed).not.toHaveBeenCalled();
  });

  it('attaches on mount, readies on load, attaches on reload, detaches on unmount', async () => {
    const revealed = vi.fn();
    const { set, unmount } = mount(true, { onRevealed: revealed });
    await waitFor(() => expect(FX_LOG).toEqual(['attach']));
    await set(false);
    expect(FX_LOG).toEqual(['attach', 'ready']);
    expect(revealed).toHaveBeenCalledTimes(1);
    await set(true);
    expect(FX_LOG).toEqual(['attach', 'ready', 'attach']);
    unmount();
    expect(FX_LOG.filter((call) => call !== 'destroy')).toEqual([
      'attach',
      'ready',
      'attach',
      'detach',
    ]);
    expect(FX_LOG).toContain('destroy');
  });

  it('reports the reveal only when the engine finishes it', async () => {
    FX_MODE.instant = false;
    const revealed = vi.fn();
    const { set } = mount(true, { onRevealed: revealed });
    await waitFor(() => expect(FX_LOG).toEqual(['attach']));
    await set(false);
    expect(revealed).not.toHaveBeenCalled();
    finishReveals();
    expect(revealed).toHaveBeenCalledTimes(1);
  });

  it('keeps the CSS skeleton for a group with the effect off', async () => {
    const revealed = vi.fn();
    const { set } = mount(true, { onRevealed: revealed, effect: false });
    await tick();
    await set(false);
    expect(FX_LOG).toEqual([]);
    expect(revealed).toHaveBeenCalledTimes(1);
  });
});
