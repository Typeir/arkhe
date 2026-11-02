import { SkeletonGroup } from '@arkhe/svelte';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { renderWithProvider } from '@tests/fixtures/svelte/renderWithProvider';
import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

function additions(region: Element): Node[] {
  const added: Node[] = [];
  new MutationObserver((records) => {
    for (const record of records) added.push(...record.addedNodes);
  }).observe(region, { childList: true });
  return added;
}

describe('SkeletonGroup', () => {
  it('announces one loading region with text of its own', async () => {
    render(SkeletonGroup, { children: textSnippet('') });
    const region = screen.getByRole('status', { name: 'Loading' });
    expect(region).not.toHaveAttribute('aria-busy');
    expect(region).toHaveTextContent('Loading');
    const added = additions(region);
    await waitFor(() => expect(added).toHaveLength(region.childNodes.length));
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
