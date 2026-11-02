import { SkeletonGroup } from '@arkhe/svelte';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { renderWithProvider } from '@tests/fixtures/svelte/renderWithProvider';
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('SkeletonGroup', () => {
  it('announces one busy region', () => {
    render(SkeletonGroup, { children: textSnippet('') });
    expect(screen.getByRole('status', { name: 'Loading' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('uses the translated loading label', () => {
    renderWithProvider({ labels: { loading: 'Ladataan' } }, SkeletonGroup, {
      children: textSnippet(''),
    });
    expect(
      screen.getByRole('status', { name: 'Ladataan' }),
    ).toBeInTheDocument();
  });
});
