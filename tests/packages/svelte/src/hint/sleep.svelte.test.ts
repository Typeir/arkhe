import { HoverCard, Tooltip } from '@arkhe/svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { describe, expect, it } from 'vitest';

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
});
