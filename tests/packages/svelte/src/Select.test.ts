import { Select } from '@arkhe/svelte';
import BoundState from '@tests/fixtures/svelte/BoundState.svelte';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

const SPELLS = [
  { value: 'fireball', label: 'Fireball' },
  { value: 'frost', label: 'Frost ray' },
];

const held = () => screen.getByText(/^held /).textContent;

describe('Select', () => {
  it('renders a button by default and an input when searchable', () => {
    const { unmount } = render(Select, { label: 'Spell', items: SPELLS });
    expect(screen.getByRole('combobox', { name: 'Spell' }).tagName).toBe(
      'BUTTON',
    );
    unmount();
    render(Select, { label: 'Spell', items: SPELLS, searchable: true });
    expect(screen.getByRole('combobox', { name: 'Spell' }).tagName).toBe(
      'INPUT',
    );
  });

  it('filters only when searchable', async () => {
    render(Select, { label: 'Spell', items: SPELLS, searchable: true });
    await userEvent.type(screen.getByRole('combobox'), 'fro');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
  });

  it.each([
    ['select', false, 'spells'],
    ['select', true, 'null'],
    ['search-select', false, 'spells'],
    ['search-select', true, 'null'],
  ] as const)(
    'binds the value through %s; refused by a function binding: %s',
    async (kind, refuse, kept) => {
      render(BoundState, { kind, refuse });
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(
        await screen.findByRole('option', { name: 'Spells' }),
      );
      await waitFor(() => expect(held()).toBe(`held ${kept}`));
    },
  );
});
