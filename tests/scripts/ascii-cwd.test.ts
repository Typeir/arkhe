import { existsSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isAscii, withAsciiPath } from '../../.github/scripts/ascii-cwd.mjs';

const REPO_ROOT = resolve(import.meta.dirname, '../..');

describe('isAscii', () => {
  it.each([
    ['C:/work/arkhe', true],
    ['C:/work/Arkhé', false],
  ])('%s → %s', (path, expected) => {
    expect(isAscii(path)).toBe(expected);
  });
});

describe('withAsciiPath', () => {
  it('passes an ASCII path through untouched', () => {
    expect(withAsciiPath('/srv/arkhe', (path) => path)).toBe('/srv/arkhe');
  });

  it.runIf(!isAscii(REPO_ROOT))(
    'links the repo in a private directory and removes it after',
    () => {
      const dir = join(REPO_ROOT, 'packages', 'svelte');
      const seen = withAsciiPath(dir, (path) => {
        expect(isAscii(path)).toBe(true);
        expect(path.startsWith(tmpdir())).toBe(true);
        expect(realpathSync(path)).toBe(realpathSync(dir));
        return path;
      });
      expect(existsSync(dirname(dirname(dirname(seen))))).toBe(false);
      expect(existsSync(dir)).toBe(true);
    },
  );

  it.runIf(!isAscii(REPO_ROOT))('cleans up when the command throws', () => {
    let seen = '';
    expect(() =>
      withAsciiPath(REPO_ROOT, (path) => {
        seen = path;
        throw new Error('boom');
      }),
    ).toThrow('boom');
    expect(existsSync(dirname(seen))).toBe(false);
  });
});
