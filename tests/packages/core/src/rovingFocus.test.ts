// @vitest-environment jsdom
import { hasFocusgroup, rovingFocus } from '@arkhe/core';
import { afterEach, describe, expect, it } from 'vitest';

function toolbar(vertical = false): HTMLElement {
  document.body.innerHTML = `
    <div role="toolbar"${vertical ? ' aria-orientation="vertical"' : ''}>
      <button>A</button><button>B</button><button>C</button>
    </div>`;
  return document.querySelector('[role="toolbar"]') as HTMLElement;
}

function buttons(): HTMLButtonElement[] {
  return [...document.querySelectorAll('button')];
}

function key(target: Element, name: string): boolean {
  return target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: name,
      bubbles: true,
      cancelable: true,
    }),
  );
}

afterEach(() => {
  document.body.innerHTML = '';
  delete (HTMLElement.prototype as { focusGroup?: unknown }).focusGroup;
});

describe('rovingFocus', () => {
  it('keeps the first button alone in the tab order', () => {
    const stop = rovingFocus(toolbar());
    expect(buttons().map((button) => button.tabIndex)).toEqual([0, -1, -1]);
    stop();
  });

  it('moves with arrows, wrapping, and Home / End', () => {
    rovingFocus(toolbar());
    const [a, b, c] = buttons() as [
      HTMLButtonElement,
      HTMLButtonElement,
      HTMLButtonElement,
    ];
    a.focus();
    expect(key(a, 'ArrowRight')).toBe(false);
    expect(document.activeElement).toBe(b);
    key(b, 'ArrowLeft');
    key(a, 'ArrowLeft');
    expect(document.activeElement).toBe(c);
    key(c, 'Home');
    expect(document.activeElement).toBe(a);
    key(a, 'End');
    expect(document.activeElement).toBe(c);
    expect(c.tabIndex).toBe(0);
    expect(key(c, 'Tab')).toBe(true);
  });

  it('uses up and down when vertical', () => {
    rovingFocus(toolbar(true));
    const [a, b] = buttons() as [HTMLButtonElement, HTMLButtonElement];
    a.focus();
    key(a, 'ArrowRight');
    expect(document.activeElement).toBe(a);
    key(a, 'ArrowDown');
    expect(document.activeElement).toBe(b);
  });

  it('gives a new button its place without losing the remembered one', async () => {
    const root = toolbar();
    rovingFocus(root);
    const b = buttons()[1] as HTMLButtonElement;
    b.focus();
    root.append(document.createElement('button'));
    await Promise.resolve();
    expect(buttons().map((button) => button.tabIndex)).toEqual([-1, 0, -1, -1]);
  });

  it('stands aside where the browser has focusgroup', () => {
    Object.defineProperty(HTMLElement.prototype, 'focusGroup', {
      value: '',
      configurable: true,
    });
    const root = toolbar();
    expect(hasFocusgroup(root)).toBe(true);
    rovingFocus(root);
    expect(buttons().every((button) => !button.hasAttribute('tabindex'))).toBe(
      true,
    );
  });
});
