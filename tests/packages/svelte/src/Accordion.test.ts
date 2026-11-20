import { Accordion } from '@arkhe/svelte';
import type { AccordionItem } from '@arkhe/core';
import { panelSnippet } from '@tests/fixtures/svelte/snippets';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const ITEMS: readonly AccordionItem[] = [
  { value: 'senses', title: 'Senses' },
  { value: 'actions', title: 'Actions' },
  { value: 'lair', title: 'Lair', disabled: true },
];

function trigger(name: string): HTMLElement {
  return screen.getByRole('button', { name });
}

describe('Accordion', () => {
  it('gives every section a heading, level 3 by default', () => {
    render(Accordion, { items: ITEMS, panel: panelSnippet() });
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(screen.getByText('panel senses')).toBeInTheDocument();
  });

  it('opens sections independently and reports them', async () => {
    const onValueChange = vi.fn();
    render(Accordion, { items: ITEMS, panel: panelSnippet(), onValueChange });
    await userEvent.click(trigger('Senses'));
    await userEvent.click(trigger('Actions'));
    expect(onValueChange).toHaveBeenLastCalledWith(['senses', 'actions']);
    expect(trigger('Senses')).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes the rest without multiple, and holds one when not collapsible', async () => {
    render(Accordion, {
      items: ITEMS,
      panel: panelSnippet(),
      multiple: false,
      collapsible: false,
      defaultValue: ['senses'],
      heading: 4,
    });
    expect(trigger('Senses')).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(trigger('Senses'));
    expect(trigger('Senses')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(trigger('Actions'));
    expect(trigger('Senses')).toHaveAttribute('aria-expanded', 'false');
    expect(trigger('Actions')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(3);
  });

  it('expands and collapses all from one button', async () => {
    render(Accordion, { items: ITEMS, panel: panelSnippet(), expandAll: true });
    const all = trigger('Expand all');
    expect(all).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(all);
    expect(trigger('Actions')).toHaveAttribute('aria-expanded', 'true');
    expect(trigger('Lair')).toHaveAttribute('aria-expanded', 'false');
    expect(trigger('Collapse all')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(trigger('Collapse all'));
    expect(trigger('Senses')).toHaveAttribute('aria-expanded', 'false');
  });

  it('follows a set value and drops repeated sections', () => {
    render(Accordion, {
      items: [...ITEMS, { value: 'senses', title: 'Again' }],
      panel: panelSnippet(),
      value: ['actions'],
    });
    expect(screen.queryByRole('button', { name: 'Again' })).toBeNull();
    expect(trigger('Actions')).toHaveAttribute('aria-expanded', 'true');
  });
});
