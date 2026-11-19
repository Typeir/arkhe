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

  it('shows the placeholder without a choice and submits through a hidden input', () => {
    const { container } = render(
      <SheetField label='School' placeholder='Any' name='school' value='abj'>
        {() => null}
      </SheetField>,
    );
    expect(screen.getByRole('button', { name: 'School Any' })).toHaveAttribute(
      'data-placeholder-shown',
      '',
    );
    expect(container.querySelector('input[type="hidden"]')).toHaveAttribute(
      'name',
      'school',
    );
  });
});
