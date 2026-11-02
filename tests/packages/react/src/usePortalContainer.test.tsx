import { ArkheEnvironment } from '@arkhe/react';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { usePortalContainer } from '../../../../packages/react/src/usePortalContainer';

describe('usePortalContainer', () => {
  it('reads the body outside any environment', () => {
    const { result } = renderHook(() => usePortalContainer());
    expect(result.current.current).toBe(document.body);
  });

  it('reads the environment container lazily', () => {
    const box = document.createElement('div');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ArkheEnvironment container={box}>{children}</ArkheEnvironment>
    );
    const { result } = renderHook(() => usePortalContainer(), { wrapper });
    expect(result.current.current).toBe(box);
  });
});
