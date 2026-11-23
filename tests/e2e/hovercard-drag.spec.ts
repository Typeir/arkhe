import { expect, type Locator, type Page, test } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;

async function openCard(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: 'charge', exact: true }).focus();
  const card = page.getByRole('dialog', { name: 'Charge' });
  await expect(card).toBeVisible();
  await card.evaluate((element) =>
    Promise.all(
      element.getAnimations({ subtree: true }).map((run) => run.finished),
    ),
  );
  return card;
}

async function box(card: Locator) {
  const found = await card.boundingBox();
  if (!found) throw new Error('card has no box');
  return found;
}

function grip(card: Locator): Locator {
  return card.getByRole('button', { name: 'Move Charge. Arrow keys move it.' });
}

for (const target of TARGETS) {
  test.describe(`${target} hover card drag`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`targets/${target}/`);
    });

    test('dragging the header moves the card with the pointer and pins it', async ({
      page,
    }) => {
      const card = await openCard(page);
      const title = card.locator('[data-part="title"]');
      const start = await title.boundingBox();
      const before = await box(card);
      if (!start) throw new Error('no title box');
      await page.mouse.move(start.x + 5, start.y + 5);
      await page.mouse.down();
      await page.mouse.move(start.x + 7, start.y + 6);
      expect((await box(card)).x).toBeCloseTo(before.x, 0);
      await page.mouse.move(start.x + 125, start.y + 65, { steps: 8 });
      await page.mouse.up();
      const after = await box(card);
      expect(after.x - before.x).toBeCloseTo(120, 0);
      expect(after.y - before.y).toBeCloseTo(60, 0);
      await expect(
        card.getByRole('button', { name: 'Unpin Charge' }),
      ).toBeVisible();
      await page.mouse.click(5, 5);
      await expect(card).toBeVisible();
    });

    test('a press on a header button never drags', async ({ page }) => {
      const card = await openCard(page);
      const before = await box(card);
      const pin = card.getByRole('button', { name: 'Pin Charge' });
      const at = await pin.boundingBox();
      if (!at) throw new Error('no pin box');
      await page.mouse.move(at.x + at.width / 2, at.y + at.height / 2);
      await page.mouse.down();
      await page.mouse.move(at.x + 120, at.y + 80, { steps: 6 });
      await page.mouse.up();
      expect((await box(card)).x).toBeCloseTo(before.x, 0);
    });

    test('arrow keys on the grip move it 8px, 32px with Shift', async ({
      page,
    }) => {
      const card = await openCard(page);
      const before = await box(card);
      await grip(card).focus();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Shift+ArrowDown');
      const after = await box(card);
      expect(after.x - before.x).toBeCloseTo(8, 0);
      expect(after.y - before.y).toBeCloseTo(32, 0);
      await expect(grip(card)).toBeFocused();
    });

    test('the card stays inside the viewport', async ({ page }) => {
      const card = await openCard(page);
      const title = await card.locator('[data-part="title"]').boundingBox();
      if (!title) throw new Error('no title box');
      await page.mouse.move(title.x + 5, title.y + 5);
      await page.mouse.down();
      await page.mouse.move(5000, 5000, { steps: 6 });
      await page.mouse.up();
      const after = await box(card);
      const view = page.viewportSize();
      expect(after.x + after.width).toBeLessThanOrEqual((view?.width ?? 0) + 1);
      expect(after.y + after.height).toBeLessThanOrEqual(
        (view?.height ?? 0) + 1,
      );
    });

    test('the move menu corners the card; Escape there closes only the menu', async ({
      page,
    }) => {
      const card = await openCard(page);
      await grip(card).click();
      await page.getByRole('menuitem', { name: 'Bottom right' }).click();
      const after = await box(card);
      const view = page.viewportSize();
      expect((view?.width ?? 0) - (after.x + after.width)).toBeCloseTo(8, 0);
      await grip(card).click();
      await expect(page.getByRole('menu')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('menu')).toBeHidden();
      await expect(card).toBeVisible();
    });
  });
}
