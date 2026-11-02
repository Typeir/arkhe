import { Tabs } from '@arkhe/react';
import { render, screen } from '@testing-library/react';
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
