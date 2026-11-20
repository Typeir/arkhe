import { REACT_EVENTS, SVELTE_EVENTS } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('event names', () => {
  it('names React handlers', () => {
    expect(REACT_EVENTS).toEqual({
      focus: 'onFocus',
      blur: 'onBlur',
      keydown: 'onKeyDown',
      pointerdown: 'onPointerDown',
      click: 'onClick',
    });
  });

  it('names Svelte handlers as Zag normalises them', () => {
    expect(SVELTE_EVENTS).toEqual({
      focus: 'onfocusin',
      blur: 'onfocusout',
      keydown: 'onkeydown',
      pointerdown: 'onpointerdown',
      click: 'onclick',
    });
  });
});
