import { ArkheProvider } from '@arkhe/react';
import { act, render, renderHook, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  HintTrigger,
  useHint,
  useOpenState,
} from '../../../../packages/react/src/HintTrigger';

const Routed = (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a {...props} data-routed='' />
);

describe('HintTrigger', () => {
  it('renders a button by default', () => {
    render(<HintTrigger attrs={{ id: 't' }}>word</HintTrigger>);
    const button = screen.getByRole('button', { name: 'word' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('id', 't');
  });

  it("renders the provider's link with href, over inline", () => {
    render(
      <ArkheProvider link={Routed} effects={false}>
        <HintTrigger attrs={{}} href='/rule' inline>
          rule
        </HintTrigger>
      </ArkheProvider>,
    );
    const link = screen.getByRole('link', { name: 'rule' });
    expect(link).toHaveAttribute('href', '/rule');
    expect(link).toHaveAttribute('data-routed');
  });

  it('renders inline text with a tab stop that may hold a button', () => {
    render(
      <HintTrigger attrs={{}} inline>
        a <button type='button'>b</button>
      </HintTrigger>,
    );
    const span = screen.getByText('a', { exact: false, selector: 'span' });
    expect(span).toHaveAttribute('tabindex', '0');
    expect(span.querySelector('button')).not.toBeNull();
  });
});

describe('useOpenState', () => {
  it('keeps its own state from defaultOpen and reports changes once', () => {
    const report = vi.fn();
    const { result } = renderHook(() => useOpenState(undefined, true, report));
    expect(result.current.shown).toBe(true);
    act(() => result.current.change(true));
    expect(report).not.toHaveBeenCalled();
    act(() => result.current.change(false));
    expect(result.current.shown).toBe(false);
    expect(report).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('follows open when controlled', () => {
    const report = vi.fn();
    const { result } = renderHook(() => useOpenState(true, false, report));
    act(() => result.current.change(false));
    expect(result.current.shown).toBe(true);
    expect(report).toHaveBeenCalledWith(false);
  });
});

describe('useHint', () => {
  it('mounts the body on first open and keeps it after', () => {
    const { result, rerender } = renderHook(
      ({ open }) =>
        useHint({
          open,
          setOpen: () => undefined,
          trigger: { id: 'trigger' },
          positionerId: 'positioner',
        }),
      { initialProps: { open: false } },
    );
    expect(result.current.mounted).toBe(false);
    rerender({ open: true });
    expect(result.current.mounted).toBe(true);
    rerender({ open: false });
    expect(result.current.mounted).toBe(true);
  });

  it('closes on a touch outside while open', () => {
    const setOpen = vi.fn();
    renderHook(() =>
      useHint({ open: true, setOpen, trigger: {}, positionerId: 'none' }),
    );
    act(() => {
      document.body.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'touch',
        }),
      );
    });
    expect(setOpen).toHaveBeenCalledWith(false);
  });
});
