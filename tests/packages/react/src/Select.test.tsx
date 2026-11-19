import { Picker, Search, Select } from '@arkhe/react';
import { resetNarrow, setNarrow } from '@tests/fixtures/narrow';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const SPELLS = [
  { value: 'fireball', label: 'Fireball' },
  { value: 'frost', label: 'Frost ray' },
];

const Controlled = ({ searchable }: { searchable?: boolean }) => {
  const [value, setValue] = useState<string | null>('frost');
  return (
    <>
      <Select
        label='Spell'
        items={SPELLS}
        value={value}
        onValueChange={setValue}
        searchable={searchable}
      />
      <output>held {String(value)}</output>
    </>
  );
};

describe('Select', () => {
  it('renders a button by default and an input when searchable', () => {
    const { unmount } = render(<Select label='Spell' items={SPELLS} />);
    expect(screen.getByRole('combobox', { name: 'Spell' }).tagName).toBe(
      'BUTTON',
    );
    unmount();
    render(<Select label='Spell' items={SPELLS} searchable />);
    expect(screen.getByRole('combobox', { name: 'Spell' }).tagName).toBe(
      'INPUT',
    );
  });

  it.each([false, true])(
    'follows a controlled value; searchable: %s',
    async (searchable) => {
      render(<Controlled searchable={searchable} />);
      const control = screen.getByRole('combobox');
      await waitFor(() =>
        expect(
          searchable
            ? (control as HTMLInputElement).value
            : control.textContent,
        ).toBe('Frost ray'),
      );
      await userEvent.click(control);
      await userEvent.click(
        await screen.findByRole('option', { name: 'Fireball' }),
      );
      expect(await screen.findByText('held fireball')).toBeInTheDocument();
    },
  );

  it('filters only when searchable', async () => {
    render(<Select label='Spell' items={SPELLS} searchable />);
    await userEvent.type(screen.getByRole('combobox'), 'fro');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
  });

  it('submits the searchable choice through a hidden input', () => {
    const { container } = render(
      <Select
        label='Spell'
        items={SPELLS}
        searchable
        name='spell'
        required
        defaultValue='frost'
      />,
    );
    const hidden = container.querySelector('input[type="hidden"]');
    expect(hidden).toHaveAttribute('name', 'spell');
    expect(hidden).toHaveValue('frost');
    expect(screen.getByRole('combobox', { name: 'Spell' })).toBeRequired();
  });

  it('gives its hidden native select an autofill hint', () => {
    const { container } = render(
      <Select label='Spell' items={SPELLS} name='spell' autoComplete='off' />,
    );
    expect(container.querySelector('select')).toHaveAttribute(
      'autocomplete',
      'off',
    );
  });
});

describe('Select family at phone width', () => {
  beforeEach(() => setNarrow(true));
  afterEach(resetNarrow);

  it('Select opens a sheet with a search box; choosing closes it and shows the choice', async () => {
    const onValueChange = vi.fn();
    render(
      <Select
        label='Spell'
        items={SPELLS}
        emptyLabel='Any'
        onValueChange={onValueChange}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Spell Any' });
    await userEvent.click(trigger);
    const sheet = await screen.findByRole('dialog', { name: 'Spell' });
    const input = within(sheet).getByRole('combobox', { name: 'Spell' });
    await userEvent.click(input);
    expect(input).toHaveValue('');
    fireEvent.change(input, { target: { value: 'fro' } });
    await userEvent.click(
      await within(sheet).findByRole('option', { name: 'Frost ray' }),
    );
    expect(onValueChange).toHaveBeenLastCalledWith('frost');
    await waitFor(() => expect(sheet).not.toBeVisible());
    expect(
      screen.getByRole('button', { name: 'Spell Frost ray' }),
    ).toBeInTheDocument();
  });

  it('Picker keeps its sheet open while choices are added', async () => {
    const onSelect = vi.fn();
    render(<Picker label='Learn' items={SPELLS} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /Learn/ }));
    const sheet = await screen.findByRole('dialog', { name: 'Learn' });
    await userEvent.click(within(sheet).getByRole('combobox'));
    await userEvent.click(
      await within(sheet).findByRole('option', { name: 'Fireball' }),
    );
    expect(onSelect).toHaveBeenCalledWith(SPELLS[0]);
    expect(sheet).toBeVisible();
  });

  it('Search closes its sheet on submit', async () => {
    const onSubmit = vi.fn();
    render(
      <Search
        label='Find'
        items={SPELLS}
        onInputChange={() => undefined}
        onSubmit={onSubmit}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Find/ }));
    const sheet = await screen.findByRole('dialog', { name: 'Find' });
    const input = within(sheet).getByRole('combobox');
    await userEvent.click(input);
    fireEvent.change(input, { target: { value: 'ember' } });
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('ember');
    await waitFor(() => expect(sheet).not.toBeVisible());
  });
});
