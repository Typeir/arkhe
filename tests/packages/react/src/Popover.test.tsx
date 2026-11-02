import { ArkheProvider, Popover } from '@arkhe/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('Popover', () => {
  it('toggles a titled panel from its button', async () => {
    const onOpenChange = vi.fn();
    render(
      <Popover trigger='Filters' title='Filter by' onOpenChange={onOpenChange}>
        <p>Body</p>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Filters' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    const panel = await screen.findByRole('dialog', { name: 'Filter by' });
    expect(panel).toHaveTextContent('Body');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it('closes on Escape and returns focus', async () => {
    render(<Popover trigger='Filters' title='Filter by' />);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('closes from the labelled close button', async () => {
    render(
      <ArkheProvider labels={{ close: 'Sulje' }}>
        <Popover trigger='Filters' defaultOpen />
      </ArkheProvider>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Sulje' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
