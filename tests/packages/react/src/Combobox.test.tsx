import { Combobox } from '@arkhe/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const SPELLS = [
  { value: 'fireball', label: 'Fireball', description: 'Level 3' },
  { value: 'frost', label: 'Frost ray', description: 'Level 1' },
  { value: 'paa', label: 'Pää' },
  { value: 'ward', label: 'Ward', disabled: true },
];

function enter(input: HTMLElement, text: string) {
  for (let end = 1; end <= text.length; end += 1) {
    fireEvent.change(input, { target: { value: text.slice(0, end) } });
  }
}

const names = () =>
  screen.getAllByRole('option').map((option) => option.textContent);

describe('Combobox', () => {
  it('opens on click and filters as you type, ignoring accents', async () => {
    render(<Combobox label='Spell' items={SPELLS} />);
    const input = screen.getByRole('combobox', { name: 'Spell' });
    await userEvent.click(input);
    expect(await screen.findAllByRole('option')).toHaveLength(4);
    await userEvent.type(input, 'paa');
    await waitFor(() => expect(names()).toEqual(['Pää']));
  });

  it('keeps the chosen label as a searchable select', async () => {
    const onValueChange = vi.fn();
    render(
      <Combobox label='Spell' items={SPELLS} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'fro');
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('frost');
    expect(input).toHaveValue('Frost ray');
  });

  it('reports every pick and empties itself in picker mode', async () => {
    const onSelect = vi.fn();
    render(
      <Combobox
        label='Add spell'
        items={SPELLS}
        clearOnSelect
        onSelect={onSelect}
      />,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    enter(input, 'fire');
    await userEvent.click(
      await screen.findByRole('option', { name: /Fireball/ }),
    );
    expect(onSelect).toHaveBeenCalledWith(SPELLS[0]);
    expect(input).toHaveValue('');
  });

  it('completes the highlighted option on Tab, then lets Tab leave', async () => {
    render(
      <>
        <Combobox label='Spell' items={SPELLS} />
        <button type='button'>Next</button>
      </>,
    );
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'fr');
    await userEvent.keyboard('{Tab}');
    expect(input).toHaveValue('Frost ray');
    expect(input).toHaveFocus();
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-expanded', 'false'),
    );
    await userEvent.tab();
    expect(input).not.toHaveFocus();
  });

  it('submits free text on Enter in search mode', async () => {
    const onSubmit = vi.fn();
    render(
      <Combobox
        label='Search'
        items={SPELLS}
        filter={false}
        onSubmit={onSubmit}
      />,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    enter(input, 'burning');
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('burning');
  });

  it('hands typing to a host that filters', async () => {
    const onInputChange = vi.fn();
    render(
      <Combobox
        label='Search'
        items={SPELLS.slice(0, 1)}
        filter={false}
        onInputChange={onInputChange}
      />,
    );
    await userEvent.type(screen.getByRole('combobox'), 'zz');
    expect(onInputChange).toHaveBeenLastCalledWith('zz');
    expect(names()).toEqual(['FireballLevel 3']);
  });

  it('says when nothing matches and when results are loading, outside the listbox', async () => {
    const { rerender } = render(<Combobox label='Spell' items={SPELLS} />);
    await userEvent.type(screen.getByRole('combobox'), 'qqq');
    const empty = await screen.findByText('No matches.');
    expect(empty.closest('[role="listbox"]')).toBeNull();
    rerender(<Combobox label='Spell' items={SPELLS} loading />);
    const loading = await screen.findByText('Loading…');
    expect(loading.closest('[role="listbox"]')).toBeNull();
  });

  it('shows group headings', async () => {
    const grouped = [
      { value: 'a', label: 'Fireball', group: 'Fire spells' },
      { value: 'b', label: 'Goblin', group: 'Creatures' },
    ];
    render(<Combobox label='Search' items={grouped} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(
      await screen.findByRole('group', { name: 'Fire spells' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Creatures' }),
    ).toBeInTheDocument();
  });
});
