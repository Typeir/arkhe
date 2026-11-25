import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Sleep } from '../../../../../packages/react/src/hint/useSleep';
import { LiveHoverCard } from '../../../../../packages/react/src/hint/LiveHoverCard';

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
    render(
      <LiveHoverCard
        title='Charge'
        id='r1'
        waking='hover'
        sleeper={sleeper(report)}
      />,
    );
    expect(report.mock.lastCall?.[0]).toMatchObject({
      id: 'hover-card:r1:trigger',
      'data-state': 'closed',
      'aria-expanded': false,
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders the card when it starts open', () => {
    render(
      <LiveHoverCard
        title='Charge'
        content={<p>Body</p>}
        defaultOpen
        id='r1'
        waking='open'
        sleeper={sleeper(() => undefined)}
      />,
    );
    expect(screen.getByRole('dialog', { name: 'Charge' })).toHaveTextContent(
      'Body',
    );
  });
});
