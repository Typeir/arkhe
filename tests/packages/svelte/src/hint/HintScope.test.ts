import { HintNode } from '@arkhe/core';
import HintScoped from '@tests/fixtures/svelte/HintScoped.svelte';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('HintScope', () => {
  it('parents the hints inside it to its node, and only those', () => {
    const node = new HintNode();
    const seen: Record<string, HintNode> = {};
    render(HintScoped, {
      node,
      inside: (child: HintNode) => (seen.inside = child),
      outside: (child: HintNode) => (seen.outside = child),
    });
    expect(seen.inside?.parent).toBe(node);
    expect(seen.outside?.parent).toBeUndefined();
  });
});
