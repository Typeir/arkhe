import { Picker } from '@arkhe/svelte';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const SPELLS = [
  { value: 'fireball', label: 'Fireball' },
  { value: 'frost', label: 'Frost ray' },
];

describe('Picker', () => {
  it('reports each choice, a repeat too, and empties itself', async () => {
    const onSelect = vi.fn();
    render(Picker, { label: 'Learn spell', items: SPELLS, onSelect });
    const input = screen.getByRole('combobox', { name: 'Learn spell' });
    for (let round = 0; round < 2; round += 1) {
      await userEvent.type(input, 'fire');
      await userEvent.click(
        await screen.findByRole('option', { name: 'Fireball' }),
      );
      expect(input).toHaveValue('');
    }
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenLastCalledWith(SPELLS[0]);
  });
});
