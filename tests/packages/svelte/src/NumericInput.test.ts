import { NumericInput } from '@arkhe/svelte';
import BoundNumeric from '@tests/fixtures/svelte/BoundNumeric.svelte';
import ClampedNumeric from '@tests/fixtures/svelte/ClampedNumeric.svelte';
import { renderWithProvider } from '@tests/fixtures/svelte/renderWithProvider';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
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
    await waitFor(() => expect(input).toHaveValue('10'));
    expect(onCommit).toHaveBeenLastCalledWith(10);
  });

  it('does not echo outside values and applies each while focused', async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(NumericInput, {
      label: 'Speed',
      value: 1,
      onValueChange,
    });
    const input = screen.getByRole('spinbutton');
    await userEvent.click(input);
    await fireEvent.input(input, { target: { value: '17' } });
    expect(onValueChange).toHaveBeenCalledWith(17);
    await rerender({ value: 17 });
    onValueChange.mockClear();
    await rerender({ value: 42 });
    await waitFor(() => expect(input).toHaveValue('42'));
    await rerender({ value: 43 });
    await waitFor(() => expect(input).toHaveValue('43'));
    expect(input).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('snaps back to a function binding that refuses the change', async () => {
    const onValueChange = vi.fn();
    render(ClampedNumeric, {
      onCommit: () => undefined,
      refuse: true,
      unbounded: true,
      onChange: onValueChange,
    });
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '7');
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveValue('5'));
    expect(onValueChange.mock.calls).toEqual([[57]]);
  });

  it('snaps back to a parent that clamps to the value it held', async () => {
    render(ClampedNumeric, { onCommit: () => undefined, unbounded: true });
    const input = screen.getByRole('spinbutton');
    await userEvent.clear(input);
    await fireEvent.input(input, { target: { value: '7' } });
    await fireEvent.input(input, { target: { value: '71' } });
    await fireEvent.input(input, { target: { value: '710' } });
    expect(screen.getByRole('status')).toHaveTextContent('10');
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveValue('10'));
  });

  it('writes a binding that starts undefined', async () => {
    render(BoundNumeric);
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '42');
    await userEvent.tab();
    expect(screen.getByRole('status')).toHaveTextContent('42');
  });

  it('formats and parses in the provider locale', async () => {
    const onValueChange = vi.fn();
    renderWithProvider({ locale: 'fi' }, NumericInput, {
      label: 'Nopeus',
      defaultValue: 1234.5,
      onValueChange,
    });
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue('1 234,5');
    await userEvent.clear(input);
    await userEvent.type(input, '1,5');
    expect(onValueChange).toHaveBeenLastCalledWith(1.5);
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveValue('1,5'));
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
