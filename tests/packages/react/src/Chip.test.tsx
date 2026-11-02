import { ArkheProvider, Chip } from '@arkhe/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('Chip', () => {
  it('renders the label and tone', () => {
    const { container } = render(<Chip label='charge' tone='accent' />);
    expect(container.firstElementChild).toHaveAttribute('data-tone', 'accent');
    expect(screen.getByText('charge')).toHaveAttribute('data-part', 'label');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('defaults to the neutral tone', () => {
    const { container } = render(<Chip label='x' />);
    expect(container.firstElementChild).toHaveAttribute('data-tone', 'neutral');
  });

  it('names the remove button from the label template', async () => {
    const onRemove = vi.fn();
    render(<Chip label='charge' onRemove={onRemove} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove charge' }),
    );
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('uses translated remove labels', () => {
    render(
      <ArkheProvider labels={{ chipRemove: 'Poista {label}' }}>
        <Chip label='charge' onRemove={() => undefined} />
      </ArkheProvider>,
    );
    expect(
      screen.getByRole('button', { name: 'Poista charge' }),
    ).toBeInTheDocument();
  });
});
