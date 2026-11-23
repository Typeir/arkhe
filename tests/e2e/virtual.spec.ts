import { expect, type Locator, test } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;

async function centreRow(box: Locator, row: string): Promise<string | null> {
  return box.evaluate((element, wanted) => {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
    return hit?.closest(wanted)?.textContent?.trim() ?? null;
  }, row);
}

for (const target of TARGETS) {
  test.describe(`${target} virtual rows`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`targets/${target}/#select`);
    });

    test('a long Select draws a window and End reaches the last row', async ({
      page,
    }) => {
      const trigger = page.getByRole('combobox', { name: 'Rune' });
      await trigger.click();
      const list = page.getByRole('listbox', { name: 'Rune' });
      await expect(list).toBeVisible();
      await expect(list).toBeFocused();
      const options = list.getByRole('option');
      expect(await options.count()).toBeLessThan(40);
      await expect(options.first()).toHaveAttribute('aria-setsize', '2000');
      await page.keyboard.press('End');
      const last = list.getByRole('option', { name: 'Rune 2000' });
      await expect(last).toBeInViewport();
      await expect(last).toHaveAttribute('data-highlighted', '');
      await expect(last).toHaveAttribute('aria-posinset', '2000');
      await page.keyboard.press('Enter');
      await expect(trigger).toHaveText('Rune 2000');
    });

    test('a wheel scroll leaves no blank rows in view', async ({ page }) => {
      await page.getByRole('combobox', { name: 'Rune' }).click();
      const list = page.getByRole('listbox', { name: 'Rune' });
      await expect(list).toBeVisible();
      await list.hover();
      await page.mouse.wheel(0, 20000);
      await expect
        .poll(() => list.evaluate((element) => element.scrollTop))
        .toBeGreaterThan(10000);
      await expect
        .poll(() => centreRow(list, '[role="option"]'))
        .toMatch(/^Rune \d+$/);
      const heights = await list
        .getByRole('option')
        .evaluateAll((rows) =>
          rows.map((row) => row.getBoundingClientRect().height),
        );
      expect(new Set(heights)).toEqual(new Set([32]));
    });

    test('VirtualList scrolls to its last row', async ({ page }) => {
      const list = page.getByRole('list', { name: 'Runes' });
      await list.scrollIntoViewIfNeeded();
      expect(await list.getByRole('listitem').count()).toBeLessThan(40);
      await list.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      const last = list.getByRole('listitem').filter({ hasText: 'Rune 2000' });
      await expect(last).toBeInViewport();
      await expect(last).toHaveAttribute('aria-posinset', '2000');
      await list.evaluate((element) => {
        element.scrollTop = element.scrollHeight / 2;
      });
      await expect.poll(() => centreRow(list, 'li')).toMatch(/^Rune \d+$/);
    });
  });

  test.describe(`${target} virtual rows on a phone`, () => {
    test.use({ viewport: { width: 390, height: 760 }, hasTouch: true });

    test('the sheet draws a window and a choice closes it', async ({
      page,
    }) => {
      await page.goto(`targets/${target}/#select`);
      await page.getByRole('button', { name: /^Rune/ }).tap();
      const sheet = page.getByRole('dialog', { name: 'Rune' });
      const list = sheet.getByRole('listbox');
      await expect(list).toBeVisible();
      expect(await list.getByRole('option').count()).toBeLessThan(60);
      await sheet
        .getByRole('combobox', { name: 'Rune' })
        .pressSequentially('1999');
      await sheet.getByRole('option', { name: 'Rune 1999' }).tap();
      await expect(sheet).toBeHidden();
      await expect(
        page.getByRole('button', { name: 'Rune Rune 1999' }),
      ).toBeVisible();
    });
  });
}
