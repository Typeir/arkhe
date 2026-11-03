import { expect, test, type Page } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;
const CAP_PX = 16_777_216;
const GROUP = '[data-scope="skeleton"][data-part="group"]';

type Stats = Record<string, number>;

const open = async (page: Page, target: string, fx: string) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`targets/${target}/?fx=${fx}`);
  await page.locator('#skeleton').scrollIntoViewIfNeeded();
  return errors;
};

const stats = (page: Page) =>
  page.evaluate(
    () =>
      (
        window as Window & {
          arkheEffects?: { engine: { stats(): Stats } | null };
        }
      ).arkheEffects?.engine?.stats() ?? null,
  );

const framesOver = async (page: Page, ms: number) => {
  const a = (await stats(page))?.frames ?? 0;
  await page.waitForTimeout(ms);
  return ((await stats(page))?.frames ?? 0) - a;
};

const revealAll = async (page: Page) => {
  await page.getByRole('button', { name: 'Load' }).click();
  const output = page.locator('#skeleton output');
  for (let i = 0; i < 20; i += 1) {
    if ((await output.textContent()) === 'Revealed: 3') return;
    await page.mouse.wheel(0, 160);
    await page.waitForTimeout(250);
  }
  await expect(output).toHaveText('Revealed: 3', { timeout: 4000 });
};

const opaqueShare = (page: Page, selector: string) =>
  page.evaluate((sel) => {
    const canvas = document.querySelector<HTMLCanvasElement>(sel);
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !canvas.width) return 0;
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i]) n++;
    return n / (d.length / 4);
  }, selector);

for (const target of TARGETS) {
  test.describe(`${target} canvas skeleton`, () => {
    test('tiles paint each owner, then the CSS skeleton gives way', async ({
      page,
    }) => {
      const errors = await open(page, target, 'grouped');
      const article = page.locator(`.reveal-article ${GROUP}`);
      await expect(article).toHaveAttribute('data-painted', '');
      expect(await opaqueShare(page, `.reveal-article canvas`)).toBeGreaterThan(
        0,
      );
      const bar = article.locator('[data-part="root"]').first();
      await expect(bar).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(bar).toHaveCSS('background-image', 'none');
      const plain = page.locator(GROUP).last();
      expect(await plain.locator('canvas').count()).toBe(0);
      await expect(plain).not.toHaveAttribute('data-painted');
      await expect(plain.locator('[data-part="root"]')).not.toHaveCSS(
        'background-image',
        'none',
      );
      expect(errors).toEqual([]);
    });

    test('a bordered owner keeps its canvas inside its padding box', async ({
      page,
    }) => {
      await open(page, target, 'grouped');
      const card = page.locator(`.reveal-card ${GROUP}`);
      await expect(card).toHaveAttribute('data-painted', '');
      const spill = await card.evaluate((host) => {
        const c = host.querySelector('canvas') as HTMLCanvasElement;
        const r = c.getBoundingClientRect();
        const b = host.getBoundingClientRect();
        const s = getComputedStyle(host);
        return Math.max(
          b.left + parseFloat(s.borderLeftWidth) - r.left,
          r.right - (b.right - parseFloat(s.borderRightWidth)),
          b.top + parseFloat(s.borderTopWidth) - r.top,
          r.bottom - (b.bottom - parseFloat(s.borderBottomWidth)),
        );
      });
      expect(spill).toBeLessThan(0.5);
    });

    for (const surface of ['grouped', 'viewport'] as const) {
      test(`${surface}: the cover paints in the same task as the swap`, async ({
        page,
      }) => {
        await open(page, target, surface);
        const article = page.locator(`.reveal-article ${GROUP}`);
        await expect(article).toHaveAttribute('data-painted', '');
        const cover = await article.evaluate(
          (host, onViewport) =>
            new Promise<number>((resolve) => {
              const canvas = (
                onViewport
                  ? document.querySelector('[data-canvas-viewport]')
                  : host.querySelector('canvas')
              ) as HTMLCanvasElement;
              new MutationObserver((_, mo) => {
                mo.disconnect();
                const hr = host.getBoundingClientRect();
                const cr = canvas.getBoundingClientRect();
                const k = canvas.width / cr.width;
                const d = (
                  canvas.getContext('2d') as CanvasRenderingContext2D
                ).getImageData(
                  Math.round((hr.left - cr.left + 2) * k),
                  Math.round((hr.top - cr.top + 2) * k),
                  Math.round((hr.width - 4) * k),
                  Math.round(16 * k),
                ).data;
                let o = 0;
                for (let i = 3; i < d.length; i += 4) if (d[i] === 255) o++;
                resolve(o / (d.length / 4));
              }).observe(host, { childList: true });
              document
                .querySelector<HTMLButtonElement>('#skeleton button')
                ?.click();
            }),
          surface === 'viewport',
        );
        expect(cover).toBeGreaterThan(0.99);
      });
    }

    test('the reveal ends, reports itself, leaves nothing behind, and the loop stops', async ({
      page,
    }) => {
      const errors = await open(page, target, 'grouped');
      await expect(page.locator(`.reveal-article ${GROUP}`)).toHaveAttribute(
        'data-painted',
        '',
      );
      await revealAll(page);
      await expect(
        page.getByRole('heading', { name: 'The ferryman' }),
      ).toBeVisible();
      expect(await page.locator('canvas,[data-canvas-sentinel]').count()).toBe(
        0,
      );
      await expect(page.locator(`${GROUP}[data-painted]`)).toHaveCount(0);
      expect(await framesOver(page, 1000)).toBe(0);
      expect((await stats(page))?.running).toBe(0);
      await page.getByRole('button', { name: 'Reload' }).click();
      await expect(page.locator(`.reveal-article ${GROUP}`)).toHaveAttribute(
        'data-painted',
        '',
      );
      expect(errors).toEqual([]);
    });

    test('the effect loop holds its 30 fps cap while animating', async ({
      page,
    }) => {
      await open(page, target, 'grouped');
      await expect(page.locator(`.reveal-article ${GROUP}`)).toHaveAttribute(
        'data-painted',
        '',
      );
      const n = await framesOver(page, 1000);
      expect(n).toBeGreaterThanOrEqual(20);
      expect(n).toBeLessThanOrEqual(33);
    });

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
