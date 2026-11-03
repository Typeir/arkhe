import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { useHydrated } from '../../../../packages/react/src/useHydrated';

const Probe = () => <span>{useHydrated() ? 'client' : 'server'}</span>;

describe('useHydrated', () => {
  it('is false on the server and true once hydrated', async () => {
    const html = renderToString(<Probe />);
    expect(html).toBe('<span>server</span>');
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);
    const errors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <Probe />, {
        onRecoverableError: (error) => errors.push(error),
      });
    });
    expect(errors).toEqual([]);
    expect(container.textContent).toBe('client');
    await act(async () => root?.unmount());
    container.remove();
  });
});
