import { ArkheProvider, Button } from '@arkhe/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AnchorHTMLAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';

describe('Button', () => {
  it('renders a typed button with the contract attributes', () => {
    render(<Button variant='primary'>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-scope', 'button');
    expect(button).toHaveAttribute('data-part', 'root');
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).toHaveClass('arkhe');
    expect(button).not.toHaveAttribute('data-icon-only');
  });

  it('calls onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('marks icon-only buttons and names them by label', () => {
    render(<Button icon='x' label='Close' />);
    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute(
      'data-icon-only',
      '',
    );
  });

  it('takes a rhombus outline', () => {
    render(<Button icon='plus' label='Add' shape='rhombus' />);
    expect(screen.getByRole('button', { name: 'Add' })).toHaveAttribute(
      'data-shape',
      'rhombus',
    );
  });

  it('takes a size, and a rhombus around the icon of a labelled button', () => {
    render(
      <>
        <Button icon='x' label='Close' size='xs' />
        <Button icon='plus' shape='rhombus' size='l'>
          Add
        </Button>
      </>,
    );
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
    render(<Button pressed>Bold</Button>);
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('renders a link when href is set', () => {
    render(<Button href='/docs'>Docs</Button>);
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      '/docs',
    );
  });

  it('drops the address, click and tab stop of a disabled link', async () => {
    const onClick = vi.fn();
    const Link = (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a data-router='' {...props} />
    );
    const { container } = render(
      <ArkheProvider link={Link}>
        <Button href='/docs' disabled onClick={onClick}>
          Docs
        </Button>
      </ArkheProvider>,
    );
    const anchor = container.querySelector('a') as HTMLAnchorElement;
    await userEvent.click(anchor);
    expect(anchor).not.toHaveAttribute('href');
    expect(anchor).not.toHaveAttribute('data-router');
    expect(anchor).toHaveAttribute('aria-disabled', 'true');
    expect(anchor).toHaveAttribute('tabindex', '-1');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders links through the provider link adapter', () => {
    const Link = (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a data-router='' {...props} />
    );
    render(
      <ArkheProvider link={Link}>
        <Button href='/docs'>Docs</Button>
      </ArkheProvider>,
    );
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'data-router',
      '',
    );
  });
});
