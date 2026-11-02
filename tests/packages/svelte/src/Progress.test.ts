import { Progress } from '@arkhe/svelte';
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('Progress', () => {
  it('exposes value and text to assistive technology', () => {
    render(Progress, { value: 6, max: 10, label: 'Charge' });
    const bar = screen.getByRole('progressbar', { name: 'Charge' });
    expect(bar).toHaveAttribute('aria-valuenow', '6');
    expect(bar).toHaveAttribute('aria-valuetext', '6 of 10');
    expect(bar).not.toHaveAttribute('data-over');
  });

  it('caps the reported value and says the overflow', () => {
    render(Progress, { value: 13, max: 10, label: 'Charge', showValue: true });
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '10');
    expect(bar).toHaveAttribute('data-over', '');
    expect(screen.getByText('13 of 10, 3 over')).toBeInTheDocument();
  });

  it('places the fill and the markers', () => {
    const { container } = render(Progress, {
      value: 5,
      max: 10,
      label: 'Charge',
      markers: [2, 8],
    });
    const fill = container.querySelector('[data-part="fill"]') as HTMLElement;
    expect(fill.style.getPropertyValue('--progress')).toBe('0.5');
    const markers = [
      ...container.querySelectorAll<HTMLElement>('[data-part="marker"]'),
    ];
    expect(
      markers.map((marker) => marker.style.getPropertyValue('--at')),
    ).toEqual(['0.2', '0.8']);
    expect(markers[0]).toHaveAttribute('data-reached', '');
    expect(markers[1]).not.toHaveAttribute('data-reached');
  });
});
