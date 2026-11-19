import SheetProbe from '@tests/fixtures/svelte/SheetProbe.svelte';
import { render, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

describe('SheetField', () => {
  it('shows the choice on a button that opens a sheet holding the body', async () => {
    render(SheetProbe, { text: 'Illusion' });
    const trigger = screen.getByRole('button', { name: 'School Illusion' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await userEvent.click(trigger);
    const sheet = await screen.findByRole('dialog', { name: 'School' });
    expect(sheet).toHaveAttribute('data-sheet', '');
    expect(within(sheet).getByRole('textbox', { name: 'Find' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(sheet).not.toBeVisible());
  });

  it('shows the placeholder without a choice and submits through a stand-in input', () => {
    const { container } = render(SheetProbe, {
      placeholder: 'Any',
      name: 'school',
      value: 'abj',
    });
    expect(screen.getByRole('button', { name: 'School Any' })).toHaveAttribute(
      'data-placeholder-shown',
      '',
    );
    const standIn = container.querySelector('[data-part="stand-in"]');
    expect(standIn).toHaveAttribute('name', 'school');
    expect(standIn).toHaveValue('abj');
  });

  it('validates a required choice and hands focus to its button', () => {
    const { container } = render(SheetProbe, { required: true });
    const standIn = container.querySelector(
      '[data-part="stand-in"]',
    ) as HTMLInputElement;
    expect(standIn).toBeRequired();
    expect(standIn.checkValidity()).toBe(false);
    standIn.focus();
    expect(screen.getByRole('button', { name: /School/ })).toHaveFocus();
  });

  it('is described by its hint, then by its error', async () => {
    const { rerender } = render(SheetProbe, { hint: 'Pick one' });
    const button = screen.getByRole('button', { name: /School/ });
    expect(button).toHaveAccessibleDescription('Pick one');
    await rerender({ hint: 'Pick one', error: 'Required' });
    expect(button).toHaveAccessibleDescription('Required');
  });
});
