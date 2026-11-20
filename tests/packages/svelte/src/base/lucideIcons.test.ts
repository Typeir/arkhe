import { ARKHE_ICON_NAMES } from '@arkhe/core';
import { LUCIDE_ICONS } from '@arkhe/svelte';
import { describe, expect, it } from 'vitest';

describe('LUCIDE_ICONS', () => {
  it('draws every Arkhé icon and nothing else', () => {
    expect(Object.keys(LUCIDE_ICONS).sort()).toEqual(
      [...ARKHE_ICON_NAMES].sort(),
    );
    for (const name of ARKHE_ICON_NAMES)
      expect(LUCIDE_ICONS[name]).toBeDefined();
  });
});
