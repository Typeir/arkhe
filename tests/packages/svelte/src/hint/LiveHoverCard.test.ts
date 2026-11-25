import { render, screen } from '@testing-library/svelte';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { describe, expect, it, vi } from 'vitest';
import type { Sleep } from '../../../../../packages/svelte/src/hint/sleep.svelte';
import LiveHoverCard from '../../../../../packages/svelte/src/hint/LiveHoverCard.svelte';

const sleeper = (report: (props: object) => void): Sleep => ({
  waking: 'hover',
  attrs: {},
  report,
  hovering: () => false,
  fresh: true,
  press: null,
  sleep: () => undefined,
});

describe('LiveHoverCard', () => {
  it('reports the closed trigger props with its aria and renders no card while closed', () => {
    const report = vi.fn();
    render(LiveHoverCard, {
      title: 'Charge',
      id: 'r1',
      waking: 'hover',
      sleeper: sleeper(report),
    });
    expect(report.mock.lastCall?.[0]).toMatchObject({
      id: 'hover-card:r1:trigger',
      'data-state': 'closed',
      'aria-expanded': false,
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders the card when it starts open', () => {
    render(LiveHoverCard, {
      title: 'Charge',
      content: textSnippet('Body'),
      defaultOpen: true,
      id: 'r1',
      waking: 'open',
      sleeper: sleeper(() => undefined),
    });
    expect(screen.getByRole('dialog', { name: 'Charge' })).toHaveTextContent(
      'Body',
    );
  });
});
