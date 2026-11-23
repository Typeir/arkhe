import { TABS_GROUND, tabsLayer } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('tabsLayer', () => {
  it('leaves the ground as it was for line tabs', () => {
    expect(tabsLayer('line', 'surface')).toEqual({ inner: 'surface' });
  });

  it('draws folders on the opposite ground, alternating as they nest', () => {
    const outer = tabsLayer('folder', TABS_GROUND);
    expect(outer).toEqual({ layer: 'surface', inner: 'surface' });
    const inner = tabsLayer('folder', outer.inner);
    expect(inner).toEqual({ layer: 'bg', inner: 'bg' });
    expect(tabsLayer('folder', inner.inner).layer).toBe('surface');
  });
});
