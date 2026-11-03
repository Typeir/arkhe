import { ArkheProvider, NumericInput } from '@arkhe/react';
import type { NumericValue } from '@arkhe/core';
import { typeNumber } from '@tests/fixtures/typeNumber';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

const Clamped = ({ onCommit }: { onCommit: (value: NumericValue) => void }) => {
  const [value, setValue] = useState<NumericValue>(5);
  return (
    <NumericInput
      label='Speed'
      value={value}
      max={10}
      onValueChange={(next) =>
        setValue(next === null ? null : Math.min(next, 10))
      }
      onValueCommit={onCommit}
    />
  );
};

describe('NumericInput', () => {
  it('labels the field and names its step buttons', () => {
    render(<NumericInput label='Speed' defaultValue={3} />);
    expect(screen.getByRole('spinbutton', { name: 'Speed' })).toHaveValue('3');
    expect(
      screen.getByRole('button', { name: 'Increase Speed' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Decrease Speed' }),
    ).toBeInTheDocument();
  });

  it('steps and reports numbers', async () => {
    const onValueChange = vi.fn();
    render(
      <NumericInput
        label='Speed'
        defaultValue={3}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Increase Speed' }),
    );
    expect(onValueChange).toHaveBeenLastCalledWith(4);
  });

  it('reports an empty field as null', async () => {
    const onValueChange = vi.fn();
    render(
      <NumericInput
        label='Speed'
        defaultValue={3}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.clear(screen.getByRole('spinbutton'));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it('lets a clamping parent wait until blur', async () => {
    const onCommit = vi.fn();
    render(<Clamped onCommit={onCommit} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.clear(input);
    await typeNumber(input, '71', fireEvent.input);
    expect(input).toHaveValue('71');
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveValue('10'));
    expect(onCommit).toHaveBeenLastCalledWith(10);
  });

  it('does not echo outside values and applies each while focused', async () => {
    const onValueChange = vi.fn();
    const field = (value: NumericValue) => (
      <NumericInput label='Speed' value={value} onValueChange={onValueChange} />
    );
    const { rerender } = render(field(1));
    const input = screen.getByRole('spinbutton');
    await userEvent.click(input);
    fireEvent.input(input, { target: { value: '17' } });
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(17));
    rerender(field(17));
    onValueChange.mockClear();
    rerender(field(42));
    await waitFor(() => expect(input).toHaveValue('42'));
    rerender(field(43));
    await waitFor(() => expect(input).toHaveValue('43'));
    expect(input).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('snaps back to a parent that ignores the change, silently', async () => {
    const onValueChange = vi.fn();
    render(
      <NumericInput label='Speed' value={5} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '7');
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveValue('5'));
    expect(onValueChange.mock.calls).toEqual([[57]]);
  });

  it('omits aria bounds it was not given', () => {
    render(<NumericInput label='Speed' max={9} />);
    const input = screen.getByRole('spinbutton');
    expect(input).not.toHaveAttribute('aria-valuemin');
    expect(input).toHaveAttribute('aria-valuemax', '9');
  });

  it('formats and parses in the provider locale', async () => {
    const onValueChange = vi.fn();
    render(
      <ArkheProvider locale='fi'>
        <NumericInput
          label='Nopeus'
          defaultValue={1234.5}
          onValueChange={onValueChange}
        />
      </ArkheProvider>,
    );
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue('1 234,5');
    await userEvent.clear(input);
    await typeNumber(input, '1,5', fireEvent.input);
    expect(onValueChange).toHaveBeenLastCalledWith(1.5);
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveValue('1,5'));
  });

  it('uses translated step labels', () => {
    render(
      <ArkheProvider labels={{ numericIncrement: 'Lisää {label}' }}>
        <NumericInput label='Nopeus' />
      </ArkheProvider>,
    );
    expect(
      screen.getByRole('button', { name: 'Lisää Nopeus' }),
    ).toBeInTheDocument();
  });
});
