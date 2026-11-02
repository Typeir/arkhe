import { Field } from '@arkhe/svelte';
import { inputSnippet } from '@tests/fixtures/svelte/snippets';
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('Field', () => {
  it('labels the control', () => {
    render(Field, { label: 'Name', children: inputSnippet() });
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
  });

  it('describes the control with the hint', () => {
    render(Field, {
      label: 'Name',
      hint: 'Shown on the sheet.',
      children: inputSnippet(),
    });
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription(
      'Shown on the sheet.',
    );
  });

  it('swaps the hint for the error and marks the control invalid', () => {
    const { container } = render(Field, {
      label: 'Name',
      hint: 'Hint.',
      error: 'Required.',
      children: inputSnippet(),
    });
    const input = screen.getByRole('textbox');
    expect(input).toHaveAccessibleDescription('Required.');
    expect(input).toBeInvalid();
    expect(screen.queryByText('Hint.')).toBeNull();
    expect(container.querySelector('[data-scope="field"]')).toHaveAttribute(
      'data-invalid',
      '',
    );
  });

  it('shows a readout tied to the control', () => {
    render(Field, {
      label: 'Name',
      readout: '6 / 24',
      children: inputSnippet(),
    });
    const readout = screen.getByText('6 / 24');
    expect(readout.tagName).toBe('OUTPUT');
    expect(readout).toHaveAttribute('for', screen.getByRole('textbox').id);
    expect(readout).toHaveAttribute('aria-live', 'off');
  });
});
