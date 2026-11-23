import { Collapsible } from '@arkhe/svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import BoundUnset from '@tests/fixtures/svelte/BoundUnset.svelte';
import { buttonSnippet, textSnippet } from '@tests/fixtures/svelte/snippets';
import { describe, expect, it, vi } from 'vitest';

function region(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-part="content"]') as HTMLElement;
}

describe('Collapsible', () => {
  it('ties a stable trigger name to a findable closed region', () => {
    const { container } = render(Collapsible, {
      title: 'Lore',
      children: textSnippet('Old roads.'),
    });
    const trigger = screen.getByRole('button', { name: 'Lore' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', region(container).id);
    expect(region(container).getAttribute('hidden')).toBe('until-found');
  });

  it('opens and closes on press, reporting each change', async () => {
    const onOpenChange = vi.fn();
    const { container } = render(Collapsible, {
      title: 'Lore',
      onOpenChange,
      children: textSnippet('Old roads.'),
    });
    const trigger = screen.getByRole('button', { name: 'Lore' });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(region(container)).not.toHaveAttribute('hidden');
    expect(
      container.querySelector('[data-scope="collapsible"]'),
    ).toHaveAttribute('data-state', 'open');
    await userEvent.click(trigger);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('opens when the browser reveals the region', async () => {
    const onOpenChange = vi.fn();
    render(Collapsible, {
      title: 'Lore',
      onOpenChange,
      children: textSnippet('Old roads.'),
    });
    await fireEvent(
      screen.getByText('Old roads.'),
      new Event('beforematch', { bubbles: true }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('wraps the trigger in a heading and keeps actions outside it', () => {
    render(Collapsible, {
      title: 'Layer',
      heading: 3,
      actions: buttonSnippet('Lock'),
      children: textSnippet('Body'),
    });
    const heading = screen.getByRole('heading', { level: 3, name: 'Layer' });
    expect(heading).toContainElement(
      screen.getByRole('button', { name: 'Layer' }),
    );
    expect(heading).not.toContainElement(
      screen.getByRole('button', { name: 'Lock' }),
    );
  });

  it('follows a set state and ignores presses while disabled', async () => {
    const { rerender } = render(Collapsible, {
      title: 'Lore',
      open: true,
      children: textSnippet('Body'),
    });
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await rerender({ open: false, disabled: true });
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('mounts lazy content on first open and keeps it', async () => {
    render(Collapsible, {
      title: 'Lore',
      lazy: true,
      children: textSnippet('Old roads.'),
    });
    expect(screen.queryByText('Old roads.')).toBeNull();
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    expect(screen.getByText('Old roads.')).toBeInTheDocument();
  });

  it('is a section with a header only when it has a heading', () => {
    const { container } = render(Collapsible, {
      title: 'Layer',
      heading: 3,
      children: textSnippet('Body'),
    });
    const root = container.querySelector(
      '[data-scope="collapsible"][data-part="root"]',
    ) as HTMLElement;
    expect(root.localName).toBe('section');
    expect(root.querySelector('[data-part="header"]')?.localName).toBe(
      'header',
    );
  });

  it('stays plain containers without a heading', () => {
    const { container } = render(Collapsible, {
      title: 'Layer',
      children: textSnippet('Body'),
    });
    const root = container.querySelector(
      '[data-scope="collapsible"][data-part="root"]',
    ) as HTMLElement;
    expect(root.localName).toBe('div');
    expect(root.querySelector('[data-part="header"]')?.localName).toBe('div');
  });

  it('starts from defaultOpen under a binding that starts unset', async () => {
    render(BoundUnset, { kind: 'collapsible' });
    const trigger = screen.getByRole('button', { name: 'Notes' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('held undefined')).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('held false')).toBeInTheDocument();
  });
});
