import { Checkbox } from '@arkhe/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('Checkbox', () => {
  it('is a native checkbox named by its label', () => {
    render(<Checkbox label='Use GPU' />);
    const box = screen.getByRole('checkbox', { name: 'Use GPU' });
    expect(box.tagName).toBe('INPUT');
    expect(box).not.toBeChecked();
  });

  it('toggles on Space, not on Enter, and reports it', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label='Clamp' onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole('checkbox');
    box.focus();
    await userEvent.keyboard('{Enter}');
    expect(box).not.toBeChecked();
    await userEvent.keyboard(' ');
    expect(box).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it('starts from defaultChecked and follows a controlled value', () => {
    render(<Checkbox label='A' defaultChecked />);
    expect(screen.getByRole('checkbox', { name: 'A' })).toBeChecked();
    const { rerender } = render(
      <Checkbox label='B' checked onCheckedChange={() => undefined} />,
    );
    const box = screen.getByRole('checkbox', { name: 'B' });
    expect(box).toBeChecked();
    rerender(
      <Checkbox label='B' checked={false} onCheckedChange={() => undefined} />,
    );
    expect(box).not.toBeChecked();
  });

  it('sets and clears the mixed state', () => {
    const { rerender } = render(<Checkbox label='All' indeterminate />);
    const box = screen.getByRole<HTMLInputElement>('checkbox');
    expect(box.indeterminate).toBe(true);
    rerender(<Checkbox label='All' indeterminate={false} />);
    expect(box.indeterminate).toBe(false);
  });

  it('draws a pip by default and a box with hidden marks on request', () => {
    const { container, rerender } = render(<Checkbox label='A' />);
    const root = container.firstElementChild;
    expect(root).toHaveAttribute('data-look', 'pip');
    expect(root).toHaveAttribute('data-size', 'm');
    expect(container.querySelector('[data-part="mark"]')).toBeNull();
    rerender(<Checkbox label='A' look='box' size='l' />);
    const mark = container.querySelector('[data-part="mark"]');
    expect(mark).toHaveAttribute('aria-hidden', 'true');
    expect(mark?.querySelector('[data-name="check"]')).not.toBeNull();
    expect(mark?.querySelector('[data-name="minus"]')).not.toBeNull();
    expect(root).toHaveAttribute('data-size', 'l');
  });

  it('describes the box with the hint, then the error', () => {
    const { container, rerender } = render(
      <Checkbox label='A' hint='Slower.' />,
    );
    const box = screen.getByRole('checkbox');
    expect(box).toHaveAccessibleDescription('Slower.');
    rerender(<Checkbox label='A' hint='Slower.' error='Required.' />);
    expect(box).toHaveAccessibleDescription('Required.');
    expect(box).toBeInvalid();
    expect(container.firstElementChild).toHaveAttribute('data-invalid', '');
  });

  it('keeps a hidden label as the name', () => {
    const { container } = render(<Checkbox label='Proficient' labelHidden />);
    expect(container.firstElementChild).toHaveAttribute(
      'data-label-hidden',
      '',
    );
    expect(
      screen.getByRole('checkbox', { name: 'Proficient' }),
    ).toBeInTheDocument();
  });

  it('submits its value and obeys a disabled fieldset', () => {
    const { container } = render(
      <form>
        <fieldset disabled>
          <Checkbox label='Slain' name='slain' value='yes' defaultChecked />
        </fieldset>
      </form>,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
    const form = container.querySelector('form') as HTMLFormElement;
    form.querySelector('fieldset')?.removeAttribute('disabled');
    expect(new FormData(form).get('slain')).toBe('yes');
  });
});
