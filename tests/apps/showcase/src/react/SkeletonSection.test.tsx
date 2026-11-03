import { ArkheProvider } from '@arkhe/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SkeletonSection } from '../../../../../apps/showcase/src/react/SkeletonSection';
import {
  SPECIMEN_REVEAL,
  SPECIMEN_REVEAL_ROWS,
} from '../../../../../apps/showcase/src/specimen';

const groups = () =>
  document.querySelectorAll('[data-scope="skeleton"][data-part="group"]');

describe('React SkeletonSection', () => {
  it('starts loading: four owners of skeleton shapes, no content', () => {
    render(
      <ArkheProvider effects={false}>
        <SkeletonSection />
      </ArkheProvider>,
    );
    expect(groups()).toHaveLength(4);
    for (const group of groups()) expect(group).toHaveAttribute('data-loading');
    expect(screen.queryByText(SPECIMEN_REVEAL.title)).toBeNull();
    expect(
      document.querySelectorAll('[data-scope="skeleton"][data-part="root"]'),
    ).toHaveLength(8 + SPECIMEN_REVEAL_ROWS.length * 3);
  });

  it('loads, counts the three reveals, and reloads', async () => {
    render(
      <ArkheProvider effects={false}>
        <SkeletonSection />
      </ArkheProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Load' }));
    expect(screen.getByText(SPECIMEN_REVEAL.title)).toBeInTheDocument();
    expect(screen.getByText(SPECIMEN_REVEAL.card)).toBeInTheDocument();
    expect(screen.getByText('Item 30')).toBeInTheDocument();
    expect(screen.getByText('Revealed: 3')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(screen.queryByText(SPECIMEN_REVEAL.title)).toBeNull();
  });
});
