import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ComboboxSection } from '../../../../../apps/showcase/src/react/ComboboxSection';

describe('React ComboboxSection', () => {
  it('shows the three combobox jobs', () => {
    render(<ComboboxSection />);
    for (const name of ['Spell', 'Learn spell', 'Search']) {
      expect(screen.getByRole('combobox', { name })).toBeInTheDocument();
    }
  });

  it('adds picked spells to the known list', async () => {
    render(<ComboboxSection />);
    const input = screen.getByRole('combobox', { name: 'Learn spell' });
    await userEvent.click(input);
    fireEvent.change(input, { target: { value: 'w' } });
    await userEvent.click(await screen.findByRole('option', { name: /Ward/ }));
    expect(screen.getByText('Known: Ward')).toBeInTheDocument();
  });

  it('reports searched text', async () => {
    render(<ComboboxSection />);
    const input = screen.getByRole('combobox', { name: 'Search' });
    await userEvent.click(input);
    fireEvent.change(input, { target: { value: 'ember' } });
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('Searched: ember')).toBeInTheDocument();
  });
});
