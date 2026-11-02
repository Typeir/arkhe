import { ArkheProvider, Skeleton, SkeletonGroup } from '@arkhe/react';
import { announced } from '@tests/fixtures/announced';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
  it('speaks its hidden loading label once mounted, holding no live region', () => {
    const { container } = render(
      <ArkheProvider>
        <SkeletonGroup>
          <Skeleton />
        </SkeletonGroup>
      </ArkheProvider>,
    );
    expect(announced()).toBe('Loading');
    const group = container.querySelector('[data-part="group"]');
    expect(group).not.toHaveAttribute('role');
    expect(group).toHaveTextContent('Loading');
  });

  it('uses the translated loading label', () => {
    render(
      <ArkheProvider labels={{ loading: 'Ladataan' }}>
        <SkeletonGroup>
          <Skeleton />
        </SkeletonGroup>
      </ArkheProvider>,
    );
    expect(announced()).toBe('Ladataan');
  });
});
