import { SkeletonGroup } from '@arkhe/svelte';
import { announced } from '@tests/fixtures/announced';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { renderWithProvider } from '@tests/fixtures/svelte/renderWithProvider';
import { waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('SkeletonGroup', () => {
  it('speaks its hidden loading label once mounted, holding no live region', async () => {
    const { container } = renderWithProvider({}, SkeletonGroup, {
      children: textSnippet(''),
    });
    await waitFor(() => expect(announced()).toBe('Loading'));
    const group = container.querySelector('[data-part="group"]');
    expect(group).not.toHaveAttribute('role');
    expect(group).toHaveTextContent('Loading');
  });

  it('uses the translated loading label', async () => {
    renderWithProvider({ labels: { loading: 'Ladataan' } }, SkeletonGroup, {
      children: textSnippet(''),
    });
    await waitFor(() => expect(announced()).toBe('Ladataan'));
  });
});
