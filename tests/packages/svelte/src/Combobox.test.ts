import { Combobox } from '@arkhe/svelte';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const SPELLS = [
  { value: 'fireball', label: 'Fireball', description: 'Level 3' },
  { value: 'frost', label: 'Frost ray', description: 'Level 1' },
  { value: 'paa', label: 'Pää' },
  { value: 'ward', label: 'Ward', disabled: true },
];

const names = () =>
  screen.getAllByRole('option').map((option) => option.textContent?.trim());

describe('Combobox', () => {
  it('opens on click and filters as you type, ignoring accents', async () => {
    render(Combobox, { label: 'Spell', items: SPELLS });
    const input = screen.getByRole('combobox', { name: 'Spell' });
    await userEvent.click(input);
    expect(await screen.findAllByRole('option')).toHaveLength(4);
    await userEvent.type(input, 'paa');
    await waitFor(() => expect(names()).toEqual(['Pää']));
  });

  it('keeps the chosen label as a searchable select', async () => {
    const onValueChange = vi.fn();
    render(Combobox, { label: 'Spell', items: SPELLS, onValueChange });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'fro');
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('frost');
    expect(input).toHaveValue('Frost ray');
  });

  it('reports every pick and empties itself in picker mode', async () => {
    const onSelect = vi.fn();
    render(Combobox, {
      label: 'Add spell',
      items: SPELLS,
      clearOnSelect: true,
      onSelect,
    });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'fire');
    await userEvent.click(
      await screen.findByRole('option', { name: /Fireball/ }),
    );
    expect(onSelect).toHaveBeenCalledWith(SPELLS[0]);
    expect(input).toHaveValue('');
  });

  it('completes the highlighted option on Tab', async () => {
    render(Combobox, { label: 'Spell', items: SPELLS });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'fr');
    await userEvent.keyboard('{Tab}');
    expect(input).toHaveValue('Frost ray');
    expect(input).toHaveFocus();
  });

  it('submits free text on Enter in search mode', async () => {
    const onSubmit = vi.fn();
    render(Combobox, {
      label: 'Search',
      items: SPELLS,
      filter: false,
      onSubmit,
    });
    await userEvent.type(screen.getByRole('combobox'), 'burning{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('burning');
  });

  it('says when nothing matches', async () => {
    render(Combobox, { label: 'Spell', items: SPELLS });
    await userEvent.type(screen.getByRole('combobox'), 'qqq');
    expect(await screen.findByText('No matches.')).toBeInTheDocument();
  });

  it('shows group headings', async () => {
    render(Combobox, {
      label: 'Search',
      items: [
        { value: 'a', label: 'Fireball', group: 'Fire spells' },
        { value: 'b', label: 'Goblin', group: 'Creatures' },
      ],
    });
    await userEvent.click(screen.getByRole('combobox'));
    expect(
      await screen.findByRole('group', { name: 'Fire spells' }),
    ).toBeInTheDocument();
  });
});
