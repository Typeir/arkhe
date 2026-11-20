import { radioChecked, radioRootAttrs } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('radioRootAttrs', () => {
  it('defaults to medium pips in a row', () => {
    expect(radioRootAttrs({})).toEqual({
      'data-look': 'pip',
      'data-size': 'm',
      'data-orientation': 'horizontal',
      'data-invalid': undefined,
      'data-label-hidden': undefined,
    });
  });

  it('carries look, size, direction, error and hidden legend', () => {
    expect(
      radioRootAttrs({
        look: 'segmented',
        size: 's',
        orientation: 'vertical',
        invalid: true,
        labelHidden: true,
      }),
    ).toEqual({
      'data-look': 'segmented',
      'data-size': 's',
      'data-orientation': 'vertical',
      'data-invalid': '',
      'data-label-hidden': '',
    });
  });
});

describe('radioChecked', () => {
  const item = { value: 'metric', label: 'Metric' };

  it('leaves an uncontrolled radio to the browser', () => {
    expect(radioChecked(undefined, item)).toBeUndefined();
  });

  it('checks the controlled value only', () => {
    expect(radioChecked('metric', item)).toBe(true);
    expect(radioChecked('imperial', item)).toBe(false);
    expect(radioChecked(null, item)).toBe(false);
  });
});
