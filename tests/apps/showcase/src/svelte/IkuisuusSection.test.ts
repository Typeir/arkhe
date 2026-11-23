import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import IkuisuusSection from '../../../../../apps/showcase/src/svelte/IkuisuusSection.svelte';

describe('Svelte IkuisuusSection', () => {
  it('shows the feat line with its keyword as a link', () => {
    render(IkuisuusSection);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Ikuisuus keywords' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Burning' })).toHaveAttribute(
      'href',
      '#ikuisuus',
    );
  });

  it('opens the card into the section layer, with its nested keywords', async () => {
    const { container } = render(IkuisuusSection);
    await userEvent.hover(screen.getByRole('link', { name: 'Burning' }));
    const card = await screen.findByRole('dialog', { name: 'Burning' });
    expect(container.querySelector('.ikuisuus-layer')).toContainElement(card);
    expect(
      within(card).getByRole('heading', { level: 3, name: 'Burning' }),
    ).toBeInTheDocument();
    expect(
      within(card).getByRole('link', { name: 'prone' }),
    ).toBeInTheDocument();
  });
});
