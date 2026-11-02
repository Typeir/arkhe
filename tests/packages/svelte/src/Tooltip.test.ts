import { Tooltip } from '@arkhe/svelte';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

describe('Tooltip', () => {
  it('shows its hint on hover and describes the trigger', async () => {
    render(Tooltip, {
      content: 'Resistance halves damage.',
      openDelay: 0,
      children: textSnippet('resistance'),
    });
    const trigger = screen.getByRole('button', { name: 'resistance' });
    expect(trigger).toHaveAttribute('type', 'button');
    await userEvent.hover(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Resistance halves damage.',
    );
    expect(trigger).toHaveAccessibleDescription('Resistance halves damage.');
  });

  it('hides on Escape', async () => {
    render(Tooltip, {
      content: 'Hint',
      openDelay: 0,
      closeDelay: 0,
      children: textSnippet('word'),
    });
    await userEvent.hover(screen.getByRole('button', { name: 'word' }));
    await screen.findByRole('tooltip');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });
});
