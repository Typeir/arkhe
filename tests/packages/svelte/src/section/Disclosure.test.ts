import { Disclosure } from '@arkhe/svelte';
import { render, screen } from '@testing-library/svelte';
import { textSnippet } from '@tests/fixtures/svelte/snippets';
import { describe, expect, it } from 'vitest';

describe('Disclosure', () => {
  it('is a native details with a plain summary', () => {
    const { container } = render(Disclosure, {
      summary: 'Palette in 3D',
      children: textSnippet('Cube'),
    });
    const details = container.querySelector('details');
    expect(details).not.toHaveAttribute('open');
    expect(screen.getByText('Palette in 3D').closest('summary')).not.toBeNull();
    expect(
      details?.querySelector('summary h1, summary h2, summary h3'),
    ).toBeNull();
  });

  it('starts open and joins a single-open group by name', () => {
    const { container } = render(Disclosure, {
      summary: 'LUT',
      defaultOpen: true,
      name: 'views',
      children: textSnippet('Cube'),
    });
    const details = container.querySelector('details');
    expect(details).toHaveAttribute('open');
    expect(details).toHaveAttribute('name', 'views');
  });
});
