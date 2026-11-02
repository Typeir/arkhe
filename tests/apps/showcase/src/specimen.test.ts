import { ARKHE_ICON_NAMES } from '@arkhe/core';
import { describe, expect, it } from 'vitest';
import {
  SPECIMEN_ICONS,
  SPECIMEN_PROGRESS,
  nameReadout,
} from '../../../../apps/showcase/src/specimen';

describe('specimen data', () => {
  it('shows every Arkhé icon plus one missing name', () => {
    expect(SPECIMEN_ICONS).toEqual([...ARKHE_ICON_NAMES, 'not-an-icon']);
  });

  it('starts progress inside the rail with markers inside it', () => {
    expect(SPECIMEN_PROGRESS.start).toBeLessThan(SPECIMEN_PROGRESS.max);
    for (const at of SPECIMEN_PROGRESS.markers)
      expect(at).toBeLessThan(SPECIMEN_PROGRESS.max);
  });
});

describe('nameReadout', () => {
  it('counts characters against the limit', () => {
    expect(nameReadout('Rhomus')).toBe('6 / 24');
  });
});
