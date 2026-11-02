import { Tabs } from '@arkhe/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const ITEMS = [
  { value: 'stats', label: 'Stats' },
  { value: 'gear', label: 'Gear', disabled: true },
  { value: 'spell list', label: 'Spells' },
];

describe('Tabs', () => {
  it('names the list and shows the first enabled panel', () => {
    render(
      <Tabs items={ITEMS} label='Sheet' panels={(value) => `panel ${value}`} />,
    );
    expect(screen.getByRole('tablist', { name: 'Sheet' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Stats' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tabpanel')).toHaveTextContent('panel stats');
  });

  it('selects on click and reports the value', async () => {
    const onValueChange = vi.fn();
    render(
      <Tabs
        items={ITEMS}
        label='Sheet'
        onValueChange={onValueChange}
        panels={{ stats: 'Numbers', 'spell list': 'Fireball' }}
      />,
    );
    await userEvent.click(screen.getByRole('tab', { name: 'Spells' }));
    expect(onValueChange).toHaveBeenCalledWith('spell list');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Fireball');
  });

  it('ties each tab to its panel through ids built from the value', () => {
    render(
      <Tabs
        items={ITEMS}
        label='Sheet'
        defaultValue='spell list'
        panels={{}}
      />,
    );
    const tab = screen.getByRole('tab', { name: 'Spells' });
    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      tab.id,
    );
    expect(tab.id).toMatch(/spell-list-/);
  });

  it('falls back from a value that names no enabled tab', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Tabs items={ITEMS} label='Sheet' value='gear' panels={{}} />);
    expect(screen.getByRole('tab', { name: 'Stats' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('moves uncontrolled tabs off a selected tab that is removed or disabled', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const onValueChange = vi.fn();
    const panels = (key: string) => `panel ${key}`;
    const { rerender } = render(
      <Tabs
        items={ITEMS}
        label='Sheet'
        defaultValue='spell list'
        onValueChange={onValueChange}
        panels={panels}
      />,
    );
    rerender(
      <Tabs
        items={ITEMS.slice(0, 2)}
        label='Sheet'
        defaultValue='spell list'
        onValueChange={onValueChange}
        panels={panels}
      />,
    );
    expect(await screen.findByRole('tabpanel')).toHaveTextContent(
      'panel stats',
    );
    expect(screen.getByRole('tab', { name: 'Stats' })).toHaveAttribute(
      'tabindex',
      '0',
    );
    expect(onValueChange).toHaveBeenLastCalledWith('stats');
    rerender(
      <Tabs
        items={[
          { value: 'stats', label: 'Stats', disabled: true },
          { value: 'spell list', label: 'Spells' },
        ]}
        label='Sheet'
        panels={panels}
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole('tabpanel')).toHaveTextContent(
        'panel spell list',
      ),
    );
  });

  it('warns once per instance about an unknown value', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const view = <Tabs items={ITEMS} label='Sheet' value='lost' panels={{}} />;
    const { rerender } = render(view);
    rerender(<Tabs items={ITEMS} label='Sheet' value='lost' panels={{}} />);
    expect(warn).toHaveBeenCalledOnce();
    render(view);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('drops a tab that repeats an earlier value', () => {
    render(
      <Tabs
        items={[...ITEMS, { value: 'stats', label: 'Stats again' }]}
        label='Sheet'
        panels={{}}
      />,
    );
    expect(screen.queryByRole('tab', { name: 'Stats again' })).toBeNull();
  });
});
