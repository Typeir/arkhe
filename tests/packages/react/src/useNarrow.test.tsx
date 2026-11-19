import { resetNarrow, setNarrow } from '@tests/fixtures/narrow';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useNarrow } from '../../../../packages/react/src/useNarrow';

const Probe = () => <output>{useNarrow() ? 'narrow' : 'wide'}</output>;

afterEach(resetNarrow);

describe('useNarrow', () => {
  it('is wide where the window has no matchMedia', () => {
    render(<Probe />);
    expect(screen.getByText('wide')).toBeInTheDocument();
  });

  it('follows the window across phone width', () => {
    setNarrow(true);
    render(<Probe />);
    expect(screen.getByText('narrow')).toBeInTheDocument();
    act(() => setNarrow(false));
    expect(screen.getByText('wide')).toBeInTheDocument();
  });
});
