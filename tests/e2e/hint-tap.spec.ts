import { expect, test } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;

test.use({ hasTouch: true });

for (const target of TARGETS) {
  test.describe(`${target} hints on touch`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`targets/${target}/`);
    });

    test('a tap opens a tooltip, it stays open, a tap outside closes it', async ({
      page,
    }) => {
      const trigger = page.getByRole('button', {
        name: 'resistance',
        exact: true,
      });
      const hint = page.getByRole('tooltip');
      await trigger.tap();
      await expect(hint).toHaveText('Halves incoming damage.');
      await page.waitForTimeout(500);
      await expect(hint).toBeVisible();
      await page.locator('#floating h2').tap();
      await expect(hint).toBeHidden();
    });

    test('a second tap closes the tooltip', async ({ page }) => {
      const trigger = page.getByRole('button', {
        name: 'resistance',
        exact: true,
      });
      await trigger.tap();
      await expect(page.getByRole('tooltip')).toBeVisible();
      await trigger.tap();
      await expect(page.getByRole('tooltip')).toBeHidden();
    });

    test('a tap opens a hover card, a tap outside closes it', async ({
      page,
    }) => {
      const title = page.locator('[data-part="title"]', { hasText: 'Charge' });
      await page.getByRole('button', { name: 'charge', exact: true }).tap();
      await expect(title).toBeVisible();
      await page.waitForTimeout(500);
      await expect(title).toBeVisible();
      await page.locator('#floating h2').tap();
      await expect(title).toBeHidden();
    });
  });
}
