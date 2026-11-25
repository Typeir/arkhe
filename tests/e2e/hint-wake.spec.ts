/**
 * @fileoverview Sleeping tooltips: the first hover and the first Tab wake
 * the machine and open the tooltip as a live one would, on the same
 * trigger node, which keeps focus. The hover scrolls first: a scroll while
 * a tooltip opens closes it, sleeping or not.
 *
 * @module tests/e2e/hint-wake.spec
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import { expect, type Page, test } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;

/**
 * Marks the tooltip trigger so a later check can tell whether it is still
 * the same node.
 *
 * @function markTrigger
 * @param {Page} page - Page.
 * @returns {Promise<void>}
 */
async function markTrigger(page: Page): Promise<void> {
  await page
    .getByRole('button', { name: 'resistance', exact: true })
    .evaluate((el) => {
      (window as unknown as { marked: Element }).marked = el;
    });
}

/**
 * Whether the marked node is still the trigger and holds focus.
 *
 * @function sameFocusedTrigger
 * @param {Page} page - Page.
 * @returns {Promise<boolean>} Same node, focused.
 */
async function sameFocusedTrigger(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const { marked } = window as unknown as { marked: Element };
    return marked.isConnected && document.activeElement === marked;
  });
}

for (const target of TARGETS) {
  test.describe(`${target} sleeping tooltip`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`targets/${target}/`);
      await markTrigger(page);
    });

    test('the first hover opens it', async ({ page }) => {
      const trigger = page.getByRole('button', {
        name: 'resistance',
        exact: true,
      });
      await trigger.scrollIntoViewIfNeeded();
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      await trigger.hover();
      await expect(page.getByRole('tooltip')).toHaveText(
        'Halves incoming damage.',
      );
    });

    test('the first Tab opens it on the same focused node', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const { marked } = window as unknown as { marked: HTMLElement };
        const before = document.createElement('button');
        before.textContent = 'before';
        marked.before(before);
        before.focus();
      });
      await page.keyboard.press('Tab');
      await expect(page.getByRole('tooltip')).toHaveText(
        'Halves incoming damage.',
      );
      expect(await sameFocusedTrigger(page)).toBe(true);
    });
  });
}
