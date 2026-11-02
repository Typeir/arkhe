import { Field, TextInput } from '@arkhe/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Field', () => {
  it('labels the control', () => {
    render(
      <Field label='Name'>{(control) => <TextInput {...control} />}</Field>,
    );
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
  });

  it('describes the control with the hint', () => {
    render(
      <Field label='Name' hint='Shown on the sheet.'>
        {(control) => <TextInput {...control} />}
      </Field>,
    );
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription(
      'Shown on the sheet.',
    );
  });

  it('swaps the hint for the error and marks the control invalid', () => {
    const { container } = render(
      <Field label='Name' hint='Hint.' error='Required.'>
        {(control) => <TextInput {...control} />}
      </Field>,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAccessibleDescription('Required.');
    expect(input).toBeInvalid();
    expect(screen.queryByText('Hint.')).toBeNull();
    expect(container.firstElementChild).toHaveAttribute('data-invalid', '');
  });

  it('shows a readout tied to the control', () => {
    render(
      <Field label='Name' readout='6 / 24'>
        {(control) => <TextInput {...control} />}
      </Field>,
    );
    const readout = screen.getByText('6 / 24');
    expect(readout.tagName).toBe('OUTPUT');
    expect(readout).toHaveAttribute('for', screen.getByRole('textbox').id);
  });
});
