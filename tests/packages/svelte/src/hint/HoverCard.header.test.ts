import { HoverCard } from '@arkhe/svelte';
import { render, screen, waitFor, within } from '@testing-library/svelte';
import { buttonSnippet, textSnippet } from '@tests/fixtures/svelte/snippets';
import { tap } from '@tests/fixtures/tap';
import { describe, expect, it } from 'vitest';

function card(title: string) {
  return screen
    .getAllByText(title, { selector: '[data-part="title"]' })[0]
    .closest('[data-part="content"]') as HTMLElement;
}

describe('HoverCard header', () => {
  it('takes header actions, and can leave the link out of the header', async () => {
    render(HoverCard, {
      title: 'Charge',
      href: '/charge',
      headerLink: false,
      actions: buttonSnippet('Copy'),
      content: textSnippet('Body'),
      children: textSnippet('charge'),
    });
    const trigger = screen.getByRole('link', { name: 'charge' });
    await tap(trigger);
    await waitFor(() => expect(card('Charge')).toBeVisible());
    const header = card('Charge').querySelector('[data-part="header"]');
    expect(
      within(header as HTMLElement).getByRole('button', { name: 'Copy' }),
    ).toBeInTheDocument();
    expect(
      within(card('Charge')).queryByRole('link', { name: 'Open Charge' }),
    ).toBeNull();
    expect(trigger).toHaveAttribute('href', '/charge');
  });
});
