import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import IkuisuusKeyword from '../../../../../apps/showcase/src/svelte/IkuisuusKeyword.svelte';

describe('Svelte IkuisuusKeyword', () => {
  it('shows the written text, defaulting to the keyword’s', () => {
    render(IkuisuusKeyword, { term: 'prone', display: 'Prone' });
    expect(screen.getByRole('link', { name: 'Prone' })).toBeInTheDocument();
  });

  it('opens the card and closes it from Arkhé’s close control once pinned', async () => {
    render(IkuisuusKeyword, { term: 'prone' });
    await userEvent.hover(screen.getByRole('link', { name: 'prone' }));
    const card = await screen.findByRole('dialog', { name: 'Prone' });
    expect(
      within(card).getByRole('link', { name: 'Open the full rule for Prone' }),
    ).toBeInTheDocument();
    expect(
      within(card).queryByRole('button', { name: 'Close Prone' }),
    ).toBeNull();
    within(card)
      .getByRole('button', { name: /^Move Prone/ })
      .focus();
    await userEvent.keyboard('{ArrowLeft}');
    await userEvent.click(
      within(card).getByRole('button', { name: 'Close Prone' }),
    );
    expect(
      screen.queryByRole('dialog', { name: 'Prone' }),
    ).not.toBeInTheDocument();
  });
});
