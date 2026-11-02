import { Tabs } from '@arkhe/svelte';
import { panelSnippet, textSnippet } from '@tests/fixtures/svelte/snippets';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const ITEMS = [
  { value: 'stats', label: 'Stats' },
  { value: 'gear', label: 'Gear', disabled: true },
  { value: 'spells', label: 'Spells' },
];

describe('Tabs', () => {
  it('names the list and shows the first enabled panel', () => {
    render(Tabs, { items: ITEMS, label: 'Sheet', panel: panelSnippet() });
    expect(screen.getByRole('tablist', { name: 'Sheet' })).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('panel stats');
  });

  it('selects on click and reports the value', async () => {
    const onValueChange = vi.fn();
    render(Tabs, {
      items: ITEMS,
      label: 'Sheet',
      onValueChange,
      panel: panelSnippet(),
    });
    await userEvent.click(screen.getByRole('tab', { name: 'Spells' }));
    expect(onValueChange).toHaveBeenCalledWith('spells');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('panel spells');
  });

  it('takes one named slot per value when no panel snippet is given', () => {
    render(Tabs, {
      items: ITEMS,
      label: 'Sheet',
      defaultValue: 'spells',
      spells: textSnippet('Fireball'),
    });
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Fireball');
  });

  it('warns once per instance about an unknown value', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const props = {
      items: ITEMS,
      label: 'Sheet',
      value: 'lost',
      panel: panelSnippet(),
    };
    const { rerender } = render(Tabs, props);
    await rerender({ label: 'Sheet again' });
    expect(warn).toHaveBeenCalledOnce();
    render(Tabs, props);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('drops a tab that repeats an earlier value', () => {
    render(Tabs, {
      items: [...ITEMS, { value: 'stats', label: 'Stats again' }],
      label: 'Sheet',
      panel: panelSnippet(),
    });
    expect(screen.queryByRole('tab', { name: 'Stats again' })).toBeNull();
  });
});
