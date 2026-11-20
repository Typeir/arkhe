import { expect, test, type Locator, type Page } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;

function trigger(page: Page, name: string): Locator {
  return page.getByRole('button', { name, exact: true });
}

async function region(page: Page, name: string): Promise<Locator> {
  const id = await trigger(page, name).getAttribute('aria-controls');
  return page.locator(`[id="${id}"]`);
}

async function look(box: Locator) {
  return box.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      height: Math.round(element.getBoundingClientRect().height),
      visibility: style.contentVisibility,
      hidden: element.getAttribute('hidden'),
      natural: element.scrollHeight,
    };
  });
}

for (const target of TARGETS) {
  test.describe(`${target} collapsible height`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`targets/${target}/`);
    });

    test('a closed region is findable, zero tall and not painted', async ({
      page,
    }) => {
      const state = await look(await region(page, 'Sealed lore'));
      expect(state.hidden).toBe('until-found');
      expect(state.height).toBe(0);
      expect(state.visibility).toBe('hidden');
    });

    test('opening eases from zero to the natural height', async ({ page }) => {
      const box = await region(page, 'Sealed lore');
      await trigger(page, 'Sealed lore').click();
      const early = await look(box);
      expect(early.height).toBeLessThan(early.natural);
      await expect
        .poll(async () => (await look(box)).visibility)
        .toBe('visible');
      await expect
        .poll(async () => {
          const state = await look(box);
          return state.height === state.natural && state.height > 0;
        })
        .toBe(true);
    });

    test('closing keeps the content painted until the height reaches zero', async ({
      page,
    }) => {
      const box = await region(page, 'Growing');
      const open = await look(box);
      await trigger(page, 'Growing').click();
      const early = await look(box);
      expect(early.visibility).toBe('visible');
      expect(early.height).toBeGreaterThan(0);
      expect(early.height).toBeLessThanOrEqual(open.height);
      await expect.poll(async () => (await look(box)).height).toBe(0);
      await expect
        .poll(async () => (await look(box)).visibility)
        .toBe('hidden');
      expect((await look(box)).hidden).toBe('until-found');
    });

    test('closing mid-open settles closed', async ({ page }) => {
      const box = await region(page, 'Sealed lore');
      await trigger(page, 'Sealed lore').click();
      await page.waitForTimeout(80);
      await trigger(page, 'Sealed lore').click();
      await expect.poll(async () => (await look(box)).height).toBe(0);
      await expect(trigger(page, 'Sealed lore')).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    test('a nested section grows its open parent', async ({ page }) => {
      const outer = await region(page, 'Layer');
      const before = (await look(outer)).height;
      await trigger(page, 'Inner').click();
      await expect
        .poll(async () => (await look(outer)).height)
        .toBeGreaterThan(before);
      await expect
        .poll(async () => {
          const state = await look(outer);
          return state.height === state.natural;
        })
        .toBe(true);
    });

    test('content that grows while open is never clipped', async ({ page }) => {
      const box = await region(page, 'Growing');
      const before = (await look(box)).height;
      await page.getByRole('button', { name: 'Grow', exact: true }).click();
      await page.getByRole('button', { name: 'Grow', exact: true }).click();
      const state = await look(box);
      expect(state.height).toBeGreaterThan(before);
      expect(state.height).toBe(state.natural);
    });

    test('a text fragment opens the section that hides it', async ({
      page,
    }) => {
      await page.goto(
        `targets/${target}/#:~:text=${encodeURIComponent('Lanterns under the ice')}`,
      );
      await expect(trigger(page, 'Sealed lore')).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      await expect(page.getByText('Lanterns under the ice')).toBeVisible();
    });

    test('reduced motion opens at once', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const box = await region(page, 'Sealed lore');
      await trigger(page, 'Sealed lore').click();
      const state = await look(box);
      expect(state.height).toBe(state.natural);
    });

    test('disclosures open one at a time and animate natively', async ({
      page,
    }) => {
      const palette = page.locator('details', { hasText: 'Palette in 3D' });
      const lut = page.locator('details', { hasText: 'LUT colours in 3D' });
      await expect(palette).toHaveAttribute('open', '');
      await lut.locator('summary').click();
      await expect(lut).toHaveAttribute('open', '');
      await expect(palette).not.toHaveAttribute('open', '');
    });

    test('the held accordion section is disabled but focusable', async ({
      page,
    }) => {
      const held = page
        .getByRole('heading', { level: 4, name: 'Senses' })
        .getByRole('button');
      await expect(held).toHaveAttribute('aria-disabled', 'true');
      await held.focus();
      await expect(held).toBeFocused();
      await held.click({ force: true });
      await expect(held).toHaveAttribute('aria-expanded', 'true');
    });
  });
}
