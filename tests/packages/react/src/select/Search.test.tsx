import { Search } from '@arkhe/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const RESULTS = [
  { value: 'fireball', label: 'Fireball', group: 'Spells' },
  { value: 'goblin', label: 'Goblin', group: 'Creatures' },
];

describe('Search at request time', () => {
  it('asks the host with the typed text, shows its answer, and never re-asks on a choice', async () => {
    const search = vi.fn(async (query: string) =>
      RESULTS.filter((result) => result.label.toLowerCase().includes(query)),
    );
    const onSelect = vi.fn();
    render(
      <Search
        label='Search'
        search={search}
        debounce={0}
        onSelect={onSelect}
      />,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    fireEvent.change(input, { target: { value: 'gob' } });
    expect(
      await screen.findByRole('option', { name: 'Goblin' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Fireball' })).toBeNull();
    expect(search).toHaveBeenLastCalledWith('gob', expect.any(AbortSignal));
    const asked = search.mock.calls.length;
    await userEvent.click(screen.getByRole('option', { name: 'Goblin' }));
    expect(onSelect).toHaveBeenCalledWith(RESULTS[1]);
    expect(search).toHaveBeenCalledTimes(asked);
  });

  it('dims the last results while a newer query runs', async () => {
    let release: () => void = () => undefined;
    const search = vi.fn((query: string) =>
      query === 'gob'
        ? Promise.resolve(RESULTS.slice(1))
        : new Promise<typeof RESULTS>((resolve) => {
            release = () => resolve(RESULTS);
          }),
    );
    render(<Search label='Search' search={search} debounce={0} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    fireEvent.change(input, { target: { value: 'gob' } });
    await screen.findByRole('option', { name: 'Goblin' });
    const list = screen.getByRole('listbox');
    expect(list).not.toHaveAttribute('data-stale');
    fireEvent.change(input, { target: { value: 'f' } });
    await waitFor(() => expect(list).toHaveAttribute('data-stale'));
    expect(list).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('option', { name: 'Goblin' })).toBeInTheDocument();
    release();
    await screen.findByRole('option', { name: 'Fireball' });
    expect(list).not.toHaveAttribute('data-stale');
  });

  it('says when the request fails', async () => {
    render(
      <Search
        label='Search'
        search={() => Promise.reject(new Error('down'))}
        debounce={0}
      />,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    fireEvent.change(input, { target: { value: 'x' } });
    await waitFor(() =>
      expect(
        document.querySelector('[data-part="note"] [data-kind="error"]'),
      ).toHaveTextContent('Something went wrong.'),
    );
  });
});

describe('Search', () => {
  it('shows the host results unfiltered, grouped, and hands over the text', async () => {
    const onInputChange = vi.fn();
    render(
      <Search label='Search' items={RESULTS} onInputChange={onInputChange} />,
    );
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
    render(
      <Search
        label='Search'
        items={RESULTS}
        onInputChange={() => undefined}
        onSubmit={onSubmit}
        onSelect={onSelect}
      />,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    fireEvent.change(input, { target: { value: 'burning' } });
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('burning');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith(RESULTS[0]);
  });

  it('is a search landmark whose Enter key reads search', () => {
    render(<Search label='Find' items={RESULTS} />);
    const input = screen.getByRole('combobox', { name: 'Find' });
    expect(input.closest('search')).not.toBeNull();
    expect(input).toHaveAttribute('enterkeyhint', 'search');
  });
});
