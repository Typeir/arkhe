import { describe, expect, it, vi } from 'vitest';
import {
  HintNode,
  type HintHandle,
} from '../../../../packages/core/src/hintTree';

function hint(node: HintNode, ids: string[], leaving = false) {
  const state = { leaving };
  const close = vi.fn(() => node.report(false));
  const handle: HintHandle = {
    close,
    leaving: () => state.leaving,
    ids: () => ids,
  };
  const detach = node.attach(handle);
  return { close, state, detach };
}

describe('HintNode', () => {
  it('lets a close through when nothing nested is open', () => {
    const node = new HintNode();
    hint(node, ['a']);
    node.report(true);
    expect(node.request(false)).toBe(true);
    expect(node.request(true)).toBe(true);
  });

  it('refuses a close while a nested hint is open, then closes after a leave', () => {
    const parent = new HintNode();
    const outer = hint(parent, ['p'], true);
    const child = new HintNode(parent);
    hint(child, ['c']);
    parent.report(true);
    child.report(true);
    expect(parent.request(false)).toBe(false);
    child.report(false);
    expect(outer.close).toHaveBeenCalledOnce();
  });

  it('stays open when the pointer came back before the nested hint closed', () => {
    const parent = new HintNode();
    const outer = hint(parent, ['p'], true);
    const child = new HintNode(parent);
    hint(child, ['c']);
    parent.report(true);
    child.report(true);
    parent.request(false);
    outer.state.leaving = false;
    child.report(false);
    expect(outer.close).not.toHaveBeenCalled();
  });

  it('finishes a refused dismissal whatever the pointer does', () => {
    const parent = new HintNode();
    const outer = hint(parent, ['p']);
    const child = new HintNode(parent);
    hint(child, ['c']);
    parent.report(true);
    child.report(true);
    expect(parent.request(false)).toBe(false);
    child.report(false);
    expect(outer.close).toHaveBeenCalledOnce();
  });

  it('drops a refused close once the hint is asked open again', () => {
    const parent = new HintNode();
    const outer = hint(parent, ['p']);
    const child = new HintNode(parent);
    hint(child, ['c']);
    parent.report(true);
    child.report(true);
    parent.request(false);
    parent.request(true);
    child.report(false);
    expect(outer.close).not.toHaveBeenCalled();
  });

  it('closes the open hints it holds when it closes', () => {
    const parent = new HintNode();
    hint(parent, ['p']);
    const open = new HintNode(parent);
    const shut = new HintNode(parent);
    const a = hint(open, ['a']);
    const b = hint(shut, ['b']);
    parent.report(true);
    open.report(true);
    parent.report(false);
    expect(a.close).toHaveBeenCalledOnce();
    expect(b.close).not.toHaveBeenCalled();
  });

  it('collects its ids and those of every hint it holds', () => {
    const parent = new HintNode();
    hint(parent, ['p1', 'p2']);
    const child = new HintNode(parent);
    const attached = hint(child, ['c']);
    const grandchild = new HintNode(child);
    hint(grandchild, ['g']);
    expect(parent.ids()).toEqual(['p1', 'p2', 'c', 'g']);
    attached.detach();
    expect(parent.ids()).toEqual(['p1', 'p2']);
  });

  it('finishes a refused close when the open nested hint goes away', () => {
    const parent = new HintNode();
    const outer = hint(parent, ['p']);
    const child = new HintNode(parent);
    const inner = hint(child, ['c']);
    parent.report(true);
    child.report(true);
    parent.request(false);
    inner.detach();
    expect(outer.close).toHaveBeenCalledOnce();
  });
});
