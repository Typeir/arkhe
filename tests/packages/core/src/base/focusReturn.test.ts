// @vitest-environment jsdom
import { FocusReturn, focusCandidates, focusableIn } from '@arkhe/core';
import { afterEach, describe, expect, it } from 'vitest';

const build = (html: string) => {
  document.body.innerHTML = html;
  return (id: string) => document.getElementById(id) as HTMLElement;
};

const ids = (nodes: Element[]) => nodes.map((node) => node.id);

afterEach(() => document.body.replaceChildren());

describe('focusCandidates', () => {
  it('ranks siblings nearest first, older before newer, then climbs', () => {
    const $ = build(
      '<div id="g"><div id="p0"></div><div id="p">' +
        '<i id="a"></i><i id="b"></i><i id="o"></i><i id="c"></i>' +
        '</div><div id="p1"></div></div>',
    );
    expect(ids(focusCandidates($('o')))).toEqual(['b', 'c', 'a', 'p0', 'p1']);
  });

  it('takes at most `width` per level and climbs at most `depth`', () => {
    const $ = build(
      '<div id="top"><div id="g0"></div><div id="g"><div id="p">' +
        '<i id="a"></i><i id="b"></i><i id="o"></i><i id="c"></i>' +
        '</div><div id="p1"></div></div></div>',
    );
    expect(ids(focusCandidates($('o'), 2, 1))).toEqual(['b', 'c', 'p1']);
  });
});

describe('focusableIn', () => {
  it('returns the node itself, else its first focusable child, never hidden ones', () => {
    const $ = build(
      '<button id="b"></button>' +
        '<div id="row"><span></span><a id="l" href="#">x</a></div>' +
        '<div id="off" hidden><button></button></div>' +
        '<button id="d" disabled></button>',
    );
    expect(focusableIn($('b'))).toBe($('b'));
    expect(focusableIn($('row'))).toBe($('l'));
    expect(focusableIn($('off'))).toBeNull();
    expect(focusableIn($('d'))).toBeNull();
  });
});

describe('FocusReturn', () => {
  it('sends focus to the next row when the opener row is gone', () => {
    const $ = build(
      '<table><tbody>' +
        '<tr id="r1"><td><button id="del1">Delete</button></td></tr>' +
        '<tr id="r2"><td><button id="del2">Delete</button></td></tr>' +
        '</tbody></table>',
    );
    const memory = new FocusReturn();
    $('del1').focus();
    memory.track(true, document);
    expect(memory.target()).toBeNull();
    $('del2').focus();
    memory.track(true, document);
    memory.track(false, document);
    $('r1').remove();
    expect(memory.target()).toBe($('del2'));
  });

  it('ranks the opener again on each opening and skips the body', () => {
    const $ = build('<button id="a"></button><button id="b"></button>');
    const memory = new FocusReturn();
    memory.track(true, document);
    memory.track(false, document);
    expect(memory.target()).toBeNull();
    $('a').focus();
    memory.track(true, document);
    $('a').remove();
    expect(memory.target()).toBe($('b'));
  });

  it('takes the last pressed element when a click leaves focus on the body', () => {
    const $ = build('<button id="a"></button><button id="b"></button>');
    const memory = new FocusReturn();
    const stop = memory.watch(document);
    $('a').dispatchEvent(new Event('pointerdown', { bubbles: true }));
    memory.track(true, document);
    $('a').remove();
    expect(memory.target()).toBe($('b'));
    stop();
    memory.track(false, document);
    $('b').dispatchEvent(new Event('pointerdown', { bubbles: true }));
    memory.track(true, document);
    expect(memory.target()).toBeNull();
  });
});
