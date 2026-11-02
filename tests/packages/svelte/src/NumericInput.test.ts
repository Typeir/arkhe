import { NumericInput } from '@arkhe/svelte';
import ClampedNumeric from '@tests/fixtures/svelte/ClampedNumeric.svelte';
import { renderWithProvider } from '@tests/fixtures/svelte/renderWithProvider';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('NumericInput', () => {
  it('labels the field and names its step buttons', () => {
    render(NumericInput, { label: 'Speed', defaultValue: 3 });
    expect(screen.getByRole('spinbutton', { name: 'Speed' })).toHaveValue('3');
    expect(
      screen.getByRole('button', { name: 'Increase Speed' }),
    ).toBeInTheDocument();
  });

  it('steps and reports numbers', async () => {
    const onValueChange = vi.fn();
    render(NumericInput, { label: 'Speed', defaultValue: 3, onValueChange });
    await userEvent.click(
      screen.getByRole('button', { name: 'Increase Speed' }),
    );
    expect(onValueChange).toHaveBeenLastCalledWith(4);
  });

  it('keeps a lone minus sign while typing', async () => {
    const onValueChange = vi.fn();
    render(NumericInput, { label: 'Speed', onValueChange });
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '-');
    expect(input).toHaveValue('-');
    await userEvent.type(input, '5');
    expect(onValueChange).toHaveBeenLastCalledWith(-5);
  });

  it('lets a clamping parent wait until blur', async () => {
    const onCommit = vi.fn();
    render(ClampedNumeric, { onCommit });
    const input = screen.getByRole('spinbutton');
    await userEvent.clear(input);
    await userEvent.type(input, '71');
    expect(input).toHaveValue('71');
    await userEvent.tab();
    expect(input).toHaveValue('10');
    expect(onCommit).toHaveBeenLastCalledWith(10);
  });

  it('uses translated step labels', () => {
    renderWithProvider(
      { labels: { numericDecrement: 'Vähennä {label}' } },
      NumericInput,
      { label: 'Nopeus' },
    );
    expect(
      screen.getByRole('button', { name: 'Vähennä Nopeus' }),
    ).toBeInTheDocument();
  });
});
