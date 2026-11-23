import { fireEvent, render, screen, within } from '@testing-library/react';
import { sizeBox } from '@tests/fixtures/scrollBox';
import { describe, expect, it, vi } from 'vitest';
import { VirtualList } from '../../../../../packages/react/src/list/VirtualList';

const ROWS = Array.from({ length: 1000 }, (_, at) => `Entry ${at + 1}`);

describe('VirtualList', () => {
  it('draws only the first rows, each placed in the whole set', () => {
    render(
      <VirtualList
        items={ROWS}
        rowPitch={2}
        label='Entries'
        maxHeight='20rem'
        renderItem={(row) => <a href='#row'>{row}</a>}
      />,
    );
    const list = screen.getByRole('list', { name: 'Entries' });
    expect(list.localName).toBe('ul');
    expect(list.firstElementChild?.localName).toBe('li');
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(8);
    expect(rows[0]).toHaveAttribute('aria-posinset', '1');
    expect(rows[0]).toHaveAttribute('aria-setsize', '1000');
    expect(list).toHaveAttribute('data-virtual', '');
    expect(list.style.getPropertyValue('--virtual-after')).toBe('1984rem');
    expect(list.style.getPropertyValue('--virtual-max')).toBe('20rem');
  });

  it('follows the scroll and reports the rows in view', () => {
    const onRange = vi.fn();
    render(
      <VirtualList
        items={ROWS}
        rowPitch={2}
        getKey={(row) => row}
        onRange={onRange}
        renderItem={(row, index) => `${index}: ${row}`}
      />,
    );
    const list = sizeBox(screen.getByRole('list'), 320);
    list.scrollTop = 3200;
    fireEvent.scroll(list);
    expect(onRange).toHaveBeenLastCalledWith({ start: 100, end: 110 });
    const rows = within(list).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('92: Entry 93');
    expect(rows.at(-1)).toHaveTextContent('117: Entry 118');
    expect(list.style.getPropertyValue('--virtual-before')).toBe('184rem');
  });
});
