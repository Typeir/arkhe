import { expect, test } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;

test.use({ viewport: { width: 390, height: 760 }, hasTouch: true });

for (const target of TARGETS) {
  test.describe(`${target} select family on a phone`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`targets/${target}/#select`);
    });

    test('Select opens a bottom sheet focused on its search box', async ({
      page,
    }) => {
      const trigger = page.getByRole('button', { name: 'School Any school' });
      await trigger.tap();
      const sheet = page.getByRole('dialog', { name: 'School' });
      await expect(sheet).toBeVisible();
      await expect
        .poll(async () => {
          const box = await sheet.boundingBox();
          return [
            Math.round((box?.y ?? 0) + (box?.height ?? 0)),
            Math.round(box?.width ?? 0),
          ];
        })
        .toEqual([760, 390]);
      const search = sheet.getByRole('combobox', { name: 'School' });
      await expect(search).toBeFocused();
      await expect(search).toHaveValue('');
      await search.pressSequentially('div');
      await sheet.getByRole('option', { name: 'Divination' }).tap();
      await expect(sheet).toBeHidden();
      await expect(
        page.getByRole('button', { name: 'School Divination' }),
      ).toBeVisible();
      await expect(page.getByText('School: divination')).toBeVisible();
    });

    test('Search asks its request inside the sheet and closes on a choice', async ({
      page,
    }) => {
      await page.getByRole('button', { name: /^Search/ }).tap();
      const sheet = page.getByRole('dialog', { name: 'Search' });
      const search = sheet.getByRole('combobox', { name: 'Search' });
      await expect(search).toBeFocused();
      await search.pressSequentially('gob');
      await sheet.getByRole('option', { name: /Goblin/ }).tap();
      await expect(sheet).toBeHidden();
    });

    test('Escape closes the sheet and focus returns to the button', async ({
      page,
    }) => {
      const trigger = page.getByRole('button', { name: /^Spell/ });
      await trigger.tap();
      const sheet = page.getByRole('dialog', { name: 'Spell' });
      await expect(sheet).toBeVisible();
      await page.keyboard.press('Escape');
      await page.keyboard.press('Escape');
      await expect(sheet).toBeHidden();
      await expect(trigger).toBeFocused();
    });
  });
}
