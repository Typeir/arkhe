import { HoverCard, Tooltip } from '@arkhe/svelte';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { textSnippet, valueSnippet } from '@tests/fixtures/svelte/snippets';
import { describe, expect, it, vi } from 'vitest';

const attributes = (el: Element) =>
  Object.fromEntries([...el.attributes].map((a) => [a.name, a.value]));

describe('useSleep', () => {
  it('sleeps with the closed trigger attributes and wakes on the same node', async () => {
    render(Tooltip, {
      content: 'Hint',
      openDelay: 10_000,
      children: textSnippet('word'),
    });
    const trigger = screen.getByRole('button', { name: 'word' });
    const before = attributes(trigger);
    expect(before).toMatchObject({
      'data-scope': 'tooltip',
      'data-part': 'trigger',
      'data-state': 'closed',
    });
    await fireEvent.pointerOver(trigger, { pointerType: 'mouse' });
    expect(screen.getByRole('button', { name: 'word' })).toBe(trigger);
    expect(attributes(trigger)).toEqual(before);
  });

  it('wakes at once when it starts open', () => {
    render(Tooltip, {
      content: 'Hint',
      defaultOpen: true,
      children: textSnippet('word'),
    });
    expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent(
      'Hint',
    );
  });

  it.each([
    ['button', {}],
    ['inline', { inline: true }],
    ['link', { href: '#charge' }],
  ])(
    'wakes a %s HoverCard without touching the trigger node or its attributes',
    async (_kind, extra) => {
      render(HoverCard, {
        title: 'Charge',
        openDelay: 10_000,
        children: textSnippet('charge'),
        ...extra,
      });
      const trigger = document.querySelector(
        '[data-scope="hover-card"][data-part="trigger"]',
      ) as HTMLElement;
      const before = attributes(trigger);
      await fireEvent.pointerOver(trigger, { pointerType: 'mouse' });
      expect(
        document.querySelector(
          '[data-scope="hover-card"][data-part="trigger"]',
        ),
      ).toBe(trigger);
      expect(attributes(trigger)).toEqual(before);
    },
  );

  it('sleeps again after closing, on the same trigger node', async () => {
    render(Tooltip, {
      content: 'Hint',
      openDelay: 0,
      closeDelay: 0,
      children: textSnippet('word'),
    });
    const trigger = screen.getByRole('button', { name: 'word' });
    const before = attributes(trigger);
    await userEvent.hover(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Hint');
    await userEvent.unhover(trigger);
    await waitFor(() =>
      expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull(),
    );
    expect(screen.getByRole('button', { name: 'word' })).toBe(trigger);
    expect(attributes(trigger)).toEqual(before);
    await userEvent.hover(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Hint');
  });

  it('counts defaultOpen only before the first sleep', async () => {
    render(HoverCard, {
      title: 'Charge',
      content: textSnippet('Body'),
      defaultOpen: true,
      openDelay: 10_000,
      children: textSnippet('charge'),
    });
    expect(screen.getByRole('dialog', { name: 'Charge' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await fireEvent.pointerOver(
      screen.getByRole('button', { name: 'charge' }),
      { pointerType: 'mouse' },
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps a loaded card body across sleeps', async () => {
    const load = vi.fn(async () => 'Loaded body');
    render(HoverCard<string>, {
      title: 'Charge',
      load,
      loaded: valueSnippet(),
      openDelay: 0,
      closeDelay: 0,
      children: textSnippet('charge'),
    });
    const trigger = screen.getByRole('button', { name: 'charge' });
    await userEvent.hover(trigger);
    expect(await screen.findByText('Loaded body')).toBeInTheDocument();
    await userEvent.unhover(trigger);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await userEvent.hover(trigger);
    const reopened = await screen.findByRole('dialog', { name: 'Charge' });
    expect(within(reopened).getByText('Loaded body')).toBeInTheDocument();
    expect(within(reopened).queryByText('Loading…')).toBeNull();
    expect(load).toHaveBeenCalledTimes(1);
  });
});
