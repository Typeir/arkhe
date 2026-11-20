import { expect, test } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;

for (const target of TARGETS) {
  test.describe(`${target} radio group`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`targets/${target}/`);
    });

    test('one tab stop; arrows move the choice and skip disabled', async ({
      page,
    }) => {
      const boon = page.getByRole('radiogroup', { name: 'Boon' });
      const grace = boon.getByRole('radio', { name: 'Grace' });
      await grace.focus();
      await page.keyboard.press('ArrowRight');
      await expect(boon.getByRole('radio', { name: 'Wit' })).toBeChecked();
      await page.keyboard.press('ArrowRight');
      await expect(boon.getByRole('radio', { name: 'Might' })).toBeChecked();
      await page.keyboard.press('Tab');
      await expect(
        page
          .getByRole('radiogroup', { name: 'Focus' })
          .getByRole('radio')
          .first(),
      ).toBeFocused();
    });

    test('pips are rhombuses, and the chosen one lights inside', async ({
      page,
    }) => {
      const boon = page.getByRole('radiogroup', { name: 'Boon' });
      const look = (name: string) =>
        boon.getByRole('radio', { name }).evaluate((element) => {
          const style = getComputedStyle(element);
          return { rotate: style.rotate, image: style.backgroundImage };
        });
      expect((await look('Might')).rotate).toBe('45deg');
      expect((await look('Might')).image).toBe('none');
      expect((await look('Grace')).image).toContain('linear-gradient');
    });

    test('segments join and light the chosen one', async ({ page }) => {
      const units = page.getByRole('radiogroup', { name: 'Units' });
      const segment = (name: string) =>
        units.getByRole('radio', { name }).locator('xpath=ancestor::label');
      const metric = await segment('Metric').boundingBox();
      const imperial = await segment('Imperial').boundingBox();
      expect(
        Math.abs((metric?.x ?? 0) + (metric?.width ?? 0) - (imperial?.x ?? 0)),
      ).toBeLessThanOrEqual(1);
      await units.getByRole('radio', { name: 'Imperial' }).focus();
      await expect(segment('Imperial')).toHaveCSS('outline-style', 'solid');
      const lit = await segment('Metric').evaluate(
        (element) => getComputedStyle(element).color,
      );
      await page.keyboard.press('ArrowRight');
      await expect
        .poll(() =>
          segment('Stride').evaluate(
            (element) => getComputedStyle(element).color,
          ),
        )
        .toBe(lit);
    });

    test('every choice answers the pointer across 24px', async ({ page }) => {
      const item = page
        .getByRole('radiogroup', { name: 'Focus' })
        .getByRole('radio', { name: 'Might' })
        .locator('xpath=ancestor::label');
      const box = await item.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
    });
  });
}
