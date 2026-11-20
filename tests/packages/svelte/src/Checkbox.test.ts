import { Checkbox } from '@arkhe/svelte';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('Checkbox', () => {
  it('is a native checkbox named by its label', () => {
    render(Checkbox, { label: 'Use GPU' });
    const box = screen.getByRole('checkbox', { name: 'Use GPU' });
    expect(box.tagName).toBe('INPUT');
    expect(box).not.toBeChecked();
  });

  it('toggles on Space, not on Enter, and reports it', async () => {
    const onCheckedChange = vi.fn();
    render(Checkbox, { label: 'Clamp', onCheckedChange });
    const box = screen.getByRole('checkbox');
    box.focus();
    await userEvent.keyboard('{Enter}');
    expect(box).not.toBeChecked();
    await userEvent.keyboard(' ');
    expect(box).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it('starts from defaultChecked and follows a set value', async () => {
    const { rerender } = render(Checkbox, { label: 'A', defaultChecked: true });
    const box = screen.getByRole('checkbox');
    expect(box).toBeChecked();
    await rerender({ checked: false });
    expect(box).not.toBeChecked();
  });

  it('sets and clears the mixed state', async () => {
    const { rerender } = render(Checkbox, {
      label: 'All',
      indeterminate: true,
    });
    const box = screen.getByRole<HTMLInputElement>('checkbox');
    expect(box.indeterminate).toBe(true);
    await rerender({ indeterminate: false });
    expect(box.indeterminate).toBe(false);
  });

  it('draws a pip by default and a box with hidden marks on request', async () => {
    const { container, rerender } = render(Checkbox, { label: 'A' });
    const root = container.querySelector('[data-scope="checkbox"]');
    expect(root).toHaveAttribute('data-look', 'pip');
    expect(root).toHaveAttribute('data-size', 'm');
    expect(container.querySelector('[data-part="mark"]')).toBeNull();
    await rerender({ look: 'box', size: 'l' });
    const mark = container.querySelector('[data-part="mark"]');
    expect(mark).toHaveAttribute('aria-hidden', 'true');
    expect(mark?.querySelector('[data-name="check"]')).not.toBeNull();
    expect(mark?.querySelector('[data-name="minus"]')).not.toBeNull();
    expect(root).toHaveAttribute('data-size', 'l');
  });

  it('describes the box with the hint, then the error', async () => {
    const { container, rerender } = render(Checkbox, {
      label: 'A',
      hint: 'Slower.',
    });
    const box = screen.getByRole('checkbox');
    expect(box).toHaveAccessibleDescription('Slower.');
    await rerender({ error: 'Required.' });
    expect(box).toHaveAccessibleDescription('Required.');
    expect(box).toBeInvalid();
    expect(container.querySelector('[data-scope="checkbox"]')).toHaveAttribute(
      'data-invalid',
      '',
    );
  });

  it('keeps a hidden label as the name', () => {
    const { container } = render(Checkbox, {
      label: 'Proficient',
      labelHidden: true,
    });
    expect(container.querySelector('[data-scope="checkbox"]')).toHaveAttribute(
      'data-label-hidden',
      '',
    );
    expect(
      screen.getByRole('checkbox', { name: 'Proficient' }),
    ).toBeInTheDocument();
  });

  it('submits its value while checked', () => {
    const form = document.createElement('form');
    document.body.append(form);
    render(Checkbox, {
      target: form,
      props: {
        label: 'Slain',
        name: 'slain',
        value: 'yes',
        defaultChecked: true,
      },
    });
    expect(new FormData(form).get('slain')).toBe('yes');
    form.remove();
  });
});
