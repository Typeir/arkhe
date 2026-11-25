import { HoverCard, Tooltip } from '@arkhe/react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useSleep } from '../../../../../packages/react/src/hint/useSleep';

const attributes = (el: Element) =>
  Object.fromEntries([...el.attributes].map((a) => [a.name, a.value]));

describe('useSleep', () => {
  it('sleeps with the closed trigger attributes and wakes on hover, not a touch over', () => {
    const { result } = renderHook(() =>
      useSleep('tooltip', 'r1', false, false),
    );
    expect(result.current.waking).toBeNull();
    expect(result.current.attrs).toMatchObject({
      id: 'tooltip:r1:trigger',
      'data-state': 'closed',
    });
    const over = result.current.attrs.onPointerOver as (e: object) => void;
    act(() => {
      over({ type: 'pointerover', pointerType: 'touch' });
    });
    expect(result.current.waking).toBeNull();
    act(() => {
      over({ type: 'pointerover', pointerType: 'mouse' });
    });
    expect(result.current.waking).toBe('hover');
  });

  it('wakes at once when held open', () => {
    const { result } = renderHook(() => useSleep('tooltip', 'r1', true, false));
    expect(result.current.waking).toBe('open');
  });

  it('takes reported attributes and routes handlers through stable proxies', () => {
    const { result } = renderHook(() => useSleep('tooltip', 'r1', true, false));
    const first = vi.fn();
    const second = vi.fn();
    act(() => {
      result.current.report({ 'data-state': 'open', onClick: first });
    });
    const proxy = result.current.attrs.onClick as (e: object) => void;
    expect(result.current.attrs['data-state' as keyof object]).toBe('open');
    act(() => {
      result.current.report({ 'data-state': 'open', onClick: second });
    });
    expect(result.current.attrs.onClick).toBe(proxy);
    proxy({});
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('wakes a Tooltip without touching the trigger node or its attributes', () => {
    render(
      <Tooltip content='Hint' openDelay={10_000}>
        word
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'word' });
    const before = attributes(trigger);
    fireEvent.pointerOver(trigger, { pointerType: 'mouse' });
    expect(screen.getByRole('button', { name: 'word' })).toBe(trigger);
    expect(attributes(trigger)).toEqual(before);
  });

  it.each([
    ['button', {}],
    ['inline', { inline: true }],
    ['link', { href: '#charge' }],
  ])(
    'wakes a %s HoverCard without touching the trigger node or its attributes',
    (_kind, extra) => {
      render(
        <HoverCard title='Charge' openDelay={10_000} {...extra}>
          charge
        </HoverCard>,
      );
      const trigger = document.querySelector(
        '[data-scope="hover-card"][data-part="trigger"]',
      ) as HTMLElement;
      const before = attributes(trigger);
      fireEvent.pointerOver(trigger, { pointerType: 'mouse' });
      expect(
        document.querySelector(
          '[data-scope="hover-card"][data-part="trigger"]',
        ),
      ).toBe(trigger);
      expect(attributes(trigger)).toEqual(before);
    },
  );

  it('knows whether the waking pointer is still over the trigger', () => {
    const { result } = renderHook(() =>
      useSleep('tooltip', 'r1', false, false),
    );
    const handler = (name: string) =>
      (result.current.attrs as Record<string, (e: object) => void>)[name];
    act(() => {
      handler('onPointerOver')?.({ type: 'pointerover', pointerType: 'mouse' });
    });
    expect(result.current.hovering()).toBe(true);
    act(() => {
      handler('onPointerLeave')?.({ type: 'pointerleave' });
    });
    expect(result.current.hovering()).toBe(false);
  });

  it('sleeps again after closing, on the same trigger node', async () => {
    render(
      <Tooltip content='Hint' openDelay={0} closeDelay={0}>
        word
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'word' });
    const before = attributes(trigger);
    await userEvent.hover(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Hint');
    await userEvent.unhover(trigger);
    await waitFor(() =>
      expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull(),
    );
    expect(screen.getByRole('button', { name: 'word' })).toBe(trigger);
    expect(attributes(trigger)).toEqual(before);
    await userEvent.hover(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Hint');
  });

  it('counts defaultOpen only before the first sleep', async () => {
    render(
      <HoverCard title='Charge' content='Body' defaultOpen openDelay={10_000}>
        charge
      </HoverCard>,
    );
    expect(screen.getByRole('dialog', { name: 'Charge' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.pointerOver(screen.getByRole('button', { name: 'charge' }), {
      pointerType: 'mouse',
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps a loaded card body across sleeps', async () => {
    const load = vi.fn(async () => 'Loaded body');
    render(
      <HoverCard
        title='Charge'
        load={load}
        loaded={(text) => <p>{text}</p>}
        openDelay={0}
        closeDelay={0}>
        charge
      </HoverCard>,
    );
    const trigger = screen.getByRole('button', { name: 'charge' });
    await userEvent.hover(trigger);
    expect(await screen.findByText('Loaded body')).toBeInTheDocument();
    await userEvent.unhover(trigger);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await userEvent.hover(trigger);
    const reopened = await screen.findByRole('dialog', { name: 'Charge' });
    expect(within(reopened).getByText('Loaded body')).toBeInTheDocument();
    expect(within(reopened).queryByText('Loading…')).toBeNull();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('goes back to sleep through its sleep callback', () => {
    const { result } = renderHook(() =>
      useSleep('tooltip', 'r1', false, false),
    );
    act(() => {
      (
        result.current.attrs as Record<string, (e: object) => void>
      ).onPointerOver?.({ type: 'pointerover', pointerType: 'mouse' });
    });
    expect(result.current.waking).toBe('hover');
    act(() => {
      result.current.sleep();
    });
    expect(result.current.waking).toBeNull();
    expect(result.current.fresh).toBe(false);
    expect(result.current.hovering()).toBe(false);
  });
});
