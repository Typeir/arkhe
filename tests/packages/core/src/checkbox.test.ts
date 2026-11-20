// @vitest-environment jsdom
import { checkboxRootAttrs, markIndeterminate } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('checkboxRootAttrs', () => {
  it('defaults to a medium pip', () => {
    expect(checkboxRootAttrs({})).toEqual({
      'data-look': 'pip',
      'data-size': 'm',
      'data-invalid': undefined,
      'data-label-hidden': undefined,
    });
  });

  it('carries look, size, error and hidden label', () => {
    expect(
      checkboxRootAttrs({
        look: 'box',
        size: 'l',
        invalid: true,
        labelHidden: true,
      }),
    ).toEqual({
      'data-look': 'box',
      'data-size': 'l',
      'data-invalid': '',
      'data-label-hidden': '',
    });
  });
});

describe('markIndeterminate', () => {
  it('sets and clears the mixed state', () => {
    const input = document.createElement('input');
    input.type = 'checkbox';
    markIndeterminate(input, true);
    expect(input.indeterminate).toBe(true);
    markIndeterminate(input, undefined);
    expect(input.indeterminate).toBe(false);
  });

  it('ignores a missing input', () => {
    expect(() => markIndeterminate(null, true)).not.toThrow();
  });
});
