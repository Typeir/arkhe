import { ArkheProvider, HoverCard } from '@arkhe/react';
import { tap } from '@tests/fixtures/tap';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AnchorHTMLAttributes } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

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

  it('server-renders the trigger alone and mounts the card on first open', async () => {
    const html = renderToString(
      <HoverCard title='Charge' content='Body'>
        charge
      </HoverCard>,
    );
    expect(html).not.toContain('data-part="positioner"');
    const { container } = render(
      <HoverCard title='Charge' content='Body' openDelay={0}>
        charge
      </HoverCard>,
    );
    expect(container.querySelector('[data-part="positioner"]')).toBeNull();
    await userEvent.hover(screen.getByRole('button', { name: 'charge' }));
    await waitFor(() => expect(card('Charge')).toBeVisible());
  });

  it("renders a link trigger through the provider's link", () => {
    const Routed = (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a {...props} data-routed='' />
    );
    render(
      <ArkheProvider link={Routed} effects={false}>
        <HoverCard title='Charge' content='Body' href='/charge'>
          charge
        </HoverCard>
      </ArkheProvider>,
    );
    const link = screen.getByRole('link', { name: 'charge' });
    expect(link).toHaveAttribute('href', '/charge');
    expect(link).toHaveAttribute('data-routed');
  });

  it('opens on tap and closes on a tap outside, unless pinned', async () => {
    render(
      <>
        <HoverCard title='Charge' content='Body' inline closeDelay={0}>
          charge
        </HoverCard>
        <p>elsewhere</p>
      </>,
    );
    const trigger = screen.getByText('charge');
    expect(trigger).toHaveAttribute('tabindex', '0');
    await tap(trigger);
    await waitFor(() => expect(card('Charge')).toBeVisible());
    await tap(screen.getByText('elsewhere'));
    await waitFor(() => expect(card('Charge')).not.toBeVisible());
    await tap(trigger);
    await waitFor(() => expect(card('Charge')).toBeVisible());
    await userEvent.click(screen.getByRole('button', { name: 'Pin Charge' }));
    await tap(screen.getByText('elsewhere'));
    expect(card('Charge')).toBeVisible();
  });

  it('starts open with defaultOpen and reports changes', async () => {
    const report = vi.fn();
    render(
      <HoverCard
        title='Charge'
        content='Body'
        defaultOpen
        onOpenChange={report}>
        charge
      </HoverCard>,
    );
    await waitFor(() => expect(card('Charge')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(card('Charge')).not.toBeVisible());
    expect(report).toHaveBeenCalledExactlyOnceWith(false);
  });
});
