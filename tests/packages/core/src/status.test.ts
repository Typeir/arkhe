import { DEFAULT_LABELS, STATUS_KINDS, statusLook } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('statusLook', () => {
  it.each([
    ['empty', 'inbox', 'status', DEFAULT_LABELS.statusEmpty],
    ['loading', 'loader', 'status', DEFAULT_LABELS.statusLoading],
    ['error', 'triangle-alert', 'alert', DEFAULT_LABELS.statusError],
    ['info', 'info', 'status', ''],
  ] as const)('maps %s', (kind, icon, role, text) => {
    expect(statusLook(kind, DEFAULT_LABELS)).toEqual({ icon, role, text });
  });

  it('covers every kind', () => {
    for (const kind of STATUS_KINDS)
      expect(statusLook(kind, DEFAULT_LABELS).icon).toBeTruthy();
  });
});
