import { DEFAULT_LABELS, STATUS_KINDS, statusLook } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('statusLook', () => {
  it.each([
    ['empty', 'inbox', 'polite', DEFAULT_LABELS.statusEmpty],
    ['loading', 'loader', 'polite', DEFAULT_LABELS.statusLoading],
    ['error', 'triangle-alert', 'assertive', DEFAULT_LABELS.statusError],
    ['info', 'info', 'polite', ''],
  ] as const)('maps %s', (kind, icon, politeness, text) => {
    expect(statusLook(kind, DEFAULT_LABELS)).toEqual({
      icon,
      politeness,
      text,
    });
  });

  it('covers every kind', () => {
    for (const kind of STATUS_KINDS)
      expect(statusLook(kind, DEFAULT_LABELS).icon).toBeTruthy();
  });
});
