import { RadioGroup } from '@arkhe/svelte';
import type { RadioItem } from '@arkhe/core';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const UNITS: readonly RadioItem[] = [
  { value: 'metric', label: 'Metric' },
  { value: 'imperial', label: 'Imperial' },
  { value: 'stride', label: 'Stride', disabled: true },
  { value: 'metric', label: 'Again' },
];

describe('RadioGroup', () => {
  it('is a fieldset named by its legend, one radio per value', () => {
    render(RadioGroup, { label: 'Units', items: UNITS });
    const group = screen.getByRole('radiogroup', { name: 'Units' });
    expect(group.tagName).toBe('FIELDSET');
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Stride' })).toBeDisabled();
  });

  it('shares one generated name unless given one', async () => {
    const { rerender } = render(RadioGroup, { label: 'Units', items: UNITS });
    const names = screen
      .getAllByRole('radio')
      .map((radio) => radio.getAttribute('name'));
    expect(new Set(names).size).toBe(1);
    expect(names[0]).toBeTruthy();
    await rerender({ name: 'units' });
    expect(screen.getByRole('radio', { name: 'Metric' })).toHaveAttribute(
      'name',
      'units',
    );
  });

  it('starts from defaultValue and reports a new choice', async () => {
    const onValueChange = vi.fn();
    render(RadioGroup, {
      label: 'Units',
      items: UNITS,
      defaultValue: 'metric',
      onValueChange,
    });
    expect(screen.getByRole('radio', { name: 'Metric' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Imperial' }));
    expect(screen.getByRole('radio', { name: 'Imperial' })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('imperial');
  });

  it('follows a set value, null choosing none', async () => {
    const { rerender } = render(RadioGroup, {
      label: 'Units',
      items: UNITS,
      value: 'imperial',
    });
    expect(screen.getByRole('radio', { name: 'Imperial' })).toBeChecked();
    await rerender({ value: null });
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).not.toBeChecked();
    }
  });

  it('moves the choice with arrows from one tab stop', async () => {
    render(RadioGroup, {
      label: 'Units',
      items: UNITS,
      defaultValue: 'metric',
    });
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Metric' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Imperial' })).toBeChecked();
  });

  it('describes the group with the hint, then the error', async () => {
    const { container, rerender } = render(RadioGroup, {
      label: 'Units',
      items: UNITS,
      hint: 'Used in sheets.',
    });
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAccessibleDescription('Used in sheets.');
    await rerender({ error: 'Pick one.' });
    expect(group).toHaveAccessibleDescription('Pick one.');
    expect(group).toBeInvalid();
    expect(screen.getByRole('radio', { name: 'Metric' })).not.toHaveAttribute(
      'aria-invalid',
    );
    expect(
      container.querySelector('[data-scope="radio-group"]'),
    ).toHaveAttribute('data-invalid', '');
  });

  it('carries look, size and direction, and disables the whole group', () => {
    const { container } = render(RadioGroup, {
      label: 'Units',
      items: UNITS,
      look: 'segmented',
      size: 'l',
      orientation: 'vertical',
      labelHidden: true,
      disabled: true,
    });
    const root = container.querySelector('[data-scope="radio-group"]');
    expect(root).toHaveAttribute('data-look', 'segmented');
    expect(root).toHaveAttribute('data-size', 'l');
    expect(root).toHaveAttribute('data-orientation', 'vertical');
    expect(root).toHaveAttribute('data-label-hidden', '');
    expect(screen.getByRole('radio', { name: 'Metric' })).toBeDisabled();
  });

  it('submits the chosen value', () => {
    const form = document.createElement('form');
    document.body.append(form);
    render(RadioGroup, {
      target: form,
      props: {
        label: 'Units',
        items: UNITS,
        name: 'units',
        defaultValue: 'imperial',
        required: true,
      },
    });
    expect(new FormData(form).get('units')).toBe('imperial');
    expect(form.checkValidity()).toBe(true);
    form.remove();
  });
});
