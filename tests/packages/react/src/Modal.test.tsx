import { ArkheEnvironment, ArkheProvider, Modal } from '@arkhe/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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
});
