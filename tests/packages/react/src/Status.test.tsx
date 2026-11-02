import { ArkheProvider, Status } from '@arkhe/react';
import { announced } from '@tests/fixtures/announced';
import { render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

const app = (children: ReactNode) => <ArkheProvider>{children}</ArkheProvider>;

describe('Status', () => {
  it('says the kind default text politely, without a live role of its own', () => {
    const { container } = render(app(<Status kind='empty' />));
    expect(announced()).toBe('Nothing here yet.');
    expect(
      container.querySelector('[data-scope="status"]'),
    ).not.toHaveAttribute('role');
  });

  it('interrupts for errors', () => {
    render(app(<Status kind='error' />));
    expect(announced('assertive')).toBe('Something went wrong.');
    expect(announced()).toBe('');
  });

  it('prefers given text and draws the kind icon', () => {
    const { container } = render(
      app(<Status kind='info'>Two rolls left.</Status>),
    );
    expect(container.querySelector('[data-scope="status"]')).toHaveTextContent(
      'Two rolls left.',
    );
    expect(container.querySelector('[data-scope="icon"]')).toHaveAttribute(
      'data-name',
      'info',
    );
  });

  it('speaks each change of text, once', async () => {
    const { rerender } = render(app(<Status kind='info'>One</Status>));
    rerender(app(<Status kind='info'>Two</Status>));
    rerender(app(<Status kind='info'>Two</Status>));
    await waitFor(() => expect(announced()).toBe('OneTwo'));
  });

  it('speaks without a provider once its regions settle', async () => {
    render(<Status kind='loading' />);
    await waitFor(() => expect(announced()).toContain('Loading…'));
  });
});
