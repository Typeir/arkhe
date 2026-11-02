import { ArkheEnvironment, ArkheProvider, Modal } from '@arkhe/react';
import { render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

function shadowApp() {
  const host = document.createElement('div');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const app = document.createElement('button');
  app.textContent = 'App';
  const container = document.createElement('div');
  shadow.append(app, container);
  return { host, shadow, app, container };
}

describe('Modal', () => {
  it('opens from its trigger, named and described', async () => {
    render(
      <Modal title='Rest' description='Recover your charges.' trigger='Rest'>
        <p>Body</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Rest' }));
    const dialog = await screen.findByRole('dialog', { name: 'Rest' });
    expect(dialog).toHaveAccessibleDescription('Recover your charges.');
    expect(dialog).toHaveTextContent('Body');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const onOpenChange = vi.fn();
    render(<Modal title='Rest' trigger='Open' onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('closes from the labelled close button', async () => {
    render(
      <ArkheProvider labels={{ close: 'Sulje' }}>
        <Modal title='Rest' defaultOpen />
      </ArkheProvider>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Sulje' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('follows a controlled open state', async () => {
    const { rerender } = render(<Modal title='Rest' open={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(<Modal title='Rest' open />);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('uses the alertdialog role for confirmations', async () => {
    render(<Modal title='Delete?' role='alertdialog' defaultOpen />);
    expect(
      await screen.findByRole('alertdialog', { name: 'Delete?' }),
    ).toBeInTheDocument();
  });

  it('portals into the environment container', async () => {
    const box = document.createElement('div');
    document.body.append(box);
    render(
      <ArkheEnvironment container={box}>
        <Modal title='Rest' defaultOpen />
      </ArkheEnvironment>,
    );
    await screen.findByRole('dialog');
    expect(box.querySelector('[role="dialog"]')).not.toBeNull();
    box.remove();
  });

  it('keeps aria-describedby in step with the description while open', async () => {
    const { rerender } = render(<Modal title='Rest' open description='D1' />);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(dialog).toHaveAccessibleDescription('D1'));
    rerender(<Modal title='Rest' open />);
    expect(dialog).not.toHaveAttribute('aria-describedby');
    rerender(<Modal title='Rest' open description='Loaded' />);
    expect(dialog).toHaveAccessibleDescription('Loaded');
  });

  it('returns focus to finalFocus when the opener is gone', async () => {
    const fallback = document.createElement('button');
    document.body.append(fallback);
    render(<Modal title='Rest' defaultOpen finalFocus={() => fallback} />);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(fallback).toHaveFocus());
    fallback.remove();
  });

  it('returns focus to the nearest row when the opener row is gone', async () => {
    const Rows = () => {
      const [rows, setRows] = useState(['a', 'b']);
      const [open, setOpen] = useState(false);
      return (
        <>
          {rows.map((row) => (
            <div key={row}>
              <button onClick={() => setOpen(true)}>Delete {row}</button>
            </div>
          ))}
          <Modal title='Sure?' open={open} onOpenChange={setOpen}>
            <button
              onClick={() => {
                setRows((all) => all.slice(1));
                setOpen(false);
              }}>
              Confirm
            </button>
          </Modal>
        </>
      );
    };
    render(<Rows />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete a' }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Confirm' }),
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Delete b' })).toHaveFocus(),
    );
  });

  it('hides the rest of a shadow-root app while open', async () => {
    const { host, shadow, app, container } = shadowApp();
    const { unmount } = render(
      <ArkheEnvironment rootNode={() => shadow} container={container}>
        <Modal title='Rest' defaultOpen />
      </ArkheEnvironment>,
    );
    await waitFor(() =>
      expect(container.querySelector('[role="dialog"]')).not.toBeNull(),
    );
    await waitFor(() => expect(app).toHaveAttribute('aria-hidden', 'true'));
    expect(container).not.toHaveAttribute('aria-hidden');
    unmount();
    expect(app).not.toHaveAttribute('aria-hidden');
    host.remove();
  });
});
