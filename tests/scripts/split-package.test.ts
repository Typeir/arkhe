import { describe, expect, it } from 'vitest';
import {
  PACKAGES,
  branches,
  splitPackage,
} from '../../.github/scripts/split-package.mjs';

describe('branches', () => {
  it('names the split and release branches', () => {
    expect(branches('core')).toEqual({
      split: 'split/core',
      release: 'release/core',
    });
  });
});

describe('splitPackage', () => {
  it('splits every package that exists', () => {
    expect(PACKAGES).toEqual(['core', 'react', 'svelte']);
  });

  it('refuses an unknown package before running git', () => {
    const calls: string[][] = [];
    expect(() =>
      splitPackage('showcase', (args: string[]) => {
        calls.push(args);
        return '';
      }),
    ).toThrow('Unknown package "showcase"');
    expect(calls).toEqual([]);
  });
});
