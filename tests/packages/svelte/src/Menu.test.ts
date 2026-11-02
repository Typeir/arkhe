import type { MenuEntry } from '@arkhe/core';
import { Menu } from '@arkhe/svelte';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const ITEMS: readonly MenuEntry[] = [
  { value: 'rename', label: 'Rename', icon: 'check' },
  { value: 'copy', label: 'Duplicate' },
  { value: 'locked', label: 'Locked', disabled: true },
  { separator: true },
  { value: 'delete', label: 'Delete', danger: true },
];

describe('Menu', () => {
  it('lists actions and separators', async () => {
    render(Menu, {
      trigger: 'Actions',
      items: ITEMS,
      onSelect: () => undefined,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await screen.findByRole('menu');
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('reports a clicked action and closes', async () => {
    const onSelect = vi.fn();
    render(Menu, { trigger: 'Actions', items: ITEMS, onSelect });
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Duplicate' }),
    );
    expect(onSelect).toHaveBeenCalledWith('copy');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('moves with arrow keys and selects with Enter', async () => {
    const onSelect = vi.fn();
    render(Menu, { trigger: 'Actions', items: ITEMS, onSelect });
    screen.getByRole('button', { name: 'Actions' }).focus();
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('menu');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith('copy');
  });
});
