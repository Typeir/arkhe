// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FOCUSABLE,
  isElement,
  isNode,
  mainDocument,
  ownWindow,
  watchFindable,
  windowOf,
} from '../../../../../packages/core/src/base/dom';

describe('mainDocument', () => {
  it('returns the main document, null without one', () => {
    expect(mainDocument()).toBe(document);
    vi.stubGlobal('document', undefined);
    expect(mainDocument()).toBeNull();
    vi.unstubAllGlobals();
  });
});

describe('isNode / isElement', () => {
  it('tells nodes and elements apart without instanceof', () => {
    const div = document.createElement('div');
    expect(isElement(div)).toBe(true);
    expect(isNode(document.createTextNode('x'))).toBe(true);
    expect(isElement(document.createTextNode('x'))).toBe(false);
    expect(isNode(window)).toBe(false);
    expect(isNode(null)).toBe(false);
  });

  it('knows an element from another window', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const foreign = frame.contentDocument?.createElement('div');
    expect(foreign instanceof Element).toBe(false);
    expect(isElement(foreign)).toBe(true);
    frame.remove();
  });
});

describe('FOCUSABLE', () => {
  it('matches enabled controls, not disabled, hidden or untabbable ones', () => {
    document.body.innerHTML = `
      <button id="on">a</button>
      <fieldset disabled><button id="fenced">b</button></fieldset>
      <input id="hidden" type="hidden" />
      <span id="minus" tabindex="-1"></span>
      <span id="zero" tabindex="0"></span>`;
    const ids = [...document.querySelectorAll(FOCUSABLE)].map((el) => el.id);
    expect(ids).toEqual(['on', 'zero']);
    document.body.innerHTML = '';
  });
});

describe('watchFindable', () => {
  it('makes hidden children findable and reports what the browser reveals', () => {
    document.body.innerHTML =
      '<div id="root"><div data-findable hidden id="a"></div></div>';
    const root = document.getElementById('root') as HTMLElement;
    const found = vi.fn();
    const stop = watchFindable(root, found);
    const child = document.getElementById('a') as HTMLElement;
    expect(child.getAttribute('hidden')).toBe('until-found');
    child.dispatchEvent(new Event('beforematch', { bubbles: true }));
    expect(found).toHaveBeenCalledWith(child);
    stop();
    document.body.innerHTML = '';
  });
});

describe('ownWindow', () => {
  it('is the window core was loaded in', () => {
    expect(ownWindow()).toBe(window);
  });
});

describe('windowOf', () => {
  afterEach(() => document.body.replaceChildren());

  it('reaches the window that owns an element or a document', () => {
    const el = document.createElement('div');
    expect(windowOf(el)).toBe(window);
    expect(windowOf(document)).toBe(window);
  });

  it('reaches a frame’s own window for its elements', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const inner = frame.contentDocument as Document;
    expect(windowOf(inner.body)).toBe(frame.contentWindow);
    expect(windowOf(inner.body)).not.toBe(window);
  });

  it('falls back to core’s window without a node or a view', () => {
    const detached = document.implementation.createHTMLDocument('');
    expect(windowOf()).toBe(window);
    expect(windowOf(detached.body)).toBe(window);
  });
});
