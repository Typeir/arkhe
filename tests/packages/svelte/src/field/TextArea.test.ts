import { TextArea } from '@arkhe/svelte';
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('TextArea', () => {
  it('renders a text area in the contract', () => {
    render(TextArea, { 'aria-label': 'Notes', rows: 3, value: 'Ink' });
    const area = screen.getByRole('textbox', { name: 'Notes' });
    expect(area.tagName).toBe('TEXTAREA');
    expect(area).toHaveAttribute('data-scope', 'text-area');
    expect(area).toHaveAttribute('rows', '3');
    expect(area).toHaveValue('Ink');
  });
});
