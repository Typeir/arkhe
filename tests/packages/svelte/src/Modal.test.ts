import { Modal } from '@arkhe/svelte';
import BoundState from '@tests/fixtures/svelte/BoundState.svelte';
import ShadowModal from '@tests/fixtures/svelte/ShadowModal.svelte';
import { renderWithProvider } from '@tests/fixtures/svelte/renderWithProvider';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { render, screen, waitFor } from '@testing-library/svelte';
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

const held = () => screen.getByText(/^held /).textContent;

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

  it('keeps aria-describedby in step with the description while open', async () => {
    const { rerender } = render(Modal, {
      title: 'Rest',
      open: true,
      description: 'D1',
    });
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(dialog).toHaveAccessibleDescription('D1'));
    await rerender({ description: undefined });
    expect(dialog).not.toHaveAttribute('aria-describedby');
    await rerender({ description: 'Loaded' });
    expect(dialog).toHaveAccessibleDescription('Loaded');
  });

  it('returns focus to finalFocus when the opener is gone', async () => {
    const fallback = document.createElement('button');
    document.body.append(fallback);
    render(Modal, {
      title: 'Rest',
      defaultOpen: true,
      finalFocus: () => fallback,
    });
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(fallback).toHaveFocus());
    fallback.remove();
  });

  it('hides the rest of a shadow-root app while open', async () => {
    const { host, shadow, app, container } = shadowApp();
    const { unmount } = render(ShadowModal, { shadow, container });
    await waitFor(() =>
      expect(container.querySelector('[role="dialog"]')).not.toBeNull(),
    );
    await waitFor(() => expect(app).toHaveAttribute('aria-hidden', 'true'));
    expect(container).not.toHaveAttribute('aria-hidden');
    unmount();
    expect(app).not.toHaveAttribute('aria-hidden');
    host.remove();
  });

  it.each([false, true])(
    'binds open; refused by a function binding: %s',
    async (refuse) => {
      render(BoundState, { kind: 'modal', refuse });
      await userEvent.click(screen.getByRole('button', { name: 'Rest' }));
      if (!refuse) await screen.findByRole('dialog', { name: 'Rest' });
      expect(held()).toBe(`held ${!refuse}`);
      expect(screen.queryByRole('dialog') !== null).toBe(!refuse);
    },
  );
});
