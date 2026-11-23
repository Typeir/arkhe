import { fireEvent, render, screen } from '@testing-library/react';
import { sizeBox } from '@tests/fixtures/scrollBox';
import { describe, expect, it } from 'vitest';
import { useVirtualRows } from '../../../../../packages/react/src/list/useVirtualRows';

const Probe = ({ pitch }: { pitch?: number }) => {
  const { attach, ...rows } = useVirtualRows(100, pitch);
  return (
    <div data-testid='box' ref={attach} style={rows.vars}>
      <output>{`${rows.range.start}-${rows.range.end}`}</output>
      <span data-testid='row' {...rows.position(4)} />
      <button type='button' onClick={() => rows.scrollTo({ index: 50 })}>
        Go
      </button>
    </div>
  );
};

describe('useVirtualRows', () => {
  it('draws every row without a pitch', () => {
    render(<Probe />);
    expect(screen.getByRole('status')).toHaveTextContent('0-100');
    expect(screen.getByTestId('box')).not.toHaveAttribute('style');
    expect(screen.getByTestId('row')).not.toHaveAttribute('aria-setsize');
  });

  it('draws the overscan until measured, then the rows in view', () => {
    render(<Probe pitch={2} />);
    expect(screen.getByRole('status')).toHaveTextContent('0-8');
    const box = sizeBox(screen.getByTestId('box'), 100);
    box.scrollTop = 320;
    fireEvent.scroll(box);
    expect(screen.getByRole('status')).toHaveTextContent('2-22');
    expect(box.style.getPropertyValue('--virtual-before')).toBe('4rem');
    expect(box.style.getPropertyValue('--virtual-after')).toBe('156rem');
    expect(screen.getByTestId('row')).toHaveAttribute('aria-posinset', '5');
    expect(screen.getByTestId('row')).toHaveAttribute('aria-setsize', '100');
  });

  it('scrolls a row into view', () => {
    render(<Probe pitch={2} />);
    const box = sizeBox(screen.getByTestId('box'), 100);
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(box.scrollTop).toBe(1532);
  });
});
