import { ArkheProvider, Skeleton, SkeletonGroup } from '@arkhe/react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

function additions(region: Element): Node[] {
  const added: Node[] = [];
  new MutationObserver((records) => {
    for (const record of records) added.push(...record.addedNodes);
  }).observe(region, { childList: true });
  return added;
}

describe('Skeleton', () => {
  it('renders a hidden line by default', () => {
    const { container } = render(<Skeleton />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar).toHaveAttribute('data-shape', 'line');
    expect(bar).toHaveAttribute('aria-hidden', 'true');
  });

  it('carries size through custom properties', () => {
    const { container } = render(
      <Skeleton shape='block' width='40%' height='4rem' />,
    );
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.style.getPropertyValue('--skeleton-width')).toBe('40%');
    expect(bar.style.getPropertyValue('--skeleton-height')).toBe('4rem');
  });
});

describe('SkeletonGroup', () => {
  it('announces one loading region with text of its own', async () => {
    render(
      <SkeletonGroup>
        <Skeleton />
      </SkeletonGroup>,
    );
    const region = screen.getByRole('status', { name: 'Loading' });
    expect(region).not.toHaveAttribute('aria-busy');
    expect(region).toHaveTextContent('Loading');
    const added = additions(region);
    await waitFor(() => expect(added).toHaveLength(region.childNodes.length));
  });

  it('uses the translated loading label', () => {
    render(
      <ArkheProvider labels={{ loading: 'Ladataan' }}>
        <SkeletonGroup>
          <Skeleton />
        </SkeletonGroup>
      </ArkheProvider>,
    );
    expect(
      screen.getByRole('status', { name: 'Ladataan' }),
    ).toBeInTheDocument();
  });
});
