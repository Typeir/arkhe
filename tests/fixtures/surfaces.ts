/**
 * @fileoverview Stand-ins for the canvas surface tests: a surface context
 * with a hand-stepped frame loop, and regions whose one slice is a set of
 * mocks.
 *
 * @module tests/fixtures/surfaces
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { vi, type Mock } from 'vitest';
import { CanvasBudget } from '../../packages/core/src/canvas/budget';
import type { DisplayWatcher } from '../../packages/core/src/canvas/display';
import { FrameLoop } from '../../packages/core/src/canvas/loop';
import { ObserverHub } from '../../packages/core/src/canvas/observers';
import type {
  Region,
  Slice,
  SurfaceContext,
} from '../../packages/core/src/canvas/view';

/**
 * A slice whose answers tests set.
 *
 * @interface MockSlice
 * @property {boolean} retains - Keeps pixels.
 * @property {boolean} busy - Answer of `pending`.
 * @property {Mock} paint - Paint calls.
 */
export interface MockSlice extends Slice {
  retains: boolean;
  busy: boolean;
  readonly paint: Mock<Slice['paint']>;
}

/**
 * A context plus a way to run its frames.
 *
 * @interface TestContext
 * @property {SurfaceContext} ctx - Context.
 * @property {(t: number) => void} step - Runs the pending frame at `t`.
 * @property {Mock} painted - First-paint reports.
 * @property {Mock} done - Done reports.
 */
export interface TestContext {
  readonly ctx: SurfaceContext;
  readonly step: (t: number) => void;
  readonly painted: Mock<(region: Region) => void>;
  readonly done: Mock<(region: Region) => void>;
}

/**
 * Makes a surface context at DPR 2 in a 400×800 viewport.
 *
 * @function testContext
 * @param {Partial<SurfaceContext>} [over] - Overrides.
 * @returns {TestContext} Context.
 */
export function testContext(over: Partial<SurfaceContext> = {}): TestContext {
  let next: FrameRequestCallback | null = null;
  const loop = new FrameLoop(
    (cb) => ((next = cb), 1),
    () => (next = null),
    () => 0,
  );
  const painted = vi.fn<(region: Region) => void>();
  const done = vi.fn<(region: Region) => void>();
  const display = {
    dpr: 2,
    viewW: 400,
    viewH: 800,
  } as unknown as DisplayWatcher;
  const ctx: SurfaceContext = {
    loop,
    budget: new CanvasBudget(24, 1e8),
    hub: new ObserverHub(),
    display,
    revision: () => 0,
    sleep: 'keep',
    tileScale: 1,
    wakeMargin: '100% 0px',
    painted,
    done,
    ...over,
  };
  const step = (t: number) => {
    const cb = next;
    next = null;
    cb?.(t);
  };
  return { ctx, step, painted, done };
}

/**
 * Makes a slice that is pending and animating until `busy` turns false.
 *
 * @function mockSlice
 * @returns {MockSlice} Slice.
 */
export function mockSlice(): MockSlice {
  const s: MockSlice = {
    retains: true,
    busy: true,
    start: () => undefined,
    pending: () => s.busy,
    animating: () => s.busy,
    settlesAt: () => Infinity,
    paint: vi.fn<Slice['paint']>(),
  };
  return s;
}

/**
 * Makes a region of `height` at the viewport top whose every slice is `s`.
 *
 * @function mockRegion
 * @param {HTMLElement} host - Owner element.
 * @param {number} height - Height, CSS px.
 * @param {MockSlice} s - Slice.
 * @returns {Region} Region.
 */
export function mockRegion(
  host: HTMLElement,
  height: number,
  s: MockSlice,
): Region {
  return {
    host,
    width: 100,
    height,
    step: 12,
    box: () => ({ left: 5, top: 0, bottom: height }),
    key: () => 'same',
    slice: () => s,
  };
}
