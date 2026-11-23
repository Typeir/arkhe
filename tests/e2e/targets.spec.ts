import { expect, type Locator, type Page, test } from '@playwright/test';

const TARGETS = ['react', 'svelte'] as const;

async function hitsAt(target: Locator, dx: number, dy: number) {
  return target.evaluate(
    (element, [x, y]) => {
      const box = element.getBoundingClientRect();
      const hit = document.elementFromPoint(
        box.left + box.width / 2 + x,
        box.top + box.height / 2 + y,
      );
      return hit !== null && element.contains(hit);
    },
    [dx, dy] as const,
  );
}

async function paint(page: Page, token: string) {
  return page.evaluate((name) => {
    const probe = document.createElement('span');
    probe.className = 'arkhe';
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);
}

for (const target of TARGETS) {
  test.describe(`${target} pointer targets and themes`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`targets/${target}/`);
    });

    test('small buttons answer the pointer across 24px', async ({ page }) => {
      const remove = page.getByRole('button', { name: 'Remove resistance' });
      const close = page.getByRole('button', { name: 'Close xs' });
      for (const small of [remove, close]) {
        const box = await small.boundingBox();
        expect(box?.width ?? 0).toBeLessThan(24);
        expect(await hitsAt(small, 11, 0)).toBe(true);
        expect(await hitsAt(small, 0, -11)).toBe(true);
      }
    });

    test('one palette follows the colour scheme', async ({ page }) => {
      expect(await paint(page, '--color-bg')).toBe('rgb(17, 18, 23)');
      await page.evaluate(() => {
        document.documentElement.dataset['theme'] = 'light';
      });
      expect(await paint(page, '--color-bg')).toBe('rgb(253, 253, 247)');
    });
  });
}

test('a host that sets color-scheme light dark follows the OS', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('targets/react/');
  await page.addStyleTag({ content: ':root { color-scheme: light dark; }' });
  const bg = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--color-bg)';
    document.body.append(probe);
    return getComputedStyle(probe).color;
  });
  expect(bg).toBe('rgb(253, 253, 247)');
});
