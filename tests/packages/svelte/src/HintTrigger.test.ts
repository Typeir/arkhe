import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import HintTrigger from '../../../../packages/svelte/src/HintTrigger.svelte';

describe('HintTrigger', () => {
  it('renders a button by default', () => {
    render(HintTrigger, { attrs: { id: 't' }, children: textSnippet('word') });
    const button = screen.getByRole('button', { name: 'word' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('id', 't');
  });

  it('renders an a with href when no provider link is set, over inline', () => {
    render(HintTrigger, {
      attrs: {},
      href: '/rule',
      inline: true,
      children: textSnippet('rule'),
    });
    expect(screen.getByRole('link', { name: 'rule' })).toHaveAttribute(
      'href',
      '/rule',
    );
  });

  it('renders inline text with a tab stop', () => {
    render(HintTrigger, {
      attrs: {},
      inline: true,
      children: textSnippet('word'),
    });
    const span = screen.getByText('word').parentElement;
    expect(span?.tagName).toBe('SPAN');
    expect(span).toHaveAttribute('tabindex', '0');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
