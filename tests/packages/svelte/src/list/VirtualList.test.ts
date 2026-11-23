import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { sizeBox } from '@tests/fixtures/scrollBox';
import { rowSnippet } from '@tests/fixtures/svelte/snippets';
import { describe, expect, it, vi } from 'vitest';
import VirtualList from '../../../../../packages/svelte/src/list/VirtualList.svelte';

const ROWS = Array.from({ length: 1000 }, (_, at) => `Entry ${at + 1}`);

describe('VirtualList', () => {
  it('draws only the first rows, each placed in the whole set', () => {
    render(VirtualList<string>, {
      items: ROWS,
      rowPitch: 2,
      label: 'Entries',
      maxHeight: '20rem',
      item: rowSnippet(),
    });
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

  it('follows the scroll and reports the rows in view', async () => {
    const onRange = vi.fn();
    render(VirtualList<string>, {
      items: ROWS,
      rowPitch: 2,
      getKey: (row: string) => row,
      onRange,
      item: rowSnippet(),
    });
    const list = sizeBox(screen.getByRole('list'), 320);
    list.scrollTop = 3200;
    await fireEvent.scroll(list);
    expect(onRange).toHaveBeenLastCalledWith({ start: 100, end: 110 });
    const rows = within(list).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('92: Entry 93');
    expect(rows.at(-1)).toHaveTextContent('117: Entry 118');
    expect(list.style.getPropertyValue('--virtual-before')).toBe('184rem');
  });
});
