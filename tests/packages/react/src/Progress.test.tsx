import { Progress } from '@arkhe/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const root = (bar: HTMLElement) =>
  bar.closest('[data-part="root"]') as HTMLElement;

describe('Progress', () => {
  it('is a native progress element carrying value and text', () => {
    render(<Progress value={6} max={10} label='Charge' />);
    const bar = screen.getByRole('progressbar', { name: 'Charge' });
    expect(bar.localName).toBe('progress');
    expect(bar).toHaveAttribute('value', '6');
    expect(bar).toHaveAttribute('max', '10');
    expect(bar).toHaveAttribute('aria-valuetext', '6 of 10');
    expect(root(bar)).not.toHaveAttribute('data-over');
  });

  it('caps the value and says the overflow, shown for sight only', () => {
    render(<Progress value={13} max={10} label='Charge' showValue />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('value', '10');
    expect(bar).toHaveAttribute('aria-valuetext', '13 of 10, 3 over');
    expect(root(bar)).toHaveAttribute('data-over', '');
    expect(screen.getByText('13 of 10, 3 over')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('places the markers beside the bar', () => {
    const { container } = render(
      <Progress value={5} max={10} label='Charge' markers={[2, 8]} />,
    );
    const markers = [
      ...container.querySelectorAll<HTMLElement>('[data-part="marker"]'),
    ];
    expect(
      markers.map((marker) => marker.style.getPropertyValue('--at')),
    ).toEqual(['0.2', '0.8']);
    expect(markers[0]).toHaveAttribute('data-reached', '');
    expect(markers[1]).not.toHaveAttribute('data-reached');
    expect(screen.getByRole('progressbar')).not.toContainElement(
      markers[0] ?? null,
    );
  });

  it('is indeterminate without a value', () => {
    render(<Progress max={10} label='Loading' showValue />);
    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar).not.toHaveAttribute('value');
    expect(bar).not.toHaveAttribute('aria-valuetext');
    expect(bar.matches(':indeterminate')).toBe(true);
    expect(root(bar).querySelector('[data-part="value"]')).toBeNull();
  });
});
