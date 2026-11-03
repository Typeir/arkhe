import { tap } from '@tests/fixtures/tap';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import {
  byteSize,
  countTriggers,
  duplicateIds,
  floatingParts,
  nestingViolations,
} from './audit';
import { SHARD_LOADS } from './data';
import { DENSE_MDX, DENSE_TRIGGERS, LINEAGE_MDX, SHEET_MDX } from './fixtures';
import {
  clientPage,
  hydratePage,
  serverHtml,
  type HydratedPage,
} from './reactPage';

const BYTES_PER_TRIGGER = 300;
const FIXTURES = { lineage: LINEAGE_MDX, sheet: SHEET_MDX, dense: DENSE_MDX };
const pages: HydratedPage[] = [];

async function open(source: string): Promise<HydratedPage> {
  const page = await hydratePage(source);
  pages.push(page);
  return page;
}

function unitTrigger(label: string): HTMLElement {
  return screen.getAllByText(label, {
    selector: '[data-scope="tooltip"][data-part="trigger"]',
  })[0] as HTMLElement;
}

afterEach(async () => {
  for (const page of pages.splice(0)) await page.unmount();
  SHARD_LOADS.length = 0;
});

describe('MDX pipeline: server render and hydration (React)', () => {
  for (const [name, source] of Object.entries(FIXTURES)) {
    it(`${name}: hydrates with no recoverable error`, async () => {
      const page = await open(source);
      expect(page.errors.map(String)).toEqual([]);
      expect(duplicateIds()).toEqual([]);
    });

    it(`${name}: nests no interactive element in a button or link`, async () => {
      const page = await open(source);
      expect(nestingViolations(page.container)).toEqual([]);
      const client = await clientPage(source);
      expect(nestingViolations(client.container)).toEqual([]);
      await client.unmount();
    });

    it(`${name}: server markup holds no floating body`, async () => {
      expect(floatingParts(await serverHtml(source))).toEqual([]);
    });
  }

  it('dense paragraph: stays within the byte budget per trigger', async () => {
    const html = await serverHtml(DENSE_MDX);
    expect(countTriggers(html)).toBe(DENSE_TRIGGERS);
    expect(byteSize(html) / DENSE_TRIGGERS).toBeLessThan(BYTES_PER_TRIGGER);
  });

  it('Unit: opens on hover and closes on Escape', async () => {
    await open(LINEAGE_MDX);
    await userEvent.hover(unitTrigger('6 strides'));
    const hint = await screen.findByRole('tooltip', {}, { timeout: 2000 });
    expect(hint).toHaveTextContent('9 m');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('Unit: opens on keyboard focus', async () => {
    await open(LINEAGE_MDX);
    await userEvent.tab();
    expect(unitTrigger('6 strides')).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('9 m');
  });

  it('Unit: a tap opens it, a tap outside closes it', async () => {
    const page = await open(LINEAGE_MDX);
    await tap(unitTrigger('5 strides'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('7.5 m');
    await tap(page.container.querySelector('h1') as HTMLElement);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('Unit inside a Tooltip trigger: the inner one opens alone', async () => {
    await open(LINEAGE_MDX);
    const outer = screen
      .getByText('Tremorsense', { exact: false, selector: 'span' })
      .closest('[data-part="trigger"]') as HTMLElement;
    const inner = within(outer).getByText('6 strides', {
      selector: '[data-part="trigger"]',
    });
    await userEvent.hover(inner);
    const hint = await screen.findByRole('tooltip', {}, { timeout: 2000 });
    expect(hint).toHaveTextContent('9 m');
    expect(outer).toHaveAttribute('data-state', 'closed');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    await tap(inner);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('9 m');
    expect(outer).toHaveAttribute('data-state', 'closed');
  });

  it('Keyword: a router link whose card loads on first open', async () => {
    await open(LINEAGE_MDX);
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

  it('Keyword: a tap opens the card, Escape closes it', async () => {
    await open(LINEAGE_MDX);
    const link = screen.getByRole('link', { name: 'Frightened' });
    await tap(link);
    const body = await screen.findByText('frightened is defined here.');
    expect(body).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body).not.toBeVisible());
  });

  it('Popover: opens after hydration', async () => {
    await open(SHEET_MDX);
    await userEvent.click(screen.getByRole('button', { name: 'Rings' }));
    expect(
      await screen.findByRole('dialog', { name: 'Ring list' }),
    ).toBeVisible();
  });
});
