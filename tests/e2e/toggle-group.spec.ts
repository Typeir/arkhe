import { expect, test } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;

for (const target of TARGETS) {
  test.describe(`${target} toggle group`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`targets/${target}/`);
    });

    test('Tab enters once, arrows move, Tab leaves', async ({ page }) => {
      const bar = page.getByRole('toolbar', { name: 'Aspects' });
      const fire = bar.getByRole('button', { name: 'Fire' });
      await fire.focus();
      await page.keyboard.press('ArrowRight');
      await expect(bar.getByRole('button', { name: 'Frost' })).toBeFocused();
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      await expect(bar.getByRole('button', { name: 'Clear' })).toBeFocused();
      await page.keyboard.press('Home');
      await expect(fire).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(
        page.getByRole('toolbar', { name: 'Tools' }).getByRole('button', {
          name: 'Move',
        }),
      ).toBeFocused();
    });

    test('the vertical group moves with up and down', async ({ page }) => {
      const tools = page.getByRole('toolbar', { name: 'Tools' });
      await tools.getByRole('button', { name: 'Move' }).focus();
      await page.keyboard.press('ArrowRight');
      await expect(tools.getByRole('button', { name: 'Move' })).toBeFocused();
      await page.keyboard.press('ArrowDown');
      await expect(tools.getByRole('button', { name: 'Erase' })).toBeFocused();
    });

    test('a pressed toggle reads by edge and text, not tint alone', async ({
      page,
    }) => {
      const bar = page.getByRole('toolbar', { name: 'Aspects' });
      const paint = (name: string) =>
        bar.getByRole('button', { name }).evaluate((element) => {
          const style = getComputedStyle(element);
          return { edge: style.borderTopColor, text: style.color };
        });
      const idle = await paint('Fire');
      const pressed = await paint('Tide');
      expect(pressed.edge).not.toBe(idle.edge);
      expect(pressed.text).not.toBe(idle.text);
    });
  });
}
