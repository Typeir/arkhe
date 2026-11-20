import { ToggleGroup } from '@arkhe/svelte';
import type { ToggleItem } from '@arkhe/core';
import { toggleSnippet } from '@tests/fixtures/svelte/snippets';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const ASPECTS: readonly ToggleItem[] = [
  { value: 'fire', label: 'Fire', icon: 'plus' },
  { value: 'frost', label: 'Frost' },
  { value: 'storm', label: 'Storm' },
  { value: 'void', label: 'Void', disabled: true },
];

describe('ToggleGroup', () => {
  it('is a named toolbar of toggle buttons in a focusgroup', () => {
    render(ToggleGroup, { label: 'Aspects', items: ASPECTS });
    const bar = screen.getByRole('toolbar', { name: 'Aspects' });
    expect(bar).toHaveAttribute('focusgroup', 'toolbar wrap');
    const fire = screen.getByRole('button', { name: 'Fire' });
    expect(fire).toHaveAttribute('aria-pressed', 'false');
    expect(fire.querySelector('[data-name="plus"]')).not.toBeNull();
  });

  it('presses several under multiple and reports them', async () => {
    const onValueChange = vi.fn();
    render(ToggleGroup, {
      label: 'Aspects',
      items: ASPECTS,
      multiple: true,
      onValueChange,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Fire' }));
    await userEvent.click(screen.getByRole('button', { name: 'Storm' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['fire', 'storm']);
    expect(screen.getByRole('button', { name: 'Fire' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('keeps one pressed when single, releasing it only when deselectable', async () => {
    const { rerender } = render(ToggleGroup, {
      label: 'Focus',
      items: ASPECTS,
      defaultValue: ['fire'],
    });
    const fire = screen.getByRole('button', { name: 'Fire' });
    await userEvent.click(fire);
    expect(fire).toHaveAttribute('aria-pressed', 'true');
    await rerender({ deselectable: true });
    await userEvent.click(fire);
    expect(fire).toHaveAttribute('aria-pressed', 'false');
  });

  it('leaves a disabled toggle reachable but unpressable', async () => {
    render(ToggleGroup, { label: 'Aspects', items: ASPECTS, multiple: true });
    const voided = screen.getByRole('button', { name: 'Void' });
    expect(voided).toHaveAttribute('aria-disabled', 'true');
    expect(voided).not.toBeDisabled();
    await userEvent.click(voided);
    expect(voided).toHaveAttribute('aria-pressed', 'false');
  });

  it('offers one tab stop and moves with arrows', async () => {
    render(ToggleGroup, { label: 'Aspects', items: ASPECTS });
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Fire' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Frost' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Void' })).toHaveFocus();
  });

  it('shows more past the limit, always showing pressed toggles', async () => {
    render(ToggleGroup, {
      label: 'Aspects',
      items: ASPECTS,
      limit: 2,
      value: ['storm'],
    });
    expect(screen.queryByRole('button', { name: 'Void' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Storm' })).toBeInTheDocument();
    const more = screen.getByRole('button', { name: 'Show more' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    expect(screen.getByRole('button', { name: 'Void' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('clears while anything is pressed and keeps focus in the group', async () => {
    render(ToggleGroup, {
      label: 'Aspects',
      items: ASPECTS,
      multiple: true,
      clearable: true,
      defaultValue: ['frost'],
    });
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Frost' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Fire' })).toHaveFocus();
  });

  it('renders custom content and runs vertically', () => {
    render(ToggleGroup, {
      label: 'Aspects',
      items: ASPECTS,
      orientation: 'vertical',
      value: ['frost'],
      item: toggleSnippet(),
    });
    expect(screen.getByRole('toolbar')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
    expect(
      screen.getByRole('button', { name: 'Frost on' }),
    ).toBeInTheDocument();
  });
});
