import { HoverCard } from '@arkhe/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

function card(title: string) {
  return screen
    .getAllByText(title, { selector: '[data-part="title"]' })[0]
    .closest('[data-part="content"]') as HTMLElement;
}

describe('HoverCard', () => {
  it('opens on hover with its title and body', async () => {
    render(
      <HoverCard title='Charge' content='Spend to act twice.' openDelay={0}>
        charge
      </HoverCard>,
    );
    await userEvent.hover(screen.getByRole('button', { name: 'charge' }));
    await waitFor(() => expect(card('Charge')).toBeVisible());
    expect(card('Charge')).toHaveTextContent('Spend to act twice.');
  });

  it('nests: a card inside a card opens without closing its parent', async () => {
    render(
      <HoverCard
        title='Charge'
        openDelay={0}
        content={
          <HoverCard title='Action' content='One per turn.' openDelay={0}>
            act
          </HoverCard>
        }>
        charge
      </HoverCard>,
    );
    await userEvent.hover(screen.getByRole('button', { name: 'charge' }));
    await waitFor(() => expect(card('Charge')).toBeVisible());
    await userEvent.hover(
      within(card('Charge')).getByRole('button', { name: 'act' }),
    );
    await waitFor(() => expect(card('Action')).toBeVisible());
    expect(card('Charge')).toBeVisible();
  });

  it('loads its body on first open and shows the loading state meanwhile', async () => {
    const pending: { resolve?: (value: string) => void } = {};
    render(
      <HoverCard
        title='Fireball'
        openDelay={0}
        load={() =>
          new Promise<string>((resolve) => (pending.resolve = resolve))
        }
        loaded={(text) => <p>{text}</p>}>
        fireball
      </HoverCard>,
    );
    await userEvent.hover(screen.getByRole('button', { name: 'fireball' }));
    expect(await screen.findByText('Loading…')).toBeInTheDocument();
    pending.resolve?.('Burns everything.');
    expect(await screen.findByText('Burns everything.')).toBeInTheDocument();
  });

  it('stays open while pinned', async () => {
    render(
      <>
        <HoverCard title='Charge' content='Body' openDelay={0} closeDelay={0}>
          charge
        </HoverCard>
        <span>elsewhere</span>
      </>,
    );
    await userEvent.hover(screen.getByRole('button', { name: 'charge' }));
    await waitFor(() => expect(card('Charge')).toBeVisible());
    await userEvent.click(screen.getByRole('button', { name: 'Pin Charge' }));
    await userEvent.hover(screen.getByText('elsewhere'));
    await userEvent.click(screen.getByText('elsewhere'));
    expect(card('Charge')).toBeVisible();
    expect(card('Charge')).toHaveAttribute('data-pinned', '');
    expect(
      screen.getByRole('button', { name: 'Unpin Charge' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('stays open under the pointer when unpinned, then closes on leave', async () => {
    const user = userEvent.setup();
    render(
      <>
        <HoverCard title='Charge' content='Body' openDelay={0} closeDelay={0}>
          charge
        </HoverCard>
        <span>elsewhere</span>
      </>,
    );
    await user.hover(screen.getByRole('button', { name: 'charge' }));
    await waitFor(() => expect(card('Charge')).toBeVisible());
    await user.click(screen.getByRole('button', { name: 'Pin Charge' }));
    await user.click(screen.getByRole('button', { name: 'Unpin Charge' }));
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(card('Charge')).toBeVisible();
    expect(card('Charge')).not.toHaveAttribute('data-pinned');
    await user.hover(screen.getByText('elsewhere'));
    await waitFor(() => expect(card('Charge')).not.toBeVisible());
  });

  it('loads afresh when load changes while open', async () => {
    const view = (name: string) => (
      <HoverCard
        title='Who'
        openDelay={0}
        load={async () => name}
        loaded={(text) => <p>{text}</p>}>
        who
      </HoverCard>
    );
    const { rerender } = render(view('Ada'));
    await userEvent.hover(screen.getByRole('button', { name: 'who' }));
    expect(await screen.findByText('Ada')).toBeInTheDocument();
    rerender(view('Grace'));
    expect(await screen.findByText('Grace')).toBeInTheDocument();
    expect(screen.queryByText('Ada')).not.toBeInTheDocument();
  });
});
