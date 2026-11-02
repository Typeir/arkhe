import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TARGETS,
  startLanding,
} from '../../../../../apps/showcase/src/landing/landing';
import { SETTINGS_MESSAGE } from '../../../../../apps/showcase/src/target';

const SWITCHES = [
  'theme=dark',
  'theme=light',
  'scale=100',
  'scale=125',
  'layout=columns',
  'layout=stacked',
  ...TARGETS.map((target) => `target=${target.id}`),
];

function mount() {
  const controls = document.createElement('div');
  for (const set of SWITCHES) {
    const button = document.createElement('button');
    button.dataset.set = set;
    button.textContent = set;
    controls.append(button);
  }
  const stage = document.createElement('div');
  document.body.append(controls, stage);
  startLanding(stage, controls);
  return { stage, controls };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  document.body.replaceChildren();
  delete document.documentElement.dataset.theme;
});

describe('startLanding', () => {
  it('frames every target on this origin with the current settings', () => {
    const { stage } = mount();
    const frames = [...stage.querySelectorAll('iframe')];
    expect(frames.map((frame) => frame.getAttribute('src'))).toEqual(
      TARGETS.map((target) => `${target.path}?theme=dark&scale=100`),
    );
    expect(screen.getAllByRole('link', { name: 'Open alone' })).toHaveLength(
      TARGETS.length,
    );
  });

  it('posts theme changes to every frame, scoped to this origin', async () => {
    const { stage } = mount();
    const spies = [...stage.querySelectorAll('iframe')].map((frame) =>
      vi.spyOn(frame.contentWindow as Window, 'postMessage'),
    );
    await userEvent.click(screen.getByRole('button', { name: 'theme=light' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    for (const spy of spies) {
      expect(spy).toHaveBeenLastCalledWith(
        { type: SETTINGS_MESSAGE, settings: { theme: 'light', scale: 100 } },
        location.origin,
      );
    }
  });

  it('marks the active switches', async () => {
    mount();
    await userEvent.click(screen.getByRole('button', { name: 'scale=125' }));
    expect(screen.getByRole('button', { name: 'scale=125' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'scale=100' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('hides a target and stacks the layout', async () => {
    const { stage } = mount();
    await userEvent.click(
      screen.getByRole('button', { name: 'target=svelte' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'layout=stacked' }),
    );
    expect(
      stage.querySelector<HTMLElement>('[data-target="svelte"]')?.hidden,
    ).toBe(true);
    expect(stage.dataset.layout).toBe('stacked');
  });

  it('restores stored settings', async () => {
    mount();
    await userEvent.click(screen.getByRole('button', { name: 'theme=light' }));
    document.body.replaceChildren();
    const { stage } = mount();
    expect(stage.querySelector('iframe')?.getAttribute('src')).toContain(
      'theme=light',
    );
  });
});
