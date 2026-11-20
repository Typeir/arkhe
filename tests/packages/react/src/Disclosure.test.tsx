import { Disclosure } from '@arkhe/react';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

describe('Disclosure', () => {
  it('is a native details with a plain summary', () => {
    const { container } = render(
      <Disclosure summary='Palette in 3D'>
        <p>Cube</p>
      </Disclosure>,
    );
    const details = container.querySelector('details');
    expect(details).not.toHaveAttribute('open');
    expect(screen.getByText('Palette in 3D').closest('summary')).not.toBeNull();
    expect(
      details?.querySelector('summary h1, summary h2, summary h3'),
    ).toBeNull();
  });

  it('starts open and joins a single-open group by name', () => {
    const { container } = render(
      <Disclosure summary='LUT' defaultOpen name='views'>
        <p>Cube</p>
      </Disclosure>,
    );
    const details = container.querySelector('details');
    expect(details).toHaveAttribute('open');
    expect(details).toHaveAttribute('name', 'views');
  });

  it('works from server markup alone', () => {
    const html = renderToString(
      <Disclosure summary='LUT' defaultOpen>
        <p>Cube</p>
      </Disclosure>,
    );
    expect(html).toMatch(/^<details[^>]* open=""/);
    expect(html).toContain('<summary');
  });
});
