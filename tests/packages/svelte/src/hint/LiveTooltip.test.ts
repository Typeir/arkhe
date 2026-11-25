import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import LiveTooltip from '../../../../../packages/svelte/src/hint/LiveTooltip.svelte';

describe('LiveTooltip', () => {
  it('reports the closed trigger props and renders no body while closed', () => {
    const report = vi.fn();
    render(LiveTooltip, {
      content: 'Hint',
      id: 'r1',
      waking: 'hover',
      report,
      hovering: () => false,
    });
    expect(report).toHaveBeenCalled();
    expect(report.mock.lastCall?.[0]).toMatchObject({
      id: 'tooltip:r1:trigger',
      'data-state': 'closed',
    });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('renders the body when it starts open', () => {
    render(LiveTooltip, {
      content: 'Hint',
      defaultOpen: true,
      id: 'r1',
      waking: 'open',
      report: () => undefined,
      hovering: () => false,
    });
    expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent(
      'Hint',
    );
  });
});
