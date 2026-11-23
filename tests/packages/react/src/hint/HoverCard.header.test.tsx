import { HoverCard } from '@arkhe/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { tap } from '@tests/fixtures/tap';
import { describe, expect, it } from 'vitest';

function card(title: string) {
  return screen
    .getAllByText(title, { selector: '[data-part="title"]' })[0]
    .closest('[data-part="content"]') as HTMLElement;
}

describe('HoverCard header', () => {
  it('takes header actions, and can leave the link out of the header', async () => {
    render(
      <HoverCard
        title='Charge'
        content='Body'
        href='/charge'
        headerLink={false}
        actions={<button type='button'>Copy</button>}>
        charge
      </HoverCard>,
    );
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
