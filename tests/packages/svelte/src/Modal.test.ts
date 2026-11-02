import { Modal } from '@arkhe/svelte';
import { renderWithProvider } from '@tests/fixtures/svelte/renderWithProvider';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('Modal', () => {
  it('opens from its trigger, named and described', async () => {
    render(Modal, {
      title: 'Rest',
      description: 'Recover your charges.',
      trigger: 'Rest',
      children: textSnippet('Body'),
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Rest' }));
    const dialog = await screen.findByRole('dialog', { name: 'Rest' });
    expect(dialog).toHaveAccessibleDescription('Recover your charges.');
    expect(dialog).toHaveTextContent('Body');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const onOpenChange = vi.fn();
    render(Modal, { title: 'Rest', trigger: 'Open', onOpenChange });
    const trigger = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('closes from the labelled close button', async () => {
    renderWithProvider({ labels: { close: 'Sulje' } }, Modal, {
      title: 'Rest',
      defaultOpen: true,
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Sulje' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('uses the alertdialog role for confirmations', async () => {
    render(Modal, { title: 'Delete?', role: 'alertdialog', defaultOpen: true });
    expect(
      await screen.findByRole('alertdialog', { name: 'Delete?' }),
    ).toBeInTheDocument();
  });
});
