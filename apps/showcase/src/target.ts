/**
 * @fileoverview Target page boot: applies the showcase's theme and text size
 * from the URL, then from the landing page's messages. Messages from other
 * origins are ignored.
 *
 * @module apps/showcase/src/target
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

/**
 * Settings the landing page sends to every target.
 *
 * @interface ShowcaseSettings
 * @property {'dark' | 'light'} theme - Palette.
 * @property {number} scale - Root text size in percent.
 */
export interface ShowcaseSettings {
  readonly theme: 'dark' | 'light';
  readonly scale: number;
}

/**
 * Message type the landing page posts.
 *
 * @constant SETTINGS_MESSAGE
 * @type {string}
 */
export const SETTINGS_MESSAGE = 'arkhe-showcase:settings';

/**
 * Applies `settings` to `root`.
 *
 * @function applySettings
 * @param {HTMLElement} root - Document element of the page.
 * @param {ShowcaseSettings} settings - Settings.
 * @returns {void}
 */
export function applySettings(
  root: HTMLElement,
  settings: ShowcaseSettings,
): void {
  root.dataset.theme = settings.theme;
  root.style.fontSize = `${settings.scale}%`;
}

/**
 * Reads settings from a query string, with defaults for missing values.
 *
 * @function settingsFromQuery
 * @param {string} search - `location.search`.
 * @returns {ShowcaseSettings} Settings.
 */
export function settingsFromQuery(search: string): ShowcaseSettings {
  const query = new URLSearchParams(search);
  const scale = Number(query.get('scale'));
  return {
    theme: query.get('theme') === 'light' ? 'light' : 'dark',
    scale: scale >= 50 && scale <= 200 ? scale : 100,
  };
}

/**
 * Applies the URL's settings and follows the landing page's messages.
 *
 * @function bootTarget
 * @returns {void}
 */
export function bootTarget(): void {
  const root = document.documentElement;
  applySettings(root, settingsFromQuery(location.search));
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.origin !== location.origin) return;
    const data = event.data as { type?: string; settings?: ShowcaseSettings };
    if (data.type === SETTINGS_MESSAGE && data.settings) {
      applySettings(root, data.settings);
    }
  });
}
