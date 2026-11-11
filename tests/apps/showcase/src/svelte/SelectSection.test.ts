import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import SelectSection from '../../../../../apps/showcase/src/svelte/SelectSection.svelte';

describe('Svelte SelectSection', () => {
  it('shows the select family', () => {
    render(SelectSection);
    for (const name of ['School', 'Spell', 'Learn spell', 'Search']) {
      expect(screen.getByRole('combobox', { name })).toBeInTheDocument();
    }
  });

  it('reports the chosen school', async () => {
    render(SelectSection);
    await userEvent.click(screen.getByRole('combobox', { name: 'School' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'Illusion' }),
    );
    await waitFor(() =>
      expect(screen.getByText('School: illusion')).toBeInTheDocument(),
    );
  });

  it('adds picked spells to the known list', async () => {
    render(SelectSection);
    await userEvent.type(
      screen.getByRole('combobox', { name: 'Learn spell' }),
      'ward',
    );
    await userEvent.click(await screen.findByRole('option', { name: /Ward/ }));
    expect(screen.getByText('Known: Ward')).toBeInTheDocument();
  });

  it('filters search results here and reports searched text', async () => {
    render(SelectSection);
    const input = screen.getByRole('combobox', { name: 'Search' });
    await userEvent.type(input, 'gob');
    await waitFor(() =>
      expect(screen.queryByRole('option', { name: /Ward/ })).toBeNull(),
    );
    expect(screen.getByRole('option', { name: /Goblin/ })).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, 'ember{Enter}');
    expect(screen.getByText('Searched: ember')).toBeInTheDocument();
  });
});
