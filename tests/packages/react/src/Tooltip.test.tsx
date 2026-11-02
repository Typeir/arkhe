import { Tooltip } from '@arkhe/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

describe('Tooltip', () => {
  it('shows its hint on hover and describes the trigger', async () => {
    render(
      <Tooltip content='Resistance halves damage.' openDelay={0}>
        resistance
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'resistance' });
    expect(trigger).toHaveAttribute('type', 'button');
    expect(screen.queryByRole('tooltip')).toBeNull();
    await userEvent.hover(trigger);
    const hint = await screen.findByRole('tooltip');
    expect(hint).toHaveTextContent('Resistance halves damage.');
    expect(trigger).toHaveAccessibleDescription('Resistance halves damage.');
  });

  it('hides on Escape', async () => {
    render(
      <Tooltip content='Hint' openDelay={0} closeDelay={0}>
        word
      </Tooltip>,
    );
    await userEvent.hover(screen.getByRole('button', { name: 'word' }));
    await screen.findByRole('tooltip');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });
});
