import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { buttonSnippet } from '@tests/fixtures/svelte/snippets';
import { describe, expect, it, vi } from 'vitest';
import CardHeader from '../../../../../packages/svelte/src/hint/CardHeader.svelte';

const base = {
  title: 'Charge',
  titleId: 't',
  pinnable: true,
  pinned: false,
  onTogglePin: () => undefined,
  onClose: () => undefined,
  detached: false,
  onMove: () => undefined,
};

describe('CardHeader', () => {
  it('draws the grip, the title, the host actions, then the built-in buttons', () => {
    const { container } = render(CardHeader, {
      ...base,
      href: '/rules/charge',
      actions: buttonSnippet('Copy'),
    });
    const names = [
      ...container.querySelectorAll(':is(button, a):not([hidden] *)'),
    ].map(
      (control) => control.getAttribute('aria-label') ?? control.textContent,
    );
    expect(names).toEqual([
      'Move Charge. Arrow keys move it.',
      'Copy',
      'Open Charge',
      'Pin Charge',
    ]);
    expect(container.querySelector('[data-part="actions"]')).not.toBeNull();
    expect(screen.getByText('Charge')).toHaveAttribute('id', 't');
  });

  it('leaves out the link without an address, and the actions slot without actions', () => {
    const { container } = render(CardHeader, base);
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.querySelector('[data-part="actions"]')).toBeNull();
  });

  it('pins, and closes once pinned', async () => {
    const onTogglePin = vi.fn();
    const onClose = vi.fn();
    render(CardHeader, { ...base, pinned: true, onTogglePin, onClose });
    await userEvent.click(screen.getByRole('button', { name: 'Unpin Charge' }));
    await userEvent.click(screen.getByRole('button', { name: /^Close / }));
    expect(onTogglePin).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('drops the pin button when the card is not pinnable', () => {
    render(CardHeader, { ...base, pinnable: false });
    expect(screen.queryByRole('button', { name: 'Pin Charge' })).toBeNull();
  });
});
