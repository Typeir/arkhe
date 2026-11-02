/**
 * @fileoverview Showcase landing: one iframe per target, all on this origin,
 * with theme, text size, layout and target switches sent to every frame.
 *
 * @module apps/showcase/src/landing/landing
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import {
  SETTINGS_MESSAGE,
  applySettings,
  type ShowcaseSettings,
} from '../target';

/**
 * A page the showcase frames.
 *
 * @interface ShowcaseTarget
 * @property {string} id - Key.
 * @property {string} title - Frame heading.
 * @property {string} path - Same-origin path of the page.
 */
export interface ShowcaseTarget {
  readonly id: string;
  readonly title: string;
  readonly path: string;
}

/**
 * Framed targets, in display order.
 *
 * @constant TARGETS
 * @type {readonly ShowcaseTarget[]}
 */
export const TARGETS: readonly ShowcaseTarget[] = [
  { id: 'react', title: 'React', path: 'targets/react/' },
  { id: 'svelte', title: 'Svelte', path: 'targets/svelte/' },
  { id: 'static', title: 'Static HTML + CSS', path: 'targets/static/' },
];

const STORE_KEY = 'arkhe-showcase';

function readStored(): Partial<ShowcaseSettings> & {
  hidden?: string[];
  stacked?: boolean;
} {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function store(value: object): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(value));
  } catch {
    return;
  }
}

function fitHeight(frame: HTMLIFrameElement): void {
  const doc = frame.contentDocument;
  if (!doc) return;
  const fit = () => {
    frame.style.height = `${doc.documentElement.offsetHeight}px`;
  };
  new ResizeObserver(fit).observe(doc.documentElement);
  fit();
}

/**
 * Builds the frames into `stage` and wires the switches in `controls`.
 *
 * @function startLanding
 * @param {HTMLElement} stage - Frame container.
 * @param {HTMLElement} controls - Switch container.
 * @returns {void}
 */
export function startLanding(stage: HTMLElement, controls: HTMLElement): void {
  const stored = readStored();
  const state = {
    settings: {
      theme: stored.theme ?? 'dark',
      scale: stored.scale ?? 100,
    } as ShowcaseSettings,
    hidden: new Set(stored.hidden ?? []),
    stacked: stored.stacked ?? false,
  };
  const frames = TARGETS.map((target) => {
    const panel = document.createElement('section');
    panel.className = 'frame';
    panel.dataset.target = target.id;
    const query = `?theme=${state.settings.theme}&scale=${state.settings.scale}`;
    panel.innerHTML = `<header><h2>${target.title}</h2><a href="${target.path}${query}" target="_blank" rel="noopener">Open alone</a></header>`;
    const frame = document.createElement('iframe');
    frame.title = `${target.title} target`;
    frame.src = `${target.path}${query}`;
    frame.addEventListener('load', () => fitHeight(frame));
    panel.append(frame);
    stage.append(panel);
    return { target, panel, frame };
  });
  const render = () => {
    applySettings(document.documentElement, state.settings);
    stage.dataset.layout = state.stacked ? 'stacked' : 'columns';
    for (const { target, panel, frame } of frames) {
      panel.hidden = state.hidden.has(target.id);
      frame.contentWindow?.postMessage(
        { type: SETTINGS_MESSAGE, settings: state.settings },
        location.origin,
      );
    }
    for (const button of controls.querySelectorAll<HTMLButtonElement>(
      '[data-set]',
    )) {
      const [key, value] = (button.dataset.set ?? '').split('=');
      const on =
        key === 'theme'
          ? state.settings.theme === value
          : key === 'scale'
            ? String(state.settings.scale) === value
            : key === 'layout'
              ? (value === 'stacked') === state.stacked
              : !state.hidden.has(value);
      button.setAttribute('aria-pressed', String(on));
    }
    store({
      ...state.settings,
      hidden: [...state.hidden],
      stacked: state.stacked,
    });
  };
  controls.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      '[data-set]',
    );
    if (!button) return;
    const [key, value] = (button.dataset.set ?? '').split('=');
    if (key === 'theme')
      state.settings = { ...state.settings, theme: value as 'dark' | 'light' };
    if (key === 'scale')
      state.settings = { ...state.settings, scale: Number(value) };
    if (key === 'layout') state.stacked = value === 'stacked';
    if (key === 'target') {
      if (state.hidden.has(value)) state.hidden.delete(value);
      else state.hidden.add(value);
    }
    render();
  });
  for (const { frame } of frames) frame.addEventListener('load', render);
  render();
}
