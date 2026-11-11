import { Button } from '@arkhe/svelte';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('Button', () => {
  it('renders a typed button with the contract attributes', () => {
    render(Button, { variant: 'primary', children: textSnippet('Save') });
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-scope', 'button');
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).toHaveClass('arkhe');
    expect(button).not.toHaveAttribute('data-icon-only');
  });

  it('calls onclick', async () => {
    const onclick = vi.fn();
    render(Button, { onclick, children: textSnippet('Go') });
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onclick).toHaveBeenCalledOnce();
  });

  it('marks icon-only buttons and names them by label', () => {
    render(Button, { icon: 'x', label: 'Close' });
    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute(
      'data-icon-only',
      '',
    );
  });

  it('takes a rhombus outline', () => {
    render(Button, { icon: 'plus', label: 'Add', shape: 'rhombus' });
    expect(screen.getByRole('button', { name: 'Add' })).toHaveAttribute(
      'data-shape',
      'rhombus',
    );
  });

  it('takes a size, and a rhombus around the icon of a labelled button', () => {
    render(Button, { icon: 'x', label: 'Close', size: 'xs' });
    render(Button, {
      icon: 'plus',
      shape: 'rhombus',
      size: 'l',
      children: textSnippet('Add'),
    });
    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute(
      'data-size',
      'xs',
    );
    const labelled = screen.getByRole('button', { name: 'Add' });
    expect(labelled).toHaveAttribute('data-shape', 'rhombus');
    expect(labelled).toHaveAttribute('data-size', 'l');
    expect(labelled).not.toHaveAttribute('data-icon-only');
  });

  it('reports toggle state', () => {
    render(Button, { pressed: true, children: textSnippet('Bold') });
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('renders a link when href is set', () => {
    render(Button, { href: '/docs', children: textSnippet('Docs') });
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      '/docs',
    );
  });

  it('drops the address, click and tab stop of a disabled link', async () => {
    const onclick = vi.fn();
    const { container } = render(Button, {
      href: '/docs',
      disabled: true,
      onclick,
      children: textSnippet('Docs'),
    });
    const anchor = container.querySelector('a') as HTMLAnchorElement;
    await userEvent.click(anchor);
    expect(anchor).not.toHaveAttribute('href');
    expect(anchor).toHaveAttribute('aria-disabled', 'true');
    expect(anchor).toHaveAttribute('tabindex', '-1');
    expect(onclick).not.toHaveBeenCalled();
  });
});
