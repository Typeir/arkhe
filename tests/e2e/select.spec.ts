import { expect, test } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;
const BOXES = ['Spell', 'Learn spell', 'Search'] as const;

for (const target of TARGETS) {
  test.describe(`${target} select family`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`targets/${target}/`);
    });

    for (const label of BOXES) {
      test(`${label}: editing mid-text keeps the caret`, async ({ page }) => {
        const input = page.getByRole('combobox', { name: label, exact: true });
        await input.click();
        await input.pressSequentially('frrost', { delay: 20 });
        await expect(input).toHaveValue('frrost');
        for (let i = 0; i < 4; i += 1) await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('Backspace');
        await page.keyboard.type('o');
        await expect(input).toHaveValue('forost');
        expect(
          await input.evaluate((el: HTMLInputElement) => el.selectionStart),
        ).toBe(2);
      });
    }

    test('picker adds the chosen spell and empties itself', async ({
      page,
    }) => {
      const input = page.getByRole('combobox', {
        name: 'Learn spell',
        exact: true,
      });
      await input.click();
      await input.pressSequentially('ward');
      await page.keyboard.press('Enter');
      await expect(input).toHaveValue('');
      await expect(page.getByText('Known: Ward')).toBeVisible();
    });

    test('search submits free text and completes on Tab', async ({ page }) => {
      const input = page.getByRole('combobox', { name: 'Search', exact: true });
      await input.click();
      await input.pressSequentially('ember');
      await page.keyboard.press('Enter');
      await expect(page.getByText('Searched: ember')).toBeVisible();
      await input.fill('');
      await input.pressSequentially('gob');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Tab');
      await expect(input).toHaveValue('Goblin');
      await expect(input).toBeFocused();
    });

    test('plain select: keys choose, the list is as wide as the button', async ({
      page,
    }) => {
      const trigger = page.getByRole('combobox', {
        name: 'School',
        exact: true,
      });
      await trigger.focus();
      await page.keyboard.press('Enter');
      const list = page.getByRole('listbox');
      await expect(list).toBeVisible();
      const button = await trigger.boundingBox();
      const box = await list.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual((button?.width ?? 0) - 1);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await expect(trigger).toHaveText('Divination');
      await expect(page.getByText('School: divination')).toBeVisible();
      await expect(trigger).toBeFocused();
    });

    test('the list is at least as wide as the input', async ({ page }) => {
      const input = page.getByRole('combobox', { name: 'Spell', exact: true });
      await input.click();
      const list = page.getByRole('listbox');
      await expect(list).toBeVisible();
      const control = await input.locator('..').boundingBox();
      const box = await list.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual((control?.width ?? 0) - 1);
    });
  });
}
