import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import GroundProbe from '../../../../fixtures/svelte/GroundProbe.svelte';
import NestedFolders from '../../../../fixtures/svelte/NestedFolders.svelte';

function layerOf(name: string): string | null {
  const [list] = screen.getAllByRole('tablist', { name });
  return (
    list?.closest('[data-part="root"]')?.getAttribute('data-layer') ?? null
  );
}

describe('tabs ground', () => {
  it('is the page ground with no tab set around', () => {
    render(GroundProbe);
    expect(screen.getByRole('status')).toHaveTextContent('bg');
  });

  it('alternates folder layers as they nest, through line tabs too', () => {
    render(NestedFolders);
    expect(['Outer', 'Line', 'Inner', 'Deepest'].map(layerOf)).toEqual([
      'surface',
      null,
      'bg',
      'surface',
    ]);
    for (const probe of screen.getAllByRole('status')) {
      expect(probe).toHaveTextContent('surface');
    }
    expect(
      screen
        .getAllByRole('tablist', { name: 'Line' })[0]
        ?.closest('[data-look]'),
    ).toHaveAttribute('data-look', 'line');
  });
});
