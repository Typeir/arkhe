import { Popover } from '@arkhe/svelte';
import BoundState from '@tests/fixtures/svelte/BoundState.svelte';
import { renderWithProvider } from '@tests/fixtures/svelte/renderWithProvider';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const held = () => screen.getByText(/^held /).textContent;

describe('Popover', () => {
  it('toggles a titled panel from its button', async () => {
    const onOpenChange = vi.fn();
    render(Popover, {
      trigger: 'Filters',
      title: 'Filter by',
      onOpenChange,
      children: textSnippet('Body'),
    });
    const trigger = screen.getByRole('button', { name: 'Filters' });
    await userEvent.click(trigger);
    const panel = await screen.findByRole('dialog', { name: 'Filter by' });
    expect(panel).toHaveTextContent('Body');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it('closes on Escape and returns focus', async () => {
    render(Popover, { trigger: 'Filters', title: 'Filter by' });
    const trigger = screen.getByRole('button', { name: 'Filters' });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('closes from the labelled close button', async () => {
    renderWithProvider({ labels: { close: 'Sulje' } }, Popover, {
      trigger: 'Filters',
      defaultOpen: true,
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Sulje' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('names an untitled panel after its trigger', async () => {
    render(Popover, { trigger: 'Sort', children: textSnippet('Body') });
    await userEvent.click(screen.getByRole('button', { name: 'Sort' }));
    const panel = await screen.findByRole('dialog', { name: 'Sort' });
    expect(panel).not.toHaveAttribute('aria-labelledby');
  });

  it.each([false, true])(
    'binds open; refused by a function binding: %s',
    async (refuse) => {
      render(BoundState, { kind: 'popover', refuse });
      await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
      if (!refuse) await screen.findByRole('dialog', { name: 'Filter by' });
      expect(held()).toBe(`held ${!refuse}`);
      expect(screen.queryByRole('dialog') !== null).toBe(!refuse);
    },
  );
});
