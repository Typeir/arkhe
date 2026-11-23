import { ARKHE_ICON_NAMES } from '@arkhe/core';
import { describe, expect, it } from 'vitest';
import {
  nameReadout,
  nestsFolder,
  searchSpecimen,
  SPECIMEN_FOLDERS,
  SPECIMEN_ICONS,
  SPECIMEN_PROGRESS,
  SPECIMEN_RUNES,
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
  it('holds two thousand distinct runes for the long lists', () => {
    expect(SPECIMEN_RUNES).toHaveLength(2000);
    expect(new Set(SPECIMEN_RUNES.map((rune) => rune.value)).size).toBe(2000);
    expect(SPECIMEN_RUNES.at(-1)?.label).toBe('Rune 2000');
  });

  it('counts characters against the limit', () => {
    expect(nameReadout('Rhomus')).toBe('6 / 24');
  });

  it('answers a search where the data lives', async () => {
    expect((await searchSpecimen('gob')).map((item) => item.value)).toEqual([
      'goblin',
    ]);
  });
});

describe('nestsFolder', () => {
  it('opens the next level in each first tab, down to the last', () => {
    expect(nestsFolder(0, 'overview')).toBe(true);
    expect(nestsFolder(0, 'notes')).toBe(false);
    expect(nestsFolder(1, 'boons')).toBe(true);
    expect(nestsFolder(SPECIMEN_FOLDERS.length - 1, 'past')).toBe(false);
  });
});
