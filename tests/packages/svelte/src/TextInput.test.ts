import { TextInput } from '@arkhe/svelte';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

describe('TextInput', () => {
  it('defaults to a text input in the contract', () => {
    render(TextInput, { 'aria-label': 'Name' });
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('data-scope', 'text-input');
    expect(input).toHaveClass('arkhe');
  });

  it('passes native attributes through', async () => {
    render(TextInput, {
      'aria-label': 'Name',
      placeholder: 'Rhomus',
      maxlength: 3,
    });
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'abcd');
    expect(input).toHaveValue('abc');
    expect(input).toHaveAttribute('placeholder', 'Rhomus');
  });
});
