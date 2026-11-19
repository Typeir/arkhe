import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SheetField } from '../../../../packages/react/src/SheetField';

describe('SheetField', () => {
  it('shows the choice on a button that opens a sheet holding the body', async () => {
    render(
      <SheetField label='School' text='Illusion'>
        {(close) => (
          <>
            <input aria-label='Find' />
            <button type='button' onClick={close}>
              Done
            </button>
          </>
        )}
      </SheetField>,
    );
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
    const { container } = render(
      <SheetField label='School' placeholder='Any' name='school' value='abj'>
        {() => null}
      </SheetField>,
    );
    expect(screen.getByRole('button', { name: 'School Any' })).toHaveAttribute(
      'data-placeholder-shown',
      '',
    );
    const standIn = container.querySelector('[data-part="stand-in"]');
    expect(standIn).toHaveAttribute('name', 'school');
    expect(standIn).toHaveValue('abj');
  });

  it('validates a required choice and hands focus to its button', () => {
    const { container } = render(
      <SheetField label='School' required>
        {() => null}
      </SheetField>,
    );
    const standIn = container.querySelector(
      '[data-part="stand-in"]',
    ) as HTMLInputElement;
    expect(standIn).toBeRequired();
    expect(standIn.checkValidity()).toBe(false);
    standIn.focus();
    expect(screen.getByRole('button', { name: /School/ })).toHaveFocus();
  });

  it('is described by its hint, then by its error', () => {
    const { rerender } = render(
      <SheetField label='School' hint='Pick one'>
        {() => null}
      </SheetField>,
    );
    const button = screen.getByRole('button', { name: /School/ });
    expect(button).toHaveAccessibleDescription('Pick one');
    rerender(
      <SheetField label='School' hint='Pick one' error='Required'>
        {() => null}
      </SheetField>,
    );
    expect(button).toHaveAccessibleDescription('Required');
  });
});
