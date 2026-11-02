/**
 * @fileoverview Screenshots the built showcase: landing in both themes and
 * each target on its own. Serves `apps/showcase/dist` with Vite's preview
 * server and drives Chromium through Playwright.
 *
 * @module .github/scripts/showcase-shots
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { preview } from 'vite';

const ROOT = resolve(import.meta.dirname, '../..');
const OUT = resolve(process.argv[2] ?? join(ROOT, '.ignore/shots'));
const PORT = 5191;

/**
 * Serves the built showcase, saves the screenshots, and stops the server.
 *
 * @function shoot
 * @returns {Promise<void>} Resolves when every shot is saved.
 */
export async function shoot() {
  mkdirSync(OUT, { recursive: true });
  const server = await preview({
    root: join(ROOT, 'apps/showcase'),
    configFile: join(ROOT, 'apps/showcase/vite.config.ts'),
    preview: { port: PORT, strictPort: true, host: '127.0.0.1' },
  });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1000 },
    });
    await page.goto(`http://127.0.0.1:${PORT}/`);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: join(OUT, '1-landing-dark.png'),
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Light' }).click();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: join(OUT, '2-landing-light.png'),
      fullPage: true,
    });
    for (const target of ['react', 'svelte', 'static']) {
      await page.goto(`http://127.0.0.1:${PORT}/targets/${target}/`);
      await page.waitForTimeout(600);
      await page.screenshot({
        path: join(OUT, `3-${target}.png`),
        fullPage: true,
      });
    }
    await page.goto(`http://127.0.0.1:${PORT}/targets/svelte/`);
    await page.getByRole('button', { name: 'Open modal' }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(OUT, '4-svelte-modal.png') });
    await page.goto(
      `http://127.0.0.1:${PORT}/targets/svelte/?shot=cards#floating`,
    );
    await page.getByRole('button', { name: 'charge', exact: true }).hover();
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: 'action', exact: true }).hover();
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(OUT, '5-svelte-cards.png') });
    await page.goto(
      `http://127.0.0.1:${PORT}/targets/react/?shot=menu#floating`,
    );
    await page.getByRole('button', { name: 'Actions', exact: true }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUT, '6-react-menu.png') });
    await page.goto(
      `http://127.0.0.1:${PORT}/targets/svelte/?shot=combobox#combobox`,
    );
    const search = page.getByRole('combobox', { name: 'Search', exact: true });
    await search.click();
    await search.pressSequentially('r');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(OUT, '8-svelte-combobox.png') });
  } finally {
    await browser.close();
    await server.close();
  }
}

await shoot();
