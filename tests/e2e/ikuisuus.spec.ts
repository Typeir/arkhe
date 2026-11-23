import { expect, test } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;

for (const target of TARGETS) {
  test.describe(`${target} Ikuisuus keyword clone`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 900, height: 700 });
      await page.goto(`targets/${target}/`);
    });

    test('opens 250px wide, centred 8px above the keyword', async ({
      page,
    }) => {
      const trigger = page.locator('#ikuisuus .prose').getByRole('link', {
        name: 'Burning',
      });
      await trigger.scrollIntoViewIfNeeded();
      await trigger.hover();
      const card = page.getByRole('dialog', { name: 'Burning' });
      await expect(card).toBeVisible();
      await card.evaluate((element) =>
        Promise.all(element.getAnimations().map((run) => run.finished)),
      );
      const box = await card.boundingBox();
      const at = await trigger.boundingBox();
      if (!box || !at) throw new Error('no box');
      expect(box.width).toBe(250);
      expect(at.y - (box.y + box.height)).toBeCloseTo(8, 0);
      expect(box.x + box.width / 2).toBeCloseTo(at.x + at.width / 2, 0);
    });

    test('a pinned card gets its close control', async ({ page }) => {
      const trigger = page.locator('#ikuisuus .prose').getByRole('link', {
        name: 'Burning',
      });
      await trigger.scrollIntoViewIfNeeded();
      await trigger.hover();
      const card = page.getByRole('dialog', { name: 'Burning' });
      await expect(card).toBeVisible();
      await expect(
        card.getByRole('button', { name: 'Close Burning' }),
      ).toHaveCount(0);
      await card.getByRole('button', { name: /^Move Burning/ }).focus();
      await page.keyboard.press('ArrowLeft');
      await card.getByRole('button', { name: 'Close Burning' }).click();
      await expect(card).toBeHidden();
    });
  });
}
