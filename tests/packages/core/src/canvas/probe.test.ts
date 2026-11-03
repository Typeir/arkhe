// @vitest-environment jsdom
import { stubCanvas } from '@tests/fixtures/canvas';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PROBE_KEY,
  probeAcceleration,
} from '../../../../../packages/core/src/canvas/probe';

const webgl = (renderer: string) => {
  const lose = vi.fn();
  return {
    lose,
    gl: {
      getExtension: (name: string) =>
        name === 'WEBGL_debug_renderer_info'
          ? { UNMASKED_RENDERER_WEBGL: 1 }
          : { loseContext: lose },
      getParameter: () => renderer,
    },
  };
};

afterEach(() => {
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe('probeAcceleration', () => {
  it('reads a GPU renderer as accelerated and drops its context', () => {
    const { gl, lose } = webgl('ANGLE (NVIDIA)');
    stubCanvas(gl);
    expect(probeAcceleration()).toEqual({
      accelerated: true,
      renderer: 'ANGLE (NVIDIA)',
    });
    expect(lose).toHaveBeenCalledTimes(1);
  });

  it('reads a software rasteriser as not accelerated', () => {
    stubCanvas(webgl('Google SwiftShader').gl);
    expect(probeAcceleration().accelerated).toBe(false);
  });

  it('reads no fast WebGL as not accelerated', () => {
    stubCanvas(null);
    expect(probeAcceleration()).toEqual({
      accelerated: false,
      renderer: 'no fast webgl',
    });
  });

  it('opens one context per session', () => {
    stubCanvas(webgl('ANGLE').gl);
    probeAcceleration();
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');
    spy.mockClear();
    expect(probeAcceleration().renderer).toBe('ANGLE');
    expect(spy).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(PROBE_KEY)).toContain('ANGLE');
  });
});
