/**
 * @fileoverview Helpers for the canvas skeleton browser checks: open a
 * showcase target with an effect setting, read the engine's stats, count
 * effect frames, read a canvas's painted share, and reveal every owner of
 * the skeleton demo the way a reader would, by scrolling through it.
 *
 * @module tests/fixtures/skeletonPage
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { expect, type Page } from '@playwright/test';

/**
 * Showcase targets the checks run on.
 *
 * @constant TARGETS
 * @type {readonly string[]}
 */
export const TARGETS = ['react', 'svelte'] as const;

/**
 * Selector of a `SkeletonGroup` root.
 *
 * @constant GROUP
 * @type {string}
 */
export const GROUP = '[data-scope="skeleton"][data-part="group"]';

/**
 * Engine counters.
 *
 * @typedef {Record<string, number>} Stats
 */
export type Stats = Record<string, number>;

/**
 * Opens `target` with `?fx=<fx>` and scrolls to the skeleton demo.
 *
 * @function openDemo
 * @param {Page} page - Page.
 * @param {string} target - `react` or `svelte`.
 * @param {string} fx - Effect setting.
 * @returns {Promise<string[]>} Page errors, filled as they happen.
 */
export async function openDemo(
  page: Page,
  target: string,
  fx: string,
): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`targets/${target}/?fx=${fx}`);
  await page.locator('#skeleton').scrollIntoViewIfNeeded();
  return errors;
}

/**
 * Reads the engine's stats; null when no engine was made.
 *
 * @function readStats
 * @param {Page} page - Page.
 * @returns {Promise<Stats | null>} Stats.
 */
export function readStats(page: Page): Promise<Stats | null> {
  return page.evaluate(
    () =>
      (
        window as Window & {
          arkheEffects?: { engine: { stats(): Stats } | null };
        }
      ).arkheEffects?.engine?.stats() ?? null,
  );
}

/**
 * Counts effect frames drawn over `ms`.
 *
 * @function framesOver
 * @param {Page} page - Page.
 * @param {number} ms - Window, ms.
 * @returns {Promise<number>} Frames.
 */
export async function framesOver(page: Page, ms: number): Promise<number> {
  const a = (await readStats(page))?.frames ?? 0;
  await page.waitForTimeout(ms);
  return ((await readStats(page))?.frames ?? 0) - a;
}

/**
 * Loads the demo and scrolls through it until all three owners report
 * their reveal: rows only decode once they come into view.
 *
 * @function revealAll
 * @param {Page} page - Page.
 * @returns {Promise<void>} Resolves once revealed.
 */
export async function revealAll(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Load' }).click();
  const output = page.locator('#skeleton output');
  for (let i = 0; i < 20; i += 1) {
    if ((await output.textContent()) === 'Revealed: 3') return;
    await page.mouse.wheel(0, 160);
    await page.waitForTimeout(250);
  }
  await expect(output).toHaveText('Revealed: 3', { timeout: 4000 });
}

/**
 * Share of a canvas's pixels that are not transparent.
 *
 * @function opaqueShare
 * @param {Page} page - Page.
 * @param {string} selector - Canvas selector.
 * @returns {Promise<number>} Share, 0 to 1.
 */
export function opaqueShare(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const canvas = document.querySelector<HTMLCanvasElement>(sel);
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !canvas.width) return 0;
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i]) n++;
    return n / (d.length / 4);
  }, selector);
}
