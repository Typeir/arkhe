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
  applySettings,
  SETTINGS_MESSAGE,
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

/**
 * Local storage key for the landing settings.
 *
 * @constant STORE_KEY
 * @type {string}
 */
const STORE_KEY = 'arkhe-showcase';

/**
 * Reads the stored landing settings; empty when there are none or storage is blocked.
 *
 * @function readStored
 * @returns {Partial<ShowcaseSettings> & { hidden?: string[], stacked?: boolean }} Stored settings.
 */
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

/**
 * Stores the landing settings; a blocked storage keeps nothing.
 *
 * @function store
 * @param {object} value - Settings to keep.
 * @returns {void}
 */
function store(value: object): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(value));
  } catch {
    return;
  }
}

/**
 * Keeps a target frame as tall as its document, so the landing scrolls instead of each frame.
 *
 * @function fitHeight
 * @param {HTMLIFrameElement} frame - Target frame.
 * @returns {void}
 */
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
    const link = panel.querySelector('a') as HTMLAnchorElement;
    const frame = document.createElement('iframe');
    frame.title = `${target.title} target`;
    frame.src = `${target.path}${query}`;
    frame.addEventListener('load', () => {
      fitHeight(frame);
    });
    panel.append(frame);
    stage.append(panel);
    return { target, panel, frame, link };
  });
  const render = () => {
    applySettings(document.documentElement, state.settings);
    stage.dataset.layout = state.stacked ? 'stacked' : 'columns';
    const query = `?theme=${state.settings.theme}&scale=${state.settings.scale}`;
    for (const { target, panel, frame, link } of frames) {
      panel.hidden = state.hidden.has(target.id);
      link.href = `${target.path}${query}`;
      frame.contentWindow?.postMessage(
        { type: SETTINGS_MESSAGE, settings: state.settings },
        location.origin,
      );
    }
    const isOn = (key: string | undefined, value: string): boolean => {
      if (key === 'theme') return state.settings.theme === value;
      if (key === 'scale') return String(state.settings.scale) === value;
      if (key === 'layout') return (value === 'stacked') === state.stacked;
      return !state.hidden.has(value);
    };
    for (const button of controls.querySelectorAll<HTMLButtonElement>(
      '[data-set]',
    )) {
      const [key, value] = (button.dataset.set ?? '').split('=');
      button.setAttribute('aria-pressed', String(isOn(key, value)));
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
    if (key === 'theme') {
      state.settings = { ...state.settings, theme: value as 'dark' | 'light' };
    }
    if (key === 'scale') {
      state.settings = { ...state.settings, scale: Number(value) };
    }
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
