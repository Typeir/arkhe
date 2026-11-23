import { HoverCard } from '@arkhe/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

function frame(): HTMLElement {
  return document.querySelector(
    '[data-scope="hover-card"][data-part="frame"]',
  ) as HTMLElement;
}

const grip = () =>
  screen.getByRole('button', { name: 'Move Charge. Arrow keys move it.' });

describe('useCardDrag (through HoverCard)', () => {
  it('an arrow on the grip detaches and pins the card', async () => {
    render(
      <HoverCard title='Charge' open content='Body'>
        charge
      </HoverCard>,
    );
    await waitFor(() => expect(grip()).toBeInTheDocument());
    grip().focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(frame()).toHaveAttribute('data-detached', '');
    expect(frame().style.getPropertyValue('--card-x')).not.toBe('');
    expect(
      screen.getByRole('button', { name: 'Unpin Charge' }),
    ).toBeInTheDocument();
  });

  it('the move menu sends the card to a corner, then back, and says so', async () => {
    render(
      <HoverCard title='Charge' open content='Body'>
        charge
      </HoverCard>,
    );
    await waitFor(() => expect(grip()).toBeInTheDocument());
    await userEvent.click(grip());
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Top right' }),
    );
    expect(frame()).toHaveAttribute('data-detached', '');
    expect(
      await screen.findByText('Charge moved: Top right'),
    ).toBeInTheDocument();
    await userEvent.click(grip());
    const menu = await screen.findByRole('menu');
    await userEvent.click(
      within(menu).getByRole('menuitem', { name: 'Back beside its trigger' }),
    );
    expect(frame()).not.toHaveAttribute('data-detached');
    expect(
      screen.getByRole('button', { name: 'Unpin Charge' }),
    ).toBeInTheDocument();
  });

  it('unpinning returns a detached card', async () => {
    render(
      <HoverCard title='Charge' open content='Body'>
        charge
      </HoverCard>,
    );
    await waitFor(() => expect(grip()).toBeInTheDocument());
    grip().focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.click(screen.getByRole('button', { name: 'Unpin Charge' }));
    expect(frame()).not.toHaveAttribute('data-detached');
  });
});
