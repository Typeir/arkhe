import { sizeBox } from '@tests/fixtures/scrollBox';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SelectMenu from '../../../../packages/svelte/src/SelectMenu.svelte';

const MANY = Array.from({ length: 200 }, (_, at) => ({
  value: `v${at}`,
  label: `Rune ${at + 1}`,
}));

const SIZES = [
  { value: 'small', label: 'Small', description: 'Fits a pocket' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large', disabled: true },
];

const hidden = (container: HTMLElement) =>
  container.querySelector('select') as HTMLSelectElement;

describe('SelectMenu', () => {
  it('shows the placeholder until a click on an option chooses it', async () => {
    const onValueChange = vi.fn();
    const { container } = render(SelectMenu, {
      label: 'Size',
      items: SIZES,
      placeholder: 'Any size',
      onValueChange,
    });
    const trigger = screen.getByRole('combobox', { name: 'Size' });
    expect(trigger).toHaveTextContent('Any size');
    expect(trigger).toHaveAttribute('data-placeholder-shown');
    await userEvent.click(trigger);
    await userEvent.click(
      await screen.findByRole('option', { name: /Medium/ }),
    );
    expect(onValueChange).toHaveBeenLastCalledWith('medium');
    await waitFor(() => expect(trigger).toHaveTextContent('Medium'));
    expect(hidden(container)).toHaveValue('medium');
  });

  it('chooses from the keyboard and skips disabled options', async () => {
    render(SelectMenu, { label: 'Size', items: SIZES });
    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{Enter}');
    const list = await screen.findByRole('listbox');
    await waitFor(() => expect(list).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');
    await waitFor(() =>
      expect(screen.getByRole('combobox')).toHaveTextContent('Medium'),
    );
  });

  it('names its hidden native select for forms', () => {
    const { container } = render(SelectMenu, {
      label: 'Size',
      items: SIZES,
      name: 'size',
      defaultValue: 'small',
    });
    expect(hidden(container)).toHaveAttribute('name', 'size');
    expect(hidden(container)).toHaveValue('small');
    expect(hidden(container)).toHaveAttribute('aria-hidden', 'true');
  });

  it('offers an empty option that reports no choice', async () => {
    const onValueChange = vi.fn();
    render(SelectMenu, {
      label: 'Size',
      items: SIZES,
      emptyLabel: 'All',
      defaultValue: 'small',
      onValueChange,
    });
    const trigger = screen.getByRole('combobox', { name: 'Size' });
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('option', { name: 'All' }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    await waitFor(() => expect(trigger).toHaveTextContent('All'));
  });

  it('takes a size, a hidden label and option icons', async () => {
    const { container } = render(SelectMenu, {
      label: 'Size',
      items: [{ value: 'a', label: 'Ward', icon: 'info' }],
      size: 's',
      labelHidden: true,
    });
    const root = container.querySelector('[data-part="root"]');
    expect(root).toHaveAttribute('data-size', 's');
    expect(root).toHaveAttribute('data-label-hidden', '');
    expect(screen.getByRole('combobox', { name: 'Size' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox'));
    const option = await screen.findByRole('option', { name: 'Ward' });
    expect(option.querySelector('[data-name="info"]')).not.toBeNull();
  });

  it('shows group headings', async () => {
    render(SelectMenu, {
      label: 'Spell',
      items: [
        { value: 'a', label: 'Fireball', group: 'Fire' },
        { value: 'b', label: 'Frost ray', group: 'Cold' },
      ],
    });
    await userEvent.click(screen.getByRole('combobox'));
    expect(
      await screen.findByRole('group', { name: 'Fire' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Cold' })).toBeInTheDocument();
  });

  it('draws the rows in view of a long list and scrolls the highlight into it', async () => {
    render(SelectMenu, { label: 'Rune', items: MANY, rowPitch: 2 });
    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{Enter}');
    const list = await screen.findByRole('listbox');
    await waitFor(() => expect(list).toHaveFocus());
    expect(list).toHaveAttribute('data-virtual', '');
    expect(within(list).getAllByRole('option')).toHaveLength(8);
    sizeBox(list, 320);
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(list.scrollTop).toBe(6080));
    await fireEvent.scroll(list);
    expect(
      within(list).getByRole('option', { name: 'Rune 200' }),
    ).toHaveAttribute('aria-setsize', '200');
  });

  it('keeps only the chosen option in the hidden select of a long list', () => {
    const { container } = render(SelectMenu, {
      label: 'Rune',
      items: MANY,
      rowPitch: 2,
      name: 'rune',
      defaultValue: 'v150',
    });
    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select.options).toHaveLength(2);
    expect(select).toHaveValue('v150');
  });
});
