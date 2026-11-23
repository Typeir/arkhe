import { ArkheProvider, HoverCard } from '@arkhe/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('HoverCard access', () => {
  it('names the card and says on the trigger whether it is open', async () => {
    render(
      <HoverCard title='Charge' content='Spend to act twice.' openDelay={0}>
        charge
      </HoverCard>,
    );
    const trigger = screen.getByRole('button', { name: 'charge' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.hover(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Charge' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', dialog.id);
  });

  it('describes a link trigger by the card body, never expanded', async () => {
    render(
      <HoverCard
        title='Charge'
        href='/charge'
        content='Spend to act twice.'
        openDelay={0}>
        charge
      </HoverCard>,
    );
    const link = screen.getByRole('link', { name: 'charge' });
    await userEvent.hover(link);
    await screen.findByRole('dialog', { name: 'Charge' });
    expect(link).not.toHaveAttribute('aria-expanded');
    expect(link).toHaveAccessibleDescription('Spend to act twice.');
  });

  it('pins on click; its close button shuts it and returns focus', async () => {
    render(
      <HoverCard title='Charge' content='Body' openDelay={0}>
        charge
      </HoverCard>,
    );
    const trigger = screen.getByRole('button', { name: 'charge' });
    await userEvent.click(trigger);
    expect(
      await screen.findByRole('button', { name: 'Unpin Charge' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: /^Close / }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it('closes a pinned card on Escape', async () => {
    render(
      <HoverCard title='Charge' content='Body' openDelay={0}>
        charge
      </HoverCard>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'charge' }));
    await screen.findByRole('button', { name: /^Close / });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('pins an inline trigger with Enter', async () => {
    render(
      <HoverCard title='Charge' content='Body' inline openDelay={0}>
        charge
      </HoverCard>,
    );
    const trigger = screen.getByRole('button', { name: 'charge' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    expect(
      await screen.findByRole('button', { name: /^Close / }),
    ).toBeInTheDocument();
  });

  it('opens on click only while hover cards are off', async () => {
    render(
      <ArkheProvider hoverCards={false}>
        <HoverCard title='Charge' content='Body' openDelay={0}>
          charge
        </HoverCard>
      </ArkheProvider>,
    );
    const trigger = screen.getByRole('button', { name: 'charge' });
    await userEvent.hover(trigger);
    await pause(50);
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(trigger);
    expect(
      await screen.findByRole('dialog', { name: 'Charge' }),
    ).toBeInTheDocument();
  });
});
