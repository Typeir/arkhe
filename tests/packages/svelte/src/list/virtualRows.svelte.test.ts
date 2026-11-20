import { sizeBox } from '@tests/fixtures/scrollBox';
import VirtualProbe from '@tests/fixtures/svelte/VirtualProbe.svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('useVirtualRows', () => {
  it('draws every row without a pitch', () => {
    render(VirtualProbe);
    expect(screen.getByRole('status')).toHaveTextContent('0-100');
    expect(screen.getByTestId('box').getAttribute('style') ?? '').toBe('');
    expect(screen.getByTestId('row')).not.toHaveAttribute('aria-setsize');
  });

  it('draws the overscan until measured, then the rows in view', async () => {
    render(VirtualProbe, { pitch: 2 });
    expect(screen.getByRole('status')).toHaveTextContent('0-8');
    const box = sizeBox(screen.getByTestId('box'), 100);
    box.scrollTop = 320;
    await fireEvent.scroll(box);
    expect(screen.getByRole('status')).toHaveTextContent('2-22');
    expect(box.style.getPropertyValue('--virtual-before')).toBe('4rem');
    expect(box.style.getPropertyValue('--virtual-after')).toBe('156rem');
    expect(screen.getByTestId('row')).toHaveAttribute('aria-posinset', '5');
    expect(screen.getByTestId('row')).toHaveAttribute('aria-setsize', '100');
  });

  it('scrolls a row into view', async () => {
    render(VirtualProbe, { pitch: 2 });
    const box = sizeBox(screen.getByTestId('box'), 100);
    await fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(box.scrollTop).toBe(1532);
  });
});
