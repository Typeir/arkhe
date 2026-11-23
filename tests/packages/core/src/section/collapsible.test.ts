// @vitest-environment jsdom
import {
  collapsibleIds,
  collapsibleReduce,
  findableRegion,
  headingTag,
} from '@arkhe/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('collapsibleIds', () => {
  it('derives trigger and content ids safe for IDREFs', () => {
    expect(collapsibleIds(':r1:')).toEqual({
      trigger: '-r1--trigger',
      content: '-r1--content',
    });
  });
});

describe('headingTag', () => {
  it('names the heading level, or none', () => {
    expect(headingTag(3)).toBe('h3');
    expect(headingTag(undefined)).toBeUndefined();
  });
});

describe('findableRegion', () => {
  function section(): HTMLElement {
    document.body.innerHTML = `
      <div id="root">
        <button>Open</button>
        <div data-findable hidden><p>Lore</p></div>
      </div>`;
    return document.getElementById('root') as HTMLElement;
  }

  it('turns plain hidden into until-found, now and later', async () => {
    const root = section();
    const region = root.querySelector('[data-findable]') as HTMLElement;
    const stop = findableRegion(root, () => undefined);
    expect(region.getAttribute('hidden')).toBe('until-found');
    region.removeAttribute('hidden');
    region.setAttribute('hidden', '');
    await Promise.resolve();
    expect(region.getAttribute('hidden')).toBe('until-found');
    stop();
  });

  it('opens when the browser reveals the region or one inside it', () => {
    const root = section();
    const onFound = vi.fn();
    const stop = findableRegion(root, onFound);
    root
      .querySelector('p')
      ?.dispatchEvent(new Event('beforematch', { bubbles: true }));
    expect(onFound).toHaveBeenCalledOnce();
    stop();
    root
      .querySelector('p')
      ?.dispatchEvent(new Event('beforematch', { bubbles: true }));
    expect(onFound).toHaveBeenCalledOnce();
  });
});

describe('collapsibleReduce', () => {
  it('toggles and sets', () => {
    expect(collapsibleReduce(false, { type: 'toggle' }, {})).toBe(true);
    expect(collapsibleReduce(true, { type: 'set', open: false }, {})).toBe(
      false,
    );
  });

  it('ignores presses and sets while disabled, never a reveal', () => {
    const rules = { disabled: true };
    expect(collapsibleReduce(false, { type: 'toggle' }, rules)).toBe(false);
    expect(collapsibleReduce(true, { type: 'set', open: false }, rules)).toBe(
      true,
    );
    expect(collapsibleReduce(false, { type: 'reveal' }, rules)).toBe(true);
  });
});
