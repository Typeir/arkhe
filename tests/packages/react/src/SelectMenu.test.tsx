import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { SelectMenu } from '../../../../packages/react/src/SelectMenu';

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
    const { container } = render(
      <SelectMenu
        label='Size'
        items={SIZES}
        placeholder='Any size'
        onValueChange={onValueChange}
      />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Size' });
    expect(trigger).toHaveTextContent('Any size');
    expect(trigger).toHaveAttribute('data-placeholder-shown');
    await userEvent.click(trigger);
    await userEvent.click(
      await screen.findByRole('option', { name: /Medium/ }),
    );
    expect(onValueChange).toHaveBeenLastCalledWith('medium');
    expect(trigger).toHaveTextContent('Medium');
    expect(hidden(container)).toHaveValue('medium');
  });

  it('chooses from the keyboard and skips disabled options', async () => {
    render(<SelectMenu label='Size' items={SIZES} />);
    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('listbox');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');
    await waitFor(() =>
      expect(screen.getByRole('combobox')).toHaveTextContent('Medium'),
    );
  });

  it('names its hidden native select for forms', () => {
    const { container } = render(
      <SelectMenu
        label='Size'
        items={SIZES}
        name='size'
        defaultValue='small'
      />,
    );
    expect(hidden(container)).toHaveAttribute('name', 'size');
    expect(hidden(container)).toHaveValue('small');
    expect(hidden(container)).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows group headings', async () => {
    render(
      <SelectMenu
        label='Spell'
        items={[
          { value: 'a', label: 'Fireball', group: 'Fire' },
          { value: 'b', label: 'Frost ray', group: 'Cold' },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(
      await screen.findByRole('group', { name: 'Fire' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Cold' })).toBeInTheDocument();
  });

  it('server-renders the button and hidden select, the list once hydrated', () => {
    const html = renderToString(
      <SelectMenu label='Size' items={SIZES} defaultValue='small' />,
    );
    expect(html).toContain('Size');
    expect(html).toContain('<option value="small"');
    expect(html).not.toContain('data-part="positioner"');
  });
});
