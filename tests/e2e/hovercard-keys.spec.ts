import { expect, test } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;

for (const target of TARGETS) {
  test.describe(`${target} hover card from the keyboard`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`targets/${target}/`);
    });

    test('Tab enters the open card and leaves it past the trigger', async ({
      page,
    }) => {
      const trigger = page.getByRole('button', { name: 'charge', exact: true });
      await trigger.focus();
      const card = page.getByRole('dialog', { name: 'Charge' });
      await expect(card).toBeVisible();
      const pin = card.getByRole('button', { name: 'Pin Charge' });
      await page.keyboard.press('Tab');
      await expect(pin).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(trigger).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(pin).toBeFocused();
      await card.getByRole('button', { name: 'action' }).focus();
      await page.keyboard.press('Tab');
      await expect(card).toBeHidden();
      await expect(trigger).not.toBeFocused();
      await expect(page.locator(':focus')).not.toHaveCount(0);
    });

    test('Enter pins, Escape closes the pinned card and focus returns', async ({
      page,
    }) => {
      const trigger = page.getByRole('button', { name: 'charge', exact: true });
      await trigger.focus();
      await page.keyboard.press('Enter');
      const card = page.getByRole('dialog', { name: 'Charge' });
      await expect(card.getByRole('button', { name: 'Close' })).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(
        card.getByRole('button', { name: 'Unpin Charge' }),
      ).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(card).toBeHidden();
      await expect(trigger).toBeFocused();
    });

    test('Escape closes the nested card first', async ({ page }) => {
      const trigger = page.getByRole('button', { name: 'charge', exact: true });
      await trigger.focus();
      await page.keyboard.press('Enter');
      const outer = page.getByRole('dialog', { name: 'Charge' });
      const action = outer.getByRole('button', { name: 'action' });
      await expect(outer.getByRole('button', { name: 'Close' })).toBeVisible();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(action).toBeFocused();
      const inner = page.getByRole('dialog', { name: 'Action' });
      await expect(inner).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(inner).toBeHidden();
      await expect(outer).toBeVisible();
      await expect(action).toBeFocused();
    });
  });
}
