import { Search } from '@arkhe/svelte';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const RESULTS = [
  { value: 'fireball', label: 'Fireball', group: 'Spells' },
  { value: 'goblin', label: 'Goblin', group: 'Creatures' },
];

describe('Search', () => {
  it('shows the host results unfiltered, grouped, and hands over the text', async () => {
    const onInputChange = vi.fn();
    render(Search, { label: 'Search', items: RESULTS, onInputChange });
    await userEvent.type(screen.getByRole('combobox'), 'zz');
    expect(onInputChange).toHaveBeenLastCalledWith('zz');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2));
    expect(
      screen.getByRole('group', { name: 'Creatures' }),
    ).toBeInTheDocument();
  });

  it('submits the text on Enter and reports a chosen result', async () => {
    const onSubmit = vi.fn();
    const onSelect = vi.fn();
    render(Search, {
      label: 'Search',
      items: RESULTS,
      onInputChange: () => undefined,
      onSubmit,
      onSelect,
    });
    await userEvent.type(screen.getByRole('combobox'), 'burning{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('burning');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith(RESULTS[0]);
  });
});
