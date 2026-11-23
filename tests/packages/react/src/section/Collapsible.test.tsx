import { Collapsible } from '@arkhe/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

function region(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-part="content"]') as HTMLElement;
}

describe('Collapsible', () => {
  it('ties a stable trigger name to a findable closed region', () => {
    const { container } = render(
      <Collapsible title='Lore'>
        <p>Old roads.</p>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: 'Lore' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', region(container).id);
    expect(region(container).getAttribute('hidden')).toBe('until-found');
  });

  it('opens and closes on press, reporting each change', async () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <Collapsible title='Lore' onOpenChange={onOpenChange}>
        <p>Old roads.</p>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: 'Lore' });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(region(container)).not.toHaveAttribute('hidden');
    expect(container.firstElementChild).toHaveAttribute('data-state', 'open');
    await userEvent.click(trigger);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(screen.getByRole('button', { name: 'Lore' })).toBe(trigger);
  });

  it('opens when the browser reveals the region', () => {
    const onOpenChange = vi.fn();
    render(
      <Collapsible title='Lore' onOpenChange={onOpenChange}>
        <p>Old roads.</p>
      </Collapsible>,
    );
    fireEvent(
      screen.getByText('Old roads.'),
      new Event('beforematch', { bubbles: true }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('wraps the trigger in a heading and keeps actions outside it', () => {
    render(
      <Collapsible title='Layer' heading={3} actions={<button>Lock</button>}>
        <p>Body</p>
      </Collapsible>,
    );
    const heading = screen.getByRole('heading', { level: 3, name: 'Layer' });
    expect(heading).toContainElement(
      screen.getByRole('button', { name: 'Layer' }),
    );
    expect(heading).not.toContainElement(
      screen.getByRole('button', { name: 'Lock' }),
    );
  });

  it('follows a controlled state and ignores presses while disabled', async () => {
    const { rerender } = render(
      <Collapsible title='Lore' open>
        <p>Body</p>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    rerender(
      <Collapsible title='Lore' open={false} disabled>
        <p>Body</p>
      </Collapsible>,
    );
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('mounts lazy content on first open and keeps it', async () => {
    render(
      <Collapsible title='Lore' lazy>
        <p>Old roads.</p>
      </Collapsible>,
    );
    expect(screen.queryByText('Old roads.')).toBeNull();
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    expect(screen.getByText('Old roads.')).toBeInTheDocument();
  });

  it('is a section with a header only when it has a heading', () => {
    const { container, rerender } = render(
      <Collapsible title='Layer' heading={3}>
        <p>Body</p>
      </Collapsible>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.localName).toBe('section');
    expect(root.querySelector('[data-part="header"]')?.localName).toBe(
      'header',
    );
    rerender(
      <Collapsible title='Layer'>
        <p>Body</p>
      </Collapsible>,
    );
    const plain = container.firstElementChild as HTMLElement;
    expect(plain.localName).toBe('div');
    expect(plain.querySelector('[data-part="header"]')?.localName).toBe('div');
  });
});
