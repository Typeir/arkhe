import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CollapseSection } from '../../../../../apps/showcase/src/react/CollapseSection';

describe('React CollapseSection', () => {
  it('shows collapsibles, disclosures and accordions', () => {
    const { container } = render(<CollapseSection />);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Layer' }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('details')).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: 'Expand all' }),
    ).toBeInTheDocument();
  });

  it('grows the open section on request', async () => {
    render(<CollapseSection />);
    await userEvent.click(screen.getByRole('button', { name: 'Grow' }));
    expect(screen.getByText('Line 2')).toBeInTheDocument();
  });
  it('locks the layer controls and leaves its trigger live', async () => {
    render(<CollapseSection />);
    await userEvent.click(screen.getByRole('button', { name: 'Lock' }));
    expect(screen.getByRole('checkbox', { name: 'Dither' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Layer' })).toBeEnabled();
  });
});
