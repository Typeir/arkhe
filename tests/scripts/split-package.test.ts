import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PACKAGES,
  branches,
  copyTree,
  pinCore,
  splitPackage,
} from '../../.github/scripts/split-package.mjs';

describe('pinCore', () => {
  it("points a port's core dependency at the core repo's version tag", () => {
    const pkg = { dependencies: { '@arkhe/core': '0.1.0', react: '19.3.1' } };
    expect(pinCore(pkg, '0.1.0').dependencies).toEqual({
      '@arkhe/core': 'github:typeir/arkhe-core#v0.1.0',
      react: '19.3.1',
    });
  });

  it('leaves a manifest without core alone', () => {
    expect(pinCore({ name: '@arkhe/core' }, '0.1.0')).toEqual({
      name: '@arkhe/core',
    });
  });
});

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

describe('copyTree', () => {
  it('copies nested files, also under a non-ASCII path', () => {
    const root = mkdtempSync(join(tmpdir(), 'arkhé-'));
    try {
      const from = join(root, 'dist');
      mkdirSync(join(from, 'fx'), { recursive: true });
      writeFileSync(join(from, 'index.js'), 'a');
      writeFileSync(join(from, 'fx', 'index.js'), 'b');
      copyTree(from, join(root, 'out', 'dist'));
      const read = (path: string) =>
        readFileSync(join(root, 'out', 'dist', path), 'utf8');
      expect(read('index.js')).toBe('a');
      expect(read(join('fx', 'index.js'))).toBe('b');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
