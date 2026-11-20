import { ArkheProvider, Skeleton, SkeletonGroup } from '@arkhe/react';
import { announced } from '@tests/fixtures/announced';
import {
  FX_LOG,
  FX_MODE,
  finishReveals,
  resetFx,
} from '@tests/fixtures/fakeFx';
import { act, render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@arkhe/core/fx', () => import('@tests/fixtures/fakeFx'));

const SHAPES = (
  <>
    <Skeleton width='40%' />
    <Skeleton />
  </>
);

const group = (
  loading: boolean,
  props: { onRevealed?: () => void; effect?: boolean } = {},
  effects?: false,
): ReactNode => (
  <ArkheProvider effects={effects}>
    <SkeletonGroup loading={loading} skeleton={SHAPES} {...props}>
      <p>Content</p>
    </SkeletonGroup>
  </ArkheProvider>
);

beforeEach(resetFx);

describe('Skeleton', () => {
  it('renders a hidden line by default', () => {
    const { container } = render(<Skeleton />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar).toHaveAttribute('data-shape', 'line');
    expect(bar).toHaveAttribute('aria-hidden', 'true');
  });

  it('carries size through custom properties', () => {
    const { container } = render(
      <Skeleton shape='block' width='40%' height='4rem' />,
    );
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.style.getPropertyValue('--skeleton-width')).toBe('40%');
    expect(bar.style.getPropertyValue('--skeleton-height')).toBe('4rem');
  });
});

describe('SkeletonGroup', () => {
  it('speaks its hidden loading label once mounted, holding no live region', () => {
    const { container } = render(group(true, {}, false));
    expect(announced()).toBe('Loading');
    const root = container.querySelector('[data-part="group"]');
    expect(root).not.toHaveAttribute('role');
    expect(root).toHaveAttribute('data-loading');
    expect(root).toHaveTextContent('Loading');
    expect(root?.querySelectorAll('[data-part="root"]')).toHaveLength(2);
  });

  it('uses the translated loading label', () => {
    render(
      <ArkheProvider labels={{ loading: 'Ladataan' }} effects={false}>
        <SkeletonGroup loading skeleton={SHAPES} />
      </ArkheProvider>,
    );
    expect(announced()).toBe('Ladataan');
  });

  it('swaps in the content when loading ends and reports the reveal at once without an effect', () => {
    const revealed = vi.fn();
    const { container, rerender } = render(
      group(true, { onRevealed: revealed }, false),
    );
    rerender(group(false, { onRevealed: revealed }, false));
    const root = container.querySelector('[data-part="group"]');
    expect(root).not.toHaveAttribute('data-loading');
    expect(root).toHaveTextContent('Content');
    expect(root?.querySelector('[data-part="label"]')).toBeNull();
    expect(revealed).toHaveBeenCalledTimes(1);
    expect(FX_LOG).toEqual([]);
  });

  it('reports no reveal when it mounts loaded', () => {
    const revealed = vi.fn();
    render(group(false, { onRevealed: revealed }));
    expect(revealed).not.toHaveBeenCalled();
  });

  it('attaches on mount, readies on load, attaches on reload, detaches on unmount', async () => {
    const revealed = vi.fn();
    const { rerender, unmount } = render(group(true, { onRevealed: revealed }));
    await waitFor(() => expect(FX_LOG).toEqual(['attach']));
    rerender(group(false, { onRevealed: revealed }));
    expect(FX_LOG).toEqual(['attach', 'ready']);
    expect(revealed).toHaveBeenCalledTimes(1);
    rerender(group(true, { onRevealed: revealed }));
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
    const { rerender } = render(group(true, { onRevealed: revealed }));
    await waitFor(() => expect(FX_LOG).toEqual(['attach']));
    rerender(group(false, { onRevealed: revealed }));
    expect(revealed).not.toHaveBeenCalled();
    act(finishReveals);
    expect(revealed).toHaveBeenCalledTimes(1);
  });

  it('keeps the CSS skeleton for a group with the effect off', async () => {
    const revealed = vi.fn();
    const { rerender } = render(
      group(true, { onRevealed: revealed, effect: false }),
    );
    await act(() => Promise.resolve());
    rerender(group(false, { onRevealed: revealed, effect: false }));
    expect(FX_LOG).toEqual([]);
    expect(revealed).toHaveBeenCalledTimes(1);
  });
});
