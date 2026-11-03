import { FxLoader } from '@arkhe/core';
import { afterEach, describe, expect, it } from 'vitest';
import {
  SETTINGS_MESSAGE,
  applySettings,
  bootTarget,
  effectsFromQuery,
  exposeEffects,
  settingsFromQuery,
} from '../../../../apps/showcase/src/target';

const root = document.documentElement;

afterEach(() => {
  delete root.dataset.theme;
  root.style.fontSize = '';
});

describe('applySettings', () => {
  it('sets theme and text size on the root', () => {
    applySettings(root, { theme: 'light', scale: 125 });
    expect(root.dataset.theme).toBe('light');
    expect(root.style.fontSize).toBe('125%');
  });
});

describe('settingsFromQuery', () => {
  it('reads theme and scale', () => {
    expect(settingsFromQuery('?theme=light&scale=90')).toEqual({
      theme: 'light',
      scale: 90,
    });
  });

  it.each(['', '?theme=neon&scale=9000', '?scale=abc'])(
    'falls back for %s',
    (search) => {
      expect(settingsFromQuery(search)).toEqual({ theme: 'dark', scale: 100 });
    },
  );
});

describe('bootTarget', () => {
  const send = (data: unknown, origin = location.origin) =>
    window.dispatchEvent(new MessageEvent('message', { data, origin }));

  it('applies settings posted from this origin', () => {
    bootTarget();
    send({ type: SETTINGS_MESSAGE, settings: { theme: 'light', scale: 90 } });
    expect(root.dataset.theme).toBe('light');
    expect(root.style.fontSize).toBe('90%');
  });

  it('ignores other origins and other messages', () => {
    bootTarget();
    send(
      { type: SETTINGS_MESSAGE, settings: { theme: 'light', scale: 90 } },
      'https://evil.test',
    );
    send({ type: 'other', settings: { theme: 'light', scale: 90 } });
    expect(root.dataset.theme).toBe('dark');
  });
});

describe('effectsFromQuery', () => {
  it('turns effects off, pins a surface, or keeps the defaults', () => {
    expect(effectsFromQuery('?fx=off')).toBe(false);
    expect(effectsFromQuery('?fx=viewport')).toEqual({ surface: 'viewport' });
    expect(effectsFromQuery('?fx=grouped')).toEqual({ surface: 'grouped' });
    expect(effectsFromQuery('?fx=nope')).toEqual({});
    expect(effectsFromQuery('')).toEqual({});
  });
});

describe('exposeEffects', () => {
  it('puts the engine handle on the window', () => {
    const loader = new FxLoader(false, () => Promise.reject(new Error('no')));
    exposeEffects(loader);
    const exposed = (window as Window & { arkheEffects?: FxLoader })
      .arkheEffects;
    expect(exposed).toBe(loader);
  });
});
