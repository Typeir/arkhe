import { Tooltip } from '@arkhe/svelte';
import BoundState from '@tests/fixtures/svelte/BoundState.svelte';
import NestedTips from '@tests/fixtures/svelte/NestedTips.svelte';
import { renderWithProvider } from '@tests/fixtures/svelte/renderWithProvider';
import RouterLink from '@tests/fixtures/svelte/RouterLink.svelte';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { tap } from '@tests/fixtures/tap';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet, type Component } from 'svelte';
import { describe, expect, it } from 'vitest';

const held = () => screen.getByText(/^held /).textContent;

describe('Tooltip', () => {
  it('shows its hint on hover and describes the trigger', async () => {
    render(Tooltip, {
      content: 'Resistance halves damage.',
      openDelay: 0,
      children: textSnippet('resistance'),
    });
    const trigger = screen.getByRole('button', { name: 'resistance' });
    expect(trigger).toHaveAttribute('type', 'button');
    await userEvent.hover(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Resistance halves damage.',
    );
    expect(trigger).toHaveAccessibleDescription('Resistance halves damage.');
  });

  it('hides on Escape', async () => {
    render(Tooltip, {
      content: 'Hint',
      openDelay: 0,
      closeDelay: 0,
      children: textSnippet('word'),
    });
    await userEvent.hover(screen.getByRole('button', { name: 'word' }));
    await screen.findByRole('tooltip');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('mounts its body on first open and keeps it, hidden, after', async () => {
    const { container } = render(Tooltip, {
      content: 'Hint',
      openDelay: 0,
      closeDelay: 0,
      children: textSnippet('word'),
    });
    expect(container.querySelector('[data-part="positioner"]')).toBeNull();
    await userEvent.hover(screen.getByRole('button', { name: 'word' }));
    await screen.findByRole('tooltip');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        container.querySelector('[data-part="positioner"]'),
      ).toHaveAttribute('hidden'),
    );
  });

  it('takes a snippet as rich phrasing content', async () => {
    render(Tooltip, {
      content: createRawSnippet(() => ({ render: () => '<em>very</em>' })),
      defaultOpen: true,
      children: textSnippet('word'),
    });
    expect(await screen.findByRole('tooltip')).toContainHTML('<em>very</em>');
  });

  it("renders a link trigger through the provider's link, else an a", () => {
    renderWithProvider(
      { link: RouterLink as Component<Record<string, unknown>> },
      Tooltip,
      { content: 'Hint', href: '/rule', children: textSnippet('rule') },
    );
    const link = screen.getByRole('link', { name: 'rule' });
    expect(link).toHaveAttribute('href', '/rule');
    expect(link).toHaveAttribute('data-router-link');
    render(Tooltip, {
      content: 'Hint',
      href: '/plain',
      children: textSnippet('plain'),
    });
    expect(screen.getByRole('link', { name: 'plain' })).toHaveAttribute(
      'data-part',
      'trigger',
    );
  });

  it('renders an inline trigger that holds another trigger', async () => {
    render(NestedTips);
    const inner = screen.getByText('inner');
    const outer = inner.parentElement?.closest(
      '[data-part="trigger"]',
    ) as HTMLElement;
    expect(outer).toHaveAttribute('tabindex', '0');
    expect(screen.queryByRole('button')).toBeNull();
    await userEvent.hover(inner);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Inner');
    expect(outer).toHaveAttribute('data-state', 'closed');
  });

  it('toggles on tap and closes on a tap outside', async () => {
    render(NestedTips);
    const outer = screen.getByText('outer', { exact: false });
    await tap(outer);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Outer');
    await tap(outer);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    await tap(outer);
    await screen.findByRole('tooltip');
    await tap(screen.getByText('elsewhere'));
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it.each([false, true])(
    'binds open, a function binding vetoes (refuse: %s)',
    async (refuse) => {
      render(BoundState, { kind: 'tooltip', refuse });
      await tap(screen.getByRole('button', { name: 'word' }));
      expect(held()).toBe(`held ${!refuse}`);
      expect(screen.queryByRole('tooltip') !== null).toBe(!refuse);
    },
  );
});
