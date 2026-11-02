import { Chip } from '@arkhe/svelte';
import { renderWithProvider } from '@tests/fixtures/svelte/renderWithProvider';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('Chip', () => {
  it('renders the label and tone', () => {
    const { container } = render(Chip, { label: 'charge', tone: 'accent' });
    expect(container.querySelector('[data-scope="chip"]')).toHaveAttribute(
      'data-tone',
      'accent',
    );
    expect(screen.getByText('charge')).toHaveAttribute('data-part', 'label');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('names the remove button from the label template', async () => {
    const onRemove = vi.fn();
    render(Chip, { label: 'charge', onRemove });
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove charge' }),
    );
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('uses translated remove labels', () => {
    renderWithProvider({ labels: { chipRemove: 'Poista {label}' } }, Chip, {
      label: 'charge',
      onRemove: () => undefined,
    });
    expect(
      screen.getByRole('button', { name: 'Poista charge' }),
    ).toBeInTheDocument();
  });
});
