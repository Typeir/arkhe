import { describe, expect, it } from 'vitest';
import {
  IKUISUUS_KEYWORDS,
  IKUISUUS_WIDE_CHARS,
  ikuisuusString,
  ikuisuusWidth,
} from '../../../../apps/showcase/src/ikuisuus';

describe('ikuisuusWidth', () => {
  it('lays a card out wide from Ikuisuus’s threshold', () => {
    expect(ikuisuusWidth('a'.repeat(IKUISUUS_WIDE_CHARS - 1))).toBe('narrow');
    expect(ikuisuusWidth('a'.repeat(IKUISUUS_WIDE_CHARS))).toBe('wide');
  });

  it('keeps both clone shards narrow, as Ikuisuus does', () => {
    expect(ikuisuusWidth(IKUISUUS_KEYWORDS.burning.source)).toBe('narrow');
    expect(ikuisuusWidth(IKUISUUS_KEYWORDS.prone.source)).toBe('narrow');
  });
});

describe('ikuisuusString', () => {
  it('fills the term', () => {
    expect(ikuisuusString('openRule', 'Prone')).toBe(
      'Open the full rule for Prone',
    );
  });
});
