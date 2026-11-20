import { expect, test } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;

for (const target of TARGETS) {
  test.describe(`${target} checkbox`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`targets/${target}/`);
    });

    test('Space toggles, Enter does not', async ({ page }) => {
      const pip = page.getByRole('checkbox', { name: 'Pip m' });
      await pip.focus();
      await page.keyboard.press('Enter');
      await expect(pip).not.toBeChecked();
      await page.keyboard.press('Space');
      await expect(pip).toBeChecked();
    });

    test('the pip turns into a rhombus and lights when checked', async ({
      page,
    }) => {
      const pip = page.getByRole('checkbox', { name: 'Pip m' });
      const look = () =>
        pip.evaluate((element) => {
          const style = getComputedStyle(element);
          return { rotate: style.rotate, fill: style.backgroundColor };
        });
      const idle = await look();
      expect(idle.rotate).toBe('45deg');
      await pip.check();
      await expect.poll(async () => (await look()).fill).not.toBe(idle.fill);
    });

    test('the label row is at least 24px tall', async ({ page }) => {
      const row = page
        .getByRole('checkbox', { name: 'Pip s' })
        .locator('xpath=ancestor::label');
      const box = await row.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
    });

    test('the box mark shows the check, then the minus when mixed', async ({
      page,
    }) => {
      const all = page.getByRole('checkbox', { name: 'All spells' });
      const shown = (name: string) =>
        all.evaluate(
          (element, icon) =>
            getComputedStyle(
              element.parentElement?.querySelector(
                `[data-name="${icon}"]`,
              ) as Element,
            ).scale,
          name,
        );
      await expect.poll(() => shown('minus')).toBe('1');
      await page.getByRole('checkbox', { name: 'Ember' }).check();
      await expect.poll(() => shown('check')).toBe('1');
      await expect.poll(() => shown('minus')).toBe('0');
    });
  });
}
