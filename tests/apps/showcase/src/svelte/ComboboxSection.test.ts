import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import ComboboxSection from '../../../../../apps/showcase/src/svelte/ComboboxSection.svelte';

describe('Svelte ComboboxSection', () => {
  it('shows the three combobox jobs', () => {
    render(ComboboxSection);
    for (const name of ['Spell', 'Learn spell', 'Search']) {
      expect(screen.getByRole('combobox', { name })).toBeInTheDocument();
    }
  });

  it('adds picked spells to the known list', async () => {
    render(ComboboxSection);
    await userEvent.type(
      screen.getByRole('combobox', { name: 'Learn spell' }),
      'ward',
    );
    await userEvent.click(await screen.findByRole('option', { name: /Ward/ }));
    expect(screen.getByText('Known: Ward')).toBeInTheDocument();
  });

  it('reports searched text', async () => {
    render(ComboboxSection);
    await userEvent.type(
      screen.getByRole('combobox', { name: 'Search' }),
      'ember{Enter}',
    );
    expect(screen.getByText('Searched: ember')).toBeInTheDocument();
  });
});
