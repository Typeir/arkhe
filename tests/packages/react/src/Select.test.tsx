import { Select } from '@arkhe/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

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
});
