import { Icon } from '@arkhe/svelte';
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('Icon', () => {
  it('draws the Lucide glyph, hidden when decorative', () => {
    const { container } = render(Icon, { name: 'check' });
    const root = container.querySelector('[data-scope="icon"]') as HTMLElement;
    expect(root).toHaveAttribute('data-name', 'check');
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('data-missing');
    expect(root.querySelector('svg')).not.toBeNull();
  });

  it('becomes an image when labelled', () => {
    render(Icon, { name: 'info', label: 'Details' });
    expect(screen.getByRole('img', { name: 'Details' })).toBeInTheDocument();
  });

  it('marks an unknown name as missing', () => {
    const { container } = render(Icon, { name: 'not-an-icon' });
    const root = container.querySelector('[data-scope="icon"]') as HTMLElement;
    expect(root).toHaveAttribute('data-missing', '');
    expect(root.querySelector('svg')).toBeNull();
  });
});
