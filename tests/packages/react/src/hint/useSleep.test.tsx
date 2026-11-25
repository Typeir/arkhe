import { HoverCard, Tooltip } from '@arkhe/react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSleep } from '../../../../../packages/react/src/hint/useSleep';

const attributes = (el: Element) =>
  Object.fromEntries([...el.attributes].map((a) => [a.name, a.value]));

describe('useSleep', () => {
  it('sleeps with the closed trigger attributes and wakes on hover, not a touch over', () => {
    const { result } = renderHook(() => useSleep('tooltip', 'r1', false));
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
    const { result } = renderHook(() => useSleep('tooltip', 'r1', true));
    expect(result.current.waking).toBe('open');
  });

  it('takes reported attributes and routes handlers through stable proxies', () => {
    const { result } = renderHook(() => useSleep('tooltip', 'r1', true));
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
    const { result } = renderHook(() => useSleep('tooltip', 'r1', false));
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
});
