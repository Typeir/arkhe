import { Menu } from '@arkhe/react';
import type { MenuEntry } from '@arkhe/core';
import { render, screen, waitFor } from '@testing-library/react';
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
    render(<Menu trigger='Actions' items={ITEMS} onSelect={() => undefined} />);
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await screen.findByRole('menu');
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute(
      'data-danger',
      '',
    );
  });

  it('reports a clicked action and closes', async () => {
    const onSelect = vi.fn();
    render(<Menu trigger='Actions' items={ITEMS} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Duplicate' }),
    );
    expect(onSelect).toHaveBeenCalledWith('copy');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('moves with arrow keys and selects with Enter', async () => {
    const onSelect = vi.fn();
    render(<Menu trigger='Actions' items={ITEMS} onSelect={onSelect} />);
    screen.getByRole('button', { name: 'Actions' }).focus();
    await userEvent.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    await waitFor(() => expect(menu).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith('copy'));
  });

  it('skips disabled actions', async () => {
    const onSelect = vi.fn();
    render(<Menu trigger='Actions' items={ITEMS} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Locked' }),
    );
    expect(onSelect).not.toHaveBeenCalled();
  });
});
