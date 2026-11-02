import { ArkheProvider, NumericInput } from '@arkhe/react';
import type { NumericValue } from '@arkhe/core';
import { render, screen } from '@testing-library/react';
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
    await userEvent.type(input, '71');
    expect(input).toHaveValue('71');
    await userEvent.tab();
    expect(input).toHaveValue('10');
    expect(onCommit).toHaveBeenLastCalledWith(10);
  });

  it('omits aria bounds it was not given', () => {
    render(<NumericInput label='Speed' max={9} />);
    const input = screen.getByRole('spinbutton');
    expect(input).not.toHaveAttribute('aria-valuemin');
    expect(input).toHaveAttribute('aria-valuemax', '9');
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
