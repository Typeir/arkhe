import { expect, test } from '@playwright/test';
import {
  GROUP,
  TARGETS,
  framesOver,
  openDemo as open,
  opaqueShare,
  readStats as stats,
  revealAll,
} from '@tests/fixtures/skeletonPage';

const CAP_PX = 16_777_216;

for (const target of TARGETS) {
  test.describe(`${target} canvas skeleton settings`, () => {
    test('a height-only resize leaves running reveals alone', async ({
      page,
    }) => {
      await open(page, target, 'grouped');
      await expect(page.locator(`.reveal-article ${GROUP}`)).toHaveAttribute(
        'data-painted',
        '',
      );
      await page.getByRole('button', { name: 'Load' }).click();
      await page.waitForTimeout(60);
      const before = (await stats(page))?.regions;
      const size = page.viewportSize() ?? { width: 1280, height: 720 };
      await page.setViewportSize({
        width: size.width,
        height: size.height + 60,
      });
      await page.waitForTimeout(150);
      expect(before).toBeGreaterThan(0);
      expect((await stats(page))?.regions).toBe(before);
    });

    test('backing stores stay under the caps, at most 2× on a 3× screen', async ({
      browser,
    }) => {
      const context = await browser.newContext({ deviceScaleFactor: 3 });
      const page = await context.newPage();
      await open(page, target, 'grouped');
      await expect(page.locator(`.reveal-article ${GROUP}`)).toHaveAttribute(
        'data-painted',
        '',
      );
      const sizes = await page.evaluate(() =>
        [...document.querySelectorAll('canvas')].map((c) => ({
          w: c.width,
          h: c.height,
          css: c.getBoundingClientRect().width,
        })),
      );
      expect(sizes.length).toBeGreaterThan(0);
      for (const s of sizes) {
        expect(s.w * s.h).toBeLessThanOrEqual(CAP_PX);
        expect(Math.max(s.w, s.h)).toBeLessThanOrEqual(8192);
        expect(s.w).toBeLessThanOrEqual(Math.ceil(s.css * 2));
      }
      expect((await stats(page))?.liveCanvases).toBeLessThanOrEqual(24);
      await context.close();
    });

    test('viewport surface: one fixed canvas that idles once revealed', async ({
      page,
    }) => {
      const errors = await open(page, target, 'viewport');
      await expect(page.locator(`.reveal-article ${GROUP}`)).toHaveAttribute(
        'data-painted',
        '',
      );
      expect(await page.locator('canvas').count()).toBe(1);
      expect(await opaqueShare(page, '[data-canvas-viewport]')).toBeGreaterThan(
        0,
      );
      await revealAll(page);
      expect(await framesOver(page, 1000)).toBe(0);
      expect(
        await page
          .locator('[data-canvas-viewport]')
          .evaluate((c: HTMLCanvasElement) => c.width),
      ).toBe(0);
      expect(errors).toEqual([]);
    });

    test('reduced motion draws one still frame and runs no loop', async ({
      browser,
    }) => {
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      await open(page, target, 'grouped');
      await expect(page.locator(`.reveal-article ${GROUP}`)).toHaveAttribute(
        'data-painted',
        '',
      );
      await page.waitForTimeout(300);
      expect(await framesOver(page, 1000)).toBe(0);
      await page.getByRole('button', { name: 'Load' }).click();
      await expect(page.getByText('Revealed: 3')).toBeVisible();
      await context.close();
    });

    test('forced colours keep the CSS skeleton and draw no canvas', async ({
      browser,
    }) => {
      const context = await browser.newContext({ forcedColors: 'active' });
      const page = await context.newPage();
      await open(page, target, 'grouped');
      await page.waitForTimeout(500);
      expect(await page.locator('canvas').count()).toBe(0);
      await expect(page.locator(`${GROUP}[data-painted]`)).toHaveCount(0);
      await page.getByRole('button', { name: 'Load' }).click();
      await expect(page.getByText('Revealed: 3')).toBeVisible();
      await context.close();
    });

    test('effects off keeps every CSS skeleton', async ({ page }) => {
      await open(page, target, 'off');
      await page.waitForTimeout(500);
      expect(await page.locator('canvas').count()).toBe(0);
      expect(await stats(page)).toBeNull();
      await page.getByRole('button', { name: 'Load' }).click();
      await expect(page.getByText('Revealed: 3')).toBeVisible();
    });
  });
}
