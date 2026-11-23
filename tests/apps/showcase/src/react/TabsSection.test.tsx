import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TabsSection } from '../../../../../apps/showcase/src/react/TabsSection';

describe('React TabsSection', () => {
  it('shows line tabs and folders nested three deep, layers alternating', () => {
    render(<TabsSection />);
    expect(screen.getByRole('tablist', { name: 'Sheet' })).toBeInTheDocument();
    const top = screen.getByRole('tablist', { name: 'Folder level 1' });
    expect(within(top).getAllByRole('tab')).toHaveLength(10);
    const layer = (name: string) =>
      screen
        .getAllByRole('tablist', { name })[0]
        ?.closest('[data-part="root"]')
        ?.getAttribute('data-layer');
    expect(
      ['Folder level 1', 'Folder level 2', 'Folder level 3'].map(layer),
    ).toEqual(['surface', 'bg', 'surface']);
  });
});
