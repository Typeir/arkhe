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
  });
}
