import { describe, expect, it } from 'vitest';
import { normalizeDom } from './normalize';

function tree(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}

describe('normalizeDom', () => {
  it('ignores generated ids, attribute order, class order and whitespace', () => {
    const react = tree(
      '<label for="_r_1_" class="b a">Name</label> <input id="_r_1_" data-ownedby="_r_9_">',
    );
    const svelte = tree(
      '<label class="a b" for="s1">  Name </label><input data-ownedby="c3" id="s1">',
    );
    expect(normalizeDom(svelte)).toEqual(normalizeDom(react));
  });

  it('normalises style formatting', () => {
    expect(normalizeDom(tree('<i style="--b: 2;--a:1;"></i>'))).toEqual(
      normalizeDom(tree('<i style="--a: 1; --b: 2"></i>')),
    );
  });

  it('compares inputs by live value, not the attribute', () => {
    const withAttribute = tree('<input value="Rhomus">');
    const withProperty = tree('<input>');
    (withProperty.firstElementChild as HTMLInputElement).value = 'Rhomus';
    expect(normalizeDom(withProperty)).toEqual(normalizeDom(withAttribute));
  });

  it('still sees real differences', () => {
    const base = normalizeDom(tree('<button aria-pressed="true">Go</button>'));
    expect(
      normalizeDom(tree('<button aria-pressed="false">Go</button>')),
    ).not.toEqual(base);
    expect(
      normalizeDom(tree('<button aria-pressed="true">Stop</button>')),
    ).not.toEqual(base);
    expect(normalizeDom(tree('<a aria-pressed="true">Go</a>'))).not.toEqual(
      base,
    );
    expect(
      normalizeDom(tree('<button aria-pressed="true"><b>Go</b></button>')),
    ).not.toEqual(base);
  });

  it('keeps id references pointing at the same element', () => {
    const swapped = tree(
      '<p id="a"></p><p id="b"></p><i aria-describedby="b"></i>',
    );
    const straight = tree(
      '<p id="a"></p><p id="b"></p><i aria-describedby="a"></i>',
    );
    expect(normalizeDom(swapped)).not.toEqual(normalizeDom(straight));
  });

  it('drops tolerated lines only', () => {
    const lines = normalizeDom(tree('<svg class="x"></svg><b>keep</b>'), [
      { pattern: /<svg /, reason: 'test' },
    ]);
    expect(lines).toEqual(['<b>', '  "keep"']);
  });
});
