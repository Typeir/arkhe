// @vitest-environment jsdom
import {
  ANNOUNCE_DELAY,
  ANNOUNCE_HOLD,
  Announcer,
  announceText,
} from '@arkhe/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

const region = (politeness: string) =>
  document.body.querySelector(`[data-politeness="${politeness}"]`);

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe('Announcer', () => {
  it('mounts both regions in the body, marked so modals leave them audible', () => {
    const unmount = new Announcer().mount();
    expect(region('polite')?.parentNode).toBe(document.body);
    expect(region('polite')?.getAttribute('role')).toBe('status');
    expect(region('assertive')?.getAttribute('aria-live')).toBe('assertive');
    expect(region('polite')?.hasAttribute('data-live-announcer')).toBe(true);
    unmount();
    expect(document.body.children).toHaveLength(0);
  });

  it('adds each message as a new line to a mounted region and drops it later', () => {
    vi.useFakeTimers();
    const announcer = new Announcer();
    announcer.mount();
    announcer.announce('Saved');
    announcer.announce('Saved');
    announcer.announce('  ');
    announcer.announce('Failed', 'assertive');
    expect(region('polite')?.children).toHaveLength(2);
    expect(region('assertive')?.textContent).toBe('Failed');
    vi.advanceTimersByTime(ANNOUNCE_HOLD);
    expect(region('polite')?.children).toHaveLength(0);
  });

  it('makes regions on demand and waits before the first message', () => {
    vi.useFakeTimers();
    const announcer = new Announcer();
    announcer.announce('Loading');
    expect(region('polite')?.textContent).toBe('');
    vi.advanceTimersByTime(ANNOUNCE_DELAY);
    expect(region('polite')?.textContent).toBe('Loading');
  });

  it('keeps the regions until the last mount undoes', () => {
    const announcer = new Announcer();
    const first = announcer.mount();
    const second = announcer.mount();
    first();
    first();
    expect(region('polite')).not.toBeNull();
    second();
    expect(region('polite')).toBeNull();
  });
});

describe('announceText', () => {
  it('speaks the text now and on each change, at the current urgency', async () => {
    const announcer = new Announcer();
    const speak = vi
      .spyOn(announcer, 'announce')
      .mockImplementation(() => undefined);
    const el = document.createElement('p');
    el.textContent = 'Loading';
    let politeness: 'polite' | 'assertive' = 'polite';
    const stop = announceText(el, announcer, () => politeness);
    politeness = 'assertive';
    el.textContent = 'Failed';
    await Promise.resolve();
    el.textContent = 'Failed';
    await Promise.resolve();
    stop();
    el.textContent = 'Gone';
    await Promise.resolve();
    expect(speak.mock.calls).toEqual([
      ['Loading', 'polite'],
      ['Failed', 'assertive'],
    ]);
  });
});
