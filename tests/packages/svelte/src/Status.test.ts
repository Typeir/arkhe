import { Status } from '@arkhe/svelte';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

function additions(region: Element): Node[] {
  const added: Node[] = [];
  new MutationObserver((records) => {
    for (const record of records) added.push(...record.addedNodes);
  }).observe(region, { childList: true });
  return added;
}

describe('Status', () => {
  it('says the kind default text politely', () => {
    render(Status, { kind: 'empty' });
    expect(screen.getByRole('status')).toHaveTextContent('Nothing here yet.');
  });

  it('interrupts for errors', () => {
    render(Status, { kind: 'error' });
    expect(screen.getByRole('alert')).toHaveAttribute('data-kind', 'error');
  });

  it('prefers given text and draws the kind icon', () => {
    const { container } = render(Status, {
      kind: 'info',
      children: textSnippet('Two rolls left.'),
    });
    expect(screen.getByRole('status')).toHaveTextContent('Two rolls left.');
    expect(container.querySelector('[data-scope="icon"]')).toHaveAttribute(
      'data-name',
      'info',
    );
  });

  it('re-inserts polite text once mounted so it is spoken', async () => {
    render(Status, { kind: 'loading' });
    const region = screen.getByRole('status');
    const added = additions(region);
    await waitFor(() => expect(added).toHaveLength(region.childNodes.length));
    expect(region).toHaveTextContent('Loading…');
  });

  it('leaves alerts alone: they speak on insertion', async () => {
    render(Status, { kind: 'error' });
    const added = additions(screen.getByRole('alert'));
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(added).toHaveLength(0);
  });
});
