import { tap } from '@tests/fixtures/tap';
import { screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, describe, expect, it } from 'vitest';
import {
  byteSize,
  countTriggers,
  duplicateIds,
  floatingParts,
  nestingViolations,
} from './audit';
import { SHARD_LOADS } from './data';
import { DENSE_TRIGGERS } from './fixtures';
import {
  hydrateSvelte,
  stopSsr,
  svelteServerHtml,
  type SceneName,
  type SveltePage,
} from './sveltePage';

const BYTES_PER_TRIGGER = 360;
const SCENES: readonly SceneName[] = ['lineage', 'sheet', 'dense'];
const pages: SveltePage[] = [];

async function open(name: SceneName): Promise<SveltePage> {
  const page = await hydrateSvelte(name);
  pages.push(page);
  return page;
}

function unitTrigger(label: string): HTMLElement {
  return screen.getAllByText(label, {
    selector: '[data-scope="tooltip"][data-part="trigger"]',
  })[0] as HTMLElement;
}

afterEach(() => {
  for (const page of pages.splice(0)) page.unmount();
  SHARD_LOADS.length = 0;
});

afterAll(stopSsr);

describe('Islands: server render and hydration (Svelte)', () => {
  for (const name of SCENES) {
    it(`${name}: hydrates cleanly, nesting nothing in a button or link`, async () => {
      const page = await open(name);
      expect(duplicateIds()).toEqual([]);
      expect(nestingViolations(page.container)).toEqual([]);
    }, 60_000);

    it(`${name}: server markup holds no floating body`, async () => {
      expect(floatingParts(await svelteServerHtml(name))).toEqual([]);
    }, 60_000);
  }

  it('dense paragraph: stays within the byte budget per trigger', async () => {
    const html = await svelteServerHtml('dense');
    expect(countTriggers(html)).toBe(DENSE_TRIGGERS);
    expect(byteSize(html) / DENSE_TRIGGERS).toBeLessThan(BYTES_PER_TRIGGER);
  });

  it('Unit: opens on hover, closes on Escape', async () => {
    await open('lineage');
    await userEvent.hover(unitTrigger('6 strides'));
    const hint = await screen.findByRole('tooltip', {}, { timeout: 2000 });
    expect(hint).toHaveTextContent('9 m');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('Unit: a tap opens it, a tap outside closes it', async () => {
    const page = await open('lineage');
    await tap(unitTrigger('5 strides'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('7.5 m');
    await tap(page.container.querySelector('h1') as HTMLElement);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('Keyword: a router link whose card loads on first open', async () => {
    await open('lineage');
    const link = screen.getByRole('link', { name: 'Charmed' });
    expect(link).toHaveAttribute('href', '/en/library/keywords/charmed');
    expect(link).toHaveAttribute('data-router-link');
    expect(SHARD_LOADS).toEqual([]);
    await userEvent.hover(link);
    expect(
      await screen.findByText(
        'charmed is defined here.',
        {},
        { timeout: 2000 },
      ),
    ).toBeVisible();
    expect(SHARD_LOADS).toEqual(['charmed']);
  });

  it('Keyword: the card portals out of the paragraph, so its body may hold blocks', async () => {
    const page = await open('lineage');
    await tap(screen.getByRole('link', { name: 'Charmed' }));
    const body = await screen.findByText('charmed is defined here.');
    expect(body.tagName).toBe('P');
    expect(body.parentElement?.closest('p')).toBeNull();
    expect(page.container.contains(body)).toBe(false);
  });

  it('Popover: opens after hydration', async () => {
    await open('sheet');
    await userEvent.click(screen.getByRole('button', { name: 'Rings' }));
    expect(
      await screen.findByRole('dialog', { name: 'Ring list' }),
    ).toBeVisible();
  });
});
