import { Status } from '@arkhe/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Status', () => {
  it('says the kind default text politely', () => {
    render(<Status kind='empty' />);
    expect(screen.getByRole('status')).toHaveTextContent('Nothing here yet.');
  });

  it('interrupts for errors', () => {
    render(<Status kind='error' />);
    expect(screen.getByRole('alert')).toHaveAttribute('data-kind', 'error');
  });

  it('prefers given text and draws the kind icon', () => {
    const { container } = render(<Status kind='info'>Two rolls left.</Status>);
    expect(screen.getByRole('status')).toHaveTextContent('Two rolls left.');
    expect(container.querySelector('[data-scope="icon"]')).toHaveAttribute(
      'data-name',
      'info',
    );
  });
});
