import { resetNarrow, setNarrow } from '@tests/fixtures/narrow';
import NarrowProbe from '@tests/fixtures/svelte/NarrowProbe.svelte';
import { render, screen } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(resetNarrow);

describe('useNarrow', () => {
  it('is wide where the window has no matchMedia', () => {
    render(NarrowProbe);
    expect(screen.getByText('wide')).toBeInTheDocument();
  });

  it('follows the window across phone width', () => {
    setNarrow(true);
    render(NarrowProbe);
    expect(screen.getByText('narrow')).toBeInTheDocument();
    setNarrow(false);
    flushSync();
    expect(screen.getByText('wide')).toBeInTheDocument();
  });
});
