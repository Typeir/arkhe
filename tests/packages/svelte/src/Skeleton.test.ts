import { Skeleton } from '@arkhe/svelte';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('Skeleton', () => {
  it('renders a hidden line by default', () => {
    const { container } = render(Skeleton);
    const bar = container.querySelector(
      '[data-scope="skeleton"]',
    ) as HTMLElement;
    expect(bar).toHaveAttribute('data-shape', 'line');
    expect(bar).toHaveAttribute('aria-hidden', 'true');
  });

  it('carries size through custom properties', () => {
    const { container } = render(Skeleton, {
      shape: 'block',
      width: '40%',
      height: '4rem',
    });
    const bar = container.querySelector(
      '[data-scope="skeleton"]',
    ) as HTMLElement;
    expect(bar.style.getPropertyValue('--skeleton-width')).toBe('40%');
    expect(bar.style.getPropertyValue('--skeleton-height')).toBe('4rem');
  });
});
