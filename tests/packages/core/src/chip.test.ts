import { removeChip } from '@arkhe/core';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';

function chips(markup: string) {
  const { document } = new JSDOM(markup).window;
  const remove = (name: string) =>
    document.querySelector<HTMLElement>(`[aria-label="Remove ${name}"]`)!;
  return { document, remove };
}

function chip(name: string): string {
  return `<span data-scope="chip" data-part="root"><button data-scope="chip" data-part="remove" aria-label="Remove ${name}"></button></span>`;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('removeChip', () => {
  it('focuses the next remove button once the chip is gone', () => {
    vi.useFakeTimers();
    const { document, remove } = chips(
      `<div>${chip('a')}${chip('b')}${chip('c')}</div>`,
    );
    const button = remove('b');
    button.focus();
    const host = vi.fn(() => button.parentElement!.remove());
    removeChip(button, host);
    expect(host).toHaveBeenCalledOnce();
    vi.runAllTimers();
    expect(document.activeElement).toBe(remove('c'));
  });

  it('falls back to the previous chip, looking past one-chip wrappers', () => {
    vi.useFakeTimers();
    const { document, remove } = chips(
      `<ul><li>${chip('a')}</li><li>${chip('b')}</li></ul>`,
    );
    const button = remove('b');
    button.focus();
    removeChip(button, () => button.closest('li')!.remove());
    vi.runAllTimers();
    expect(document.activeElement).toBe(remove('a'));
  });

  it('leaves focus alone when the button was not focused or the chip stays', () => {
    vi.useFakeTimers();
    const { document, remove } = chips(`<div>${chip('a')}${chip('b')}</div>`);
    const unfocused = remove('a');
    removeChip(unfocused, () => unfocused.parentElement!.remove());
    vi.runAllTimers();
    expect(document.activeElement).toBe(document.body);
    const kept = remove('b');
    kept.focus();
    removeChip(kept, () => undefined);
    vi.runAllTimers();
    expect(document.activeElement).toBe(kept);
  });
});
