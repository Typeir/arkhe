import { sizeBox } from '@tests/fixtures/scrollBox';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import ComboboxField from '../../../../packages/svelte/src/ComboboxField.svelte';

const SPELLS = [
  { value: 'fireball', label: 'Fireball', group: 'Fire' },
  { value: 'frost', label: 'Frost ray', group: 'Cold' },
];

const MANY = Array.from({ length: 200 }, (_, at) => ({
  value: `v${at}`,
  label: `Rune ${at + 1}`,
}));

describe('ComboboxList', () => {
  it('renders in place and open when inline, without a dropdown button', () => {
    const { container } = render(ComboboxField, {
      label: 'Spell',
      items: SPELLS,
      inline: true,
    });
    const list = screen.getByRole('listbox');
    expect(container.contains(list)).toBe(true);
    expect(list).toHaveAttribute('data-inline', '');
    expect(screen.getByRole('group', { name: 'Fire' })).toBeInTheDocument();
    expect(
      container.querySelector('[data-scope="combobox"][data-part="trigger"]'),
    ).toBeNull();
  });

  it('shows the note in place of the list', async () => {
    render(ComboboxField, { label: 'Spell', items: SPELLS, inline: true });
    await userEvent.type(screen.getByRole('combobox'), 'qqq');
    expect(await screen.findByText('No matches.')).toBeVisible();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('draws the rows in view of a long flat list and scrolls the highlight into it', async () => {
    render(ComboboxField, { label: 'Rune', items: MANY, rowPitch: 2 });
    await userEvent.click(screen.getByRole('combobox'));
    const list = await screen.findByRole('listbox');
    expect(list).toHaveAttribute('data-virtual', '');
    const options = within(list).getAllByRole('option');
    expect(options).toHaveLength(8);
    expect(options[0]).toHaveAttribute('aria-setsize', '200');
    sizeBox(list, 320);
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(list.scrollTop).toBe(6080));
    await fireEvent.scroll(list);
    expect(
      within(list).getByRole('option', { name: 'Rune 200' }),
    ).toHaveAttribute('aria-posinset', '200');
  });

  it('draws a grouped list whole even with a row pitch', () => {
    render(ComboboxField, {
      label: 'Spell',
      items: SPELLS,
      rowPitch: 2,
      inline: true,
    });
    expect(screen.getByRole('listbox')).not.toHaveAttribute('data-virtual');
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });
});
