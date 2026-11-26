import { expect, test } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;

for (const target of TARGETS) {
  test.describe(`${target} tabs`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`targets/${target}/`);
    });

    test('the selected panel takes clicks over the hidden panels after it', async ({
      page,
    }) => {
      const inner = page.getByRole('tab', { name: 'Traits', exact: true });
      await inner.click();
      await expect(inner).toHaveAttribute('aria-selected', 'true');
    });

    test('a hidden panel lets the pointer through', async ({ page }) => {
      const panel = page.locator(
        '[data-scope="tabs"][data-part="content"][hidden="until-found"]',
      );
      await expect(panel.first()).toHaveCSS('pointer-events', 'none');
    });
  });
}
