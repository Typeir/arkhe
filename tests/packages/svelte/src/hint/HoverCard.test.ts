import { HoverCard } from '@arkhe/svelte';
import BoundState from '@tests/fixtures/svelte/BoundState.svelte';
import NestedCards from '@tests/fixtures/svelte/NestedCards.svelte';
import NestedCardsQuick from '@tests/fixtures/svelte/NestedCardsQuick.svelte';
import { renderWithProvider } from '@tests/fixtures/svelte/renderWithProvider';
import RouterLink from '@tests/fixtures/svelte/RouterLink.svelte';
import { textSnippet, valueSnippet } from '@tests/fixtures/svelte/snippets';
import { render, screen, waitFor, within } from '@testing-library/svelte';
import { tap } from '@tests/fixtures/tap';
import userEvent from '@testing-library/user-event';
import type { Component } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

function card(title: string) {
  return screen
    .getAllByText(title, { selector: '[data-part="title"]' })[0]
    .closest('[data-part="content"]') as HTMLElement;
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('HoverCard nesting through the portal', () => {
  it('keeps the parent open while the pointer is in the nested card', async () => {
    const user = userEvent.setup();
    const { container } = render(NestedCardsQuick);
    await user.hover(screen.getByRole('button', { name: 'charge' }));
    await waitFor(() => expect(card('Charge')).toBeVisible());
    await user.hover(
      within(card('Charge')).getByRole('button', { name: 'act' }),
    );
    await waitFor(() => expect(card('Action')).toBeVisible());
    expect(container.contains(card('Charge'))).toBe(false);
    expect(card('Charge').contains(card('Action'))).toBe(false);
    await user.hover(screen.getByText('One per turn.'));
    await pause(150);
    expect(card('Charge')).toBeVisible();
    expect(card('Action')).toBeVisible();
    await user.hover(screen.getByText('elsewhere'));
    await waitFor(() => expect(card('Charge')).not.toBeVisible());
    await waitFor(() => expect(card('Action')).not.toBeVisible());
  });

  it('a tap in the nested card keeps both open; one outside closes both', async () => {
    render(NestedCardsQuick);
    await tap(screen.getByRole('button', { name: 'charge' }));
    await waitFor(() => expect(card('Charge')).toBeVisible());
    await tap(within(card('Charge')).getByRole('button', { name: 'act' }));
    await waitFor(() => expect(card('Action')).toBeVisible());
    await tap(screen.getByText('One per turn.'));
    await pause(100);
    expect(card('Charge')).toBeVisible();
    expect(card('Action')).toBeVisible();
    await tap(screen.getByText('elsewhere'));
    await waitFor(() => expect(card('Charge')).not.toBeVisible());
    expect(card('Action')).not.toBeVisible();
  });
});

describe('HoverCard', () => {
  it('opens on hover with its title and body', async () => {
    render(HoverCard, {
      title: 'Charge',
      openDelay: 0,
      content: textSnippet('Spend to act twice.'),
      children: textSnippet('charge'),
    });
    await userEvent.hover(screen.getByRole('button', { name: 'charge' }));
    await waitFor(() => expect(card('Charge')).toBeVisible());
    expect(card('Charge')).toHaveTextContent('Spend to act twice.');
  });

  it('nests: a card inside a card opens without closing its parent', async () => {
    render(NestedCards);
    await userEvent.hover(screen.getByRole('button', { name: 'charge' }));
    await waitFor(() => expect(card('Charge')).toBeVisible());
    await userEvent.hover(
      within(card('Charge')).getByRole('button', { name: 'act' }),
    );
    await waitFor(() => expect(card('Action')).toBeVisible());
    expect(card('Charge')).toBeVisible();
  });

  it('loads its body on first open', async () => {
    const pending: { resolve?: (value: string) => void } = {};
    render(HoverCard<string>, {
      title: 'Fireball',
      openDelay: 0,
      load: () => new Promise<string>((resolve) => (pending.resolve = resolve)),
      loaded: valueSnippet(),
      children: textSnippet('fireball'),
    });
    await userEvent.hover(screen.getByRole('button', { name: 'fireball' }));
    expect(await screen.findByText('Loading…')).toBeInTheDocument();
    pending.resolve?.('Burns everything.');
    expect(await screen.findByText('Burns everything.')).toBeInTheDocument();
  });

  it('stays open while pinned', async () => {
    render(NestedCards);
    await userEvent.hover(screen.getByRole('button', { name: 'charge' }));
    await waitFor(() => expect(card('Charge')).toBeVisible());
    await userEvent.click(screen.getByRole('button', { name: 'Pin Charge' }));
    await userEvent.hover(screen.getByText('elsewhere'));
    await userEvent.click(screen.getByText('elsewhere'));
    expect(card('Charge')).toBeVisible();
    expect(card('Charge')).toHaveAttribute('data-pinned', '');
  });

  it('stays open under the pointer when unpinned, then closes on leave', async () => {
    const user = userEvent.setup();
    render(NestedCards);
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
    const { rerender } = render(HoverCard<string>, {
      title: 'Who',
      openDelay: 0,
      load: async () => 'Ada',
      loaded: valueSnippet(),
      children: textSnippet('who'),
    });
    await userEvent.hover(screen.getByRole('button', { name: 'who' }));
    expect(await screen.findByText('Ada')).toBeInTheDocument();
    await rerender({ load: async () => 'Grace' });
    expect(await screen.findByText('Grace')).toBeInTheDocument();
    expect(screen.queryByText('Ada')).not.toBeInTheDocument();
  });

  it('mounts the card on first open', async () => {
    const { container } = render(NestedCards);
    expect(container.querySelector('[data-part="positioner"]')).toBeNull();
    await userEvent.hover(screen.getByRole('button', { name: 'charge' }));
    await waitFor(() => expect(card('Charge')).toBeVisible());
  });

  it("renders a link trigger through the provider's link", () => {
    renderWithProvider(
      { link: RouterLink as Component<Record<string, unknown>> },
      HoverCard,
      {
        title: 'Charge',
        href: '/charge',
        content: textSnippet('Body'),
        children: textSnippet('charge'),
      },
    );
    const link = screen.getByRole('link', { name: 'charge' });
    expect(link).toHaveAttribute('href', '/charge');
    expect(link).toHaveAttribute('data-router-link');
  });

  it("a tap on a link trigger opens the card; the header's link follows it", async () => {
    renderWithProvider(
      { link: RouterLink as Component<Record<string, unknown>> },
      HoverCard,
      {
        title: 'Charge',
        href: '/charge',
        content: textSnippet('Body'),
        children: textSnippet('charge'),
      },
    );
    const trigger = screen.getByRole('link', { name: 'charge' });
    await tap(trigger);
    await waitFor(() => expect(card('Charge')).toBeVisible());
    const follow = within(card('Charge')).getByRole('link', {
      name: 'Open Charge',
    });
    expect(follow).toHaveAttribute('href', '/charge');
    expect(follow).toHaveAttribute('data-router-link');
    await tap(trigger);
    await waitFor(() => expect(card('Charge')).not.toBeVisible());
  });

  it('opens on tap and closes on a tap outside, unless pinned', async () => {
    render(NestedCards);
    const trigger = screen.getByRole('button', { name: 'charge' });
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
    const onOpenChange = vi.fn();
    render(HoverCard, {
      title: 'Charge',
      defaultOpen: true,
      onOpenChange,
      content: textSnippet('Body'),
      children: textSnippet('charge'),
    });
    await waitFor(() => expect(card('Charge')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(card('Charge')).not.toBeVisible());
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it.each([false, true])(
    'binds open, a function binding vetoes (refuse: %s)',
    async (refuse) => {
      render(BoundState, { kind: 'hover-card', refuse });
      await tap(screen.getByRole('button', { name: 'charge' }));
      expect(screen.getByText(/^held /).textContent).toBe(`held ${!refuse}`);
    },
  );
});
