import { Picker, Search, Select } from '@arkhe/svelte';
import { render, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { resetNarrow, setNarrow } from '@tests/fixtures/narrow';
import BoundState from '@tests/fixtures/svelte/BoundState.svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const SPELLS = [
  { value: 'fireball', label: 'Fireball' },
  { value: 'frost', label: 'Frost ray' },
];

const held = () => screen.getByText(/^held /).textContent;

describe('Select', () => {
  it('renders a button by default and an input when searchable', () => {
    const { unmount } = render(Select, { label: 'Spell', items: SPELLS });
    expect(screen.getByRole('combobox', { name: 'Spell' }).tagName).toBe(
      'BUTTON',
    );
    unmount();
    render(Select, { label: 'Spell', items: SPELLS, searchable: true });
    expect(screen.getByRole('combobox', { name: 'Spell' }).tagName).toBe(
      'INPUT',
    );
  });

  it('filters only when searchable', async () => {
    render(Select, { label: 'Spell', items: SPELLS, searchable: true });
    await userEvent.type(screen.getByRole('combobox'), 'fro');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
  });

  it.each([
    ['select', false, 'spells'],
    ['select', true, 'null'],
    ['search-select', false, 'spells'],
    ['search-select', true, 'null'],
  ] as const)(
    'binds the value through %s; refused by a function binding: %s',
    async (kind, refuse, kept) => {
      render(BoundState, { kind, refuse });
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(
        await screen.findByRole('option', { name: 'Spells' }),
      );
      await waitFor(() => expect(held()).toBe(`held ${kept}`));
    },
  );

  it('submits the searchable choice through a hidden input', () => {
    const { container } = render(Select, {
      label: 'Spell',
      items: SPELLS,
      searchable: true,
      name: 'spell',
      required: true,
      defaultValue: 'frost',
    });
    const hidden = container.querySelector('input[type="hidden"]');
    expect(hidden).toHaveAttribute('name', 'spell');
    expect(hidden).toHaveValue('frost');
    expect(screen.getByRole('combobox', { name: 'Spell' })).toBeRequired();
  });

  it('gives its hidden native select an autofill hint', () => {
    const { container } = render(Select, {
      label: 'Spell',
      items: SPELLS,
      name: 'spell',
      autoComplete: 'off',
    });
    expect(container.querySelector('select')).toHaveAttribute(
      'autocomplete',
      'off',
    );
  });

  it('is described by its hint, then marked invalid by its error', async () => {
    const { rerender } = render(Select, {
      label: 'Spell',
      items: SPELLS,
      hint: 'One at a time',
    });
    const trigger = screen.getByRole('combobox', { name: 'Spell' });
    expect(trigger).toHaveAccessibleDescription('One at a time');
    await rerender({ hint: undefined, error: 'Pick a spell' });
    expect(trigger).toHaveAccessibleDescription('Pick a spell');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
  });

  it('describes the searchable input the same way', () => {
    render(Select, {
      label: 'Spell',
      items: SPELLS,
      searchable: true,
      error: 'Pick a spell',
    });
    const input = screen.getByRole('combobox', { name: 'Spell' });
    expect(input).toHaveAccessibleDescription('Pick a spell');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Select family at phone width', () => {
  beforeEach(() => setNarrow(true));
  afterEach(resetNarrow);

  it('Select opens a sheet with a search box; choosing closes it and shows the choice', async () => {
    const onValueChange = vi.fn();
    render(Select, {
      label: 'Spell',
      items: SPELLS,
      emptyLabel: 'Any',
      onValueChange,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Spell Any' }));
    const sheet = await screen.findByRole('dialog', { name: 'Spell' });
    const input = within(sheet).getByRole('combobox', { name: 'Spell' });
    await userEvent.click(input);
    expect(input).toHaveValue('');
    await userEvent.type(input, 'fro');
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
    render(Picker, { label: 'Learn', items: SPELLS, onSelect });
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
    render(Search, {
      label: 'Find',
      items: SPELLS,
      onInputChange: () => undefined,
      onSubmit,
    });
    await userEvent.click(screen.getByRole('button', { name: /Find/ }));
    const sheet = await screen.findByRole('dialog', { name: 'Find' });
    await userEvent.type(within(sheet).getByRole('combobox'), 'ember{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('ember');
    await waitFor(() => expect(sheet).not.toBeVisible());
  });
});
