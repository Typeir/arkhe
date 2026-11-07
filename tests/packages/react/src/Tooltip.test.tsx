import { Tooltip } from '@arkhe/react';
import { tap } from '@tests/fixtures/tap';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

describe('Tooltip', () => {
  it('shows its hint on hover and describes the trigger', async () => {
    render(
      <Tooltip content='Resistance halves damage.' openDelay={0}>
        resistance
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'resistance' });
    expect(trigger).toHaveAttribute('type', 'button');
    expect(screen.queryByRole('tooltip')).toBeNull();
    await userEvent.hover(trigger);
    const hint = await screen.findByRole('tooltip');
    expect(hint).toHaveTextContent('Resistance halves damage.');
    expect(trigger).toHaveAccessibleDescription('Resistance halves damage.');
  });

  it('hides on Escape', async () => {
    render(
      <Tooltip content='Hint' openDelay={0} closeDelay={0}>
        word
      </Tooltip>,
    );
    await userEvent.hover(screen.getByRole('button', { name: 'word' }));
    await screen.findByRole('tooltip');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('mounts its body on first open and keeps it, hidden, after', async () => {
    const { container } = render(
      <Tooltip content='Hint' openDelay={0} closeDelay={0}>
        word
      </Tooltip>,
    );
    expect(container.querySelector('[data-part="positioner"]')).toBeNull();
    await userEvent.hover(screen.getByRole('button', { name: 'word' }));
    await screen.findByRole('tooltip');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        document.body.querySelector('[data-part="positioner"]'),
      ).toHaveAttribute('hidden'),
    );
    expect(container.querySelector('[data-part="positioner"]')).toBeNull();
  });

  it('server-renders the trigger alone', () => {
    const html = renderToString(<Tooltip content='Hint'>word</Tooltip>);
    expect(html).not.toContain('data-part="positioner"');
    expect(html).not.toContain('Hint');
  });

  it('takes rich phrasing content', async () => {
    render(
      <Tooltip content={<em>very</em>} defaultOpen>
        word
      </Tooltip>,
    );
    expect(await screen.findByRole('tooltip')).toContainHTML('<em>very</em>');
  });

  it('renders an inline trigger that holds another trigger', async () => {
    render(
      <Tooltip content='Outer' inline openDelay={0}>
        outer{' '}
        <Tooltip content='Inner' inline openDelay={0}>
          inner
        </Tooltip>
      </Tooltip>,
    );
    const inner = screen.getByText('inner');
    const outer = inner.parentElement?.closest(
      '[data-part="trigger"]',
    ) as HTMLElement;
    expect(outer).toHaveAttribute('tabindex', '0');
    expect(screen.queryByRole('button')).toBeNull();
    await userEvent.hover(inner);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Inner');
    expect(outer).toHaveAttribute('data-state', 'closed');
  });

  it('toggles on tap and closes on a tap outside', async () => {
    render(
      <>
        <Tooltip content='Hint' closeDelay={0}>
          word
        </Tooltip>
        <p>elsewhere</p>
      </>,
    );
    const trigger = screen.getByRole('button', { name: 'word' });
    await tap(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Hint');
    await tap(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    await tap(trigger);
    await screen.findByRole('tooltip');
    await tap(screen.getByText('elsewhere'));
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('follows a controlled open and reports changes', async () => {
    const report = vi.fn();
    const Host = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type='button' onClick={() => setOpen(!open)}>
            toggle
          </button>
          <Tooltip
            content='Hint'
            open={open}
            onOpenChange={(next) => {
              report(next);
              setOpen(next);
            }}>
            word
          </Tooltip>
        </>
      );
    };
    render(<Host />);
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Hint');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    expect(report).toHaveBeenCalledWith(false);
  });
});
