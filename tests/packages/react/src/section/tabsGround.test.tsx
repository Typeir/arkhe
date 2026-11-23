import { Tabs } from '@arkhe/react';
import { render, screen } from '@testing-library/react';
import { type JSX, useContext } from 'react';
import { describe, expect, it } from 'vitest';
import { TabsGroundContext } from '../../../../../packages/react/src/section/tabsGround';

const ITEMS = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
];

const Ground = (): JSX.Element => (
  <output>{useContext(TabsGroundContext)}</output>
);

const folder = (label: string, inner: JSX.Element) => (
  <Tabs look='folder' items={ITEMS} label={label} panels={() => inner} />
);

function layerOf(name: string): string | null {
  const [list] = screen.getAllByRole('tablist', { name });
  return (
    list?.closest('[data-part="root"]')?.getAttribute('data-layer') ?? null
  );
}

describe('TabsGroundContext', () => {
  it('is the page ground with no tab set around', () => {
    render(<Ground />);
    expect(screen.getByRole('status')).toHaveTextContent('bg');
  });

  it('alternates folder layers as they nest, through line tabs too', () => {
    render(
      folder(
        'Outer',
        <Tabs
          items={ITEMS}
          label='Line'
          panels={() => folder('Inner', folder('Deepest', <Ground />))}
        />,
      ),
    );
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
