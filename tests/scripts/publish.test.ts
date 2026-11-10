import { describe, expect, it } from 'vitest';
import { mirror, pushArgs } from '../../.github/scripts/publish.mjs';

describe('mirror', () => {
  it('names the read-only mirror of a package', () => {
    expect(mirror('react')).toBe('https://github.com/Typeir/arkhe-react.git');
  });
});

describe('pushArgs', () => {
  it('fast-forwards main, forces release and tags a new version', () => {
    expect(pushArgs('core', '0.2.0', false)).toEqual([
      'push',
      '--quiet',
      'https://github.com/Typeir/arkhe-core.git',
      'split/core:refs/heads/main',
      '+release/core:refs/heads/release',
      'release/core:refs/tags/v0.2.0',
    ]);
  });

  it('never moves a tag the mirror already has', () => {
    expect(pushArgs('core', '0.1.0', true)).not.toContain(
      'release/core:refs/tags/v0.1.0',
    );
  });
});
