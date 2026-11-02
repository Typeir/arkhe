import { Status } from '@arkhe/svelte';
import { announced } from '@tests/fixtures/announced';
import { renderWithProvider } from '@tests/fixtures/svelte/renderWithProvider';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { render, waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('Status', () => {
  it('says the kind default text politely, without a live role of its own', async () => {
    const { container } = renderWithProvider({}, Status, {
      kind: 'empty' as const,
    });
    await waitFor(() => expect(announced()).toBe('Nothing here yet.'));
    expect(
      container.querySelector('[data-scope="status"]'),
    ).not.toHaveAttribute('role');
  });

  it('interrupts for errors', async () => {
    renderWithProvider({}, Status, { kind: 'error' as const });
    await waitFor(() =>
      expect(announced('assertive')).toBe('Something went wrong.'),
    );
    expect(announced()).toBe('');
  });

  it('prefers given text and draws the kind icon', () => {
    const { container } = render(Status, {
      kind: 'info',
      children: textSnippet('Two rolls left.'),
    });
    expect(container.querySelector('[data-scope="status"]')).toHaveTextContent(
      'Two rolls left.',
    );
    expect(container.querySelector('[data-scope="icon"]')).toHaveAttribute(
      'data-name',
      'info',
    );
  });

  it('speaks each change of text, once', async () => {
    const { rerender } = renderWithProvider({}, Status, {
      kind: 'info' as const,
      children: textSnippet('One'),
    });
    await waitFor(() => expect(announced()).toBe('One'));
    await rerender({
      innerProps: { kind: 'info', children: textSnippet('Two') },
    });
    await waitFor(() => expect(announced()).toBe('OneTwo'));
  });

  it('speaks without a provider once its regions settle', async () => {
    render(Status, { kind: 'loading' });
    await waitFor(() => expect(announced()).toContain('Loading…'));
  });
});
