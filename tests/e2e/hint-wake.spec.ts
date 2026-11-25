/**
 * @fileoverview Sleeping hints: the first hover and the first Tab wake the
 * machine and open the tooltip or card as a live one would, on the same
 * trigger node, which keeps focus. A card nested in a woken card wakes on
 * its own, and every hint sleeps again once closed. Hovers scroll first: a scroll while a tooltip opens closes it,
 * sleeping or not.
 *
 * @module tests/e2e/hint-wake.spec
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import { expect, type Locator, type Page, test } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;

/**
 * A sleeping hint on the specimen page.
 *
 * @interface Case
 * @property {string} kind - Component name.
 * @property {string} trigger - Accessible name of the trigger.
 * @property {(page: Page) => Locator} hint - The opened hint.
 */
interface Case {
  readonly kind: string;
  readonly trigger: string;
  readonly hint: (page: Page) => Locator;
}

const CASES: readonly Case[] = [
  {
    kind: 'tooltip',
    trigger: 'resistance',
    hint: (page) =>
      page.getByRole('tooltip').filter({ hasText: 'Halves incoming damage.' }),
  },
  {
    kind: 'hover card',
    trigger: 'charge',
    hint: (page) => page.getByRole('dialog', { name: 'Charge' }),
  },
];

/**
 * Waits two frames, so scroll events settle.
 *
 * @function frames
 * @param {Page} page - Page.
 * @returns {Promise<void>}
 */
async function frames(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

for (const target of TARGETS) {
  for (const { kind, trigger: name, hint } of CASES) {
    test.describe(`${target} sleeping ${kind}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`targets/${target}/`);
      });

      test('the first hover opens it', async ({ page }) => {
        const trigger = page.getByRole('button', { name, exact: true });
        await trigger.scrollIntoViewIfNeeded();
        await frames(page);
        await trigger.hover();
        await expect(hint(page)).toBeVisible();
      });

      test('it sleeps again after closing and wakes again', async ({
        page,
      }) => {
        const trigger = page.getByRole('button', { name, exact: true });
        await trigger.scrollIntoViewIfNeeded();
        await frames(page);
        await trigger.hover();
        await expect(hint(page)).toBeVisible();
        await page.mouse.move(0, 0);
        await expect(hint(page)).toHaveCount(0);
        await trigger.hover();
        await expect(hint(page)).toBeVisible();
      });
      test('the first Tab opens it on the same focused node', async ({
        page,
      }) => {
        const trigger = page.getByRole('button', { name, exact: true });
        await trigger.evaluate((el) => {
          const before = document.createElement('button');
          before.textContent = 'before';
          el.closest('[data-part="root"]')?.before(before);
          (window as unknown as { marked: Element }).marked = el;
          before.focus();
        });
        await page.keyboard.press('Tab');
        await expect(hint(page)).toBeVisible();
        expect(
          await page.evaluate(() => {
            const { marked } = window as unknown as { marked: Element };
            return marked.isConnected && document.activeElement === marked;
          }),
        ).toBe(true);
      });
    });
  }

  test(`${target}: a nested card wakes on its own inside a woken card`, async ({
    page,
  }) => {
    await page.goto(`targets/${target}/`);
    const charge = page.getByRole('button', { name: 'charge', exact: true });
    await charge.click();
    const card = page.getByRole('dialog', { name: 'Charge' });
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'action', exact: true }).hover();
    await expect(page.getByRole('dialog', { name: 'Action' })).toBeVisible();
    await expect(card).toBeVisible();
  });
}
