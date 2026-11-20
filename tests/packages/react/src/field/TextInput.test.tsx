import { TextArea, TextInput } from '@arkhe/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

describe('TextInput', () => {
  it('defaults to a text input in the contract', () => {
    render(<TextInput aria-label='Name' />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('data-scope', 'text-input');
    expect(input).toHaveClass('arkhe');
  });

  it('passes native attributes through', async () => {
    render(<TextInput aria-label='Name' placeholder='Rhomus' maxLength={3} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'abcd');
    expect(input).toHaveValue('abc');
    expect(input).toHaveAttribute('placeholder', 'Rhomus');
  });
});

describe('TextArea', () => {
  it('renders a text area in the contract', () => {
    render(<TextArea aria-label='Notes' rows={3} />);
    const area = screen.getByRole('textbox', { name: 'Notes' });
    expect(area.tagName).toBe('TEXTAREA');
    expect(area).toHaveAttribute('data-scope', 'text-area');
    expect(area).toHaveAttribute('rows', '3');
  });
});
