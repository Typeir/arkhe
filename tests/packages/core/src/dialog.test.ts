// @vitest-environment jsdom
import { dialogMachineProps, hideShadowSiblings } from '@arkhe/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

const base = {
  id: 'd',
  onOpenChange: () => undefined,
  getRootNode: () => ({}) as Document,
};

describe('dialogMachineProps', () => {
  it('stays closed until ready', () => {
    expect(dialogMachineProps({ ...base, open: true, ready: false }).open).toBe(
      false,
    );
    expect(dialogMachineProps({ ...base, open: true }).open).toBe(true);
  });

  it('passes the role only when set', () => {
    expect(dialogMachineProps({ ...base, open: false })).not.toHaveProperty(
      'role',
    );
    expect(
      dialogMachineProps({ ...base, open: false, role: 'alertdialog' }).role,
    ).toBe('alertdialog');
  });

  it('reports plain open state', () => {
    const onOpenChange = vi.fn();
    dialogMachineProps({ ...base, open: false, onOpenChange }).onOpenChange({
      open: true,
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('forwards finalFocus as Zag finalFocusEl', () => {
    const finalFocus = () => null;
    expect(
      dialogMachineProps({ ...base, open: false, finalFocus }).finalFocusEl,
    ).toBe(finalFocus);
    expect(dialogMachineProps({ ...base, open: false })).not.toHaveProperty(
      'finalFocusEl',
    );
  });
});

describe('hideShadowSiblings', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  function shadowTree() {
    document.body.innerHTML = '<main id="page"></main>';
    const host = document.createElement('div');
    document.body.append(host);
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style></style><nav id="nav"></nav><div aria-live="polite" id="live"></div>' +
      '<div id="portal"><aside id="other"></aside><div id="content"></div></div>';
    const byId = (id: string): Element => {
      const node = shadow.getElementById(id) ?? document.getElementById(id);
      if (!node) throw new Error(`No #${id}`);
      return node;
    };
    return { byId };
  }

  it('hides every shadow-root sibling on the path, then restores them', () => {
    const { byId } = shadowTree();
    byId('other').setAttribute('aria-hidden', 'true');
    const restore = hideShadowSiblings(byId('content'));
    expect(byId('nav').getAttribute('aria-hidden')).toBe('true');
    expect(byId('other').getAttribute('aria-hidden')).toBe('true');
    expect(byId('portal').hasAttribute('aria-hidden')).toBe(false);
    expect(byId('live').hasAttribute('aria-hidden')).toBe(false);
    expect(byId('page').hasAttribute('aria-hidden')).toBe(false);
    restore();
    expect(byId('nav').hasAttribute('aria-hidden')).toBe(false);
    expect(byId('other').getAttribute('aria-hidden')).toBe('true');
  });

  it('leaves the light DOM to Zag', () => {
    const nav = document.createElement('nav');
    const content = document.createElement('div');
    document.body.append(nav, content);
    hideShadowSiblings(content)();
    expect(nav.hasAttribute('aria-hidden')).toBe(false);
  });
});
