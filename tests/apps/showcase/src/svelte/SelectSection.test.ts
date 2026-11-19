import { render, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import SelectSection from '../../../../../apps/showcase/src/svelte/SelectSection.svelte';

describe('Svelte SelectSection', () => {
  it('shows the select family', () => {
    render(SelectSection);
    for (const name of ['School', 'Spell', 'Learn spell', 'Search', 'Rune']) {
      expect(screen.getByRole('combobox', { name })).toBeInTheDocument();
    }
    const runes = screen.getByRole('list', { name: 'Runes' });
    expect(within(runes).getAllByRole('listitem')).toHaveLength(8);
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

  it('asks the search request and reports searched text', async () => {
    render(SelectSection);
    const input = screen.getByRole('combobox', { name: 'Search' });
    await userEvent.type(input, 'gob');
    expect(
      await screen.findByRole('option', { name: /Goblin/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Ward/ })).toBeNull();
    await userEvent.clear(input);
    await userEvent.type(input, 'ember{Enter}');
    expect(screen.getByText('Searched: ember')).toBeInTheDocument();
  });
});
