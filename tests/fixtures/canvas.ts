/**
 * @fileoverview Canvas and browser fakes for the canvas engine tests: jsdom
 * has no 2D context, no `Path2D`, no observers and no `matchMedia`. The
 * fakes record calls and let tests fire observer reports by hand.
 *
 * @module tests/fixtures/canvas
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { vi } from 'vitest';

/**
 * One recorded call: method name and arguments.
 *
 * @typedef {readonly [string, ...unknown[]]} Call
 */
export type Call = readonly [string, ...unknown[]];

/**
 * A 2D context stand-in that records every call.
 *
 * @interface FakeContext
 * @property {Call[]} calls - Calls in order.
 * @property {string} fillStyle - Last fill style set.
 * @property {Uint8ClampedArray} pixel - What `getImageData` returns.
 */
export interface FakeContext {
  readonly calls: Call[];
  fillStyle: string;
  pixel: Uint8ClampedArray;
  [method: string]: unknown;
}

const METHODS = [
  'setTransform',
  'save',
  'restore',
  'beginPath',
  'rect',
  'clip',
  'clearRect',
  'fillRect',
  'fill',
  'drawImage',
  'moveTo',
  'lineTo',
  'closePath',
  'fillText',
];

/**
 * Makes a recording 2D context.
 *
 * @function fakeContext
 * @returns {FakeContext} Context.
 */
export function fakeContext(): FakeContext {
  const calls: Call[] = [];
  const ctx: FakeContext = {
    calls,
    fillStyle: '',
    pixel: new Uint8ClampedArray([0, 0, 0, 0]),
    font: '',
    textAlign: '',
    textBaseline: '',
    getImageData: () => ({ data: ctx.pixel }),
  };
  for (const name of METHODS)
    ctx[name] = (...args: unknown[]) => calls.push([name, ...args]);
  return ctx;
}

/**
 * A `Path2D` stand-in that records its commands.
 *
 * @class FakePath
 */
export class FakePath {
  readonly calls: Call[] = [];

  /**
   * Records a rectangle.
   *
   * @param {...number} args - x, y, w, h.
   * @returns {void}
   */
  rect(...args: number[]): void {
    this.calls.push(['rect', ...args]);
  }

  /**
   * Records a move.
   *
   * @param {...number} args - x, y.
   * @returns {void}
   */
  moveTo(...args: number[]): void {
    this.calls.push(['moveTo', ...args]);
  }

  /**
   * Records a line.
   *
   * @param {...number} args - x, y.
   * @returns {void}
   */
  lineTo(...args: number[]): void {
    this.calls.push(['lineTo', ...args]);
  }

  /**
   * Records a close.
   *
   * @returns {void}
   */
  closePath(): void {
    this.calls.push(['closePath']);
  }
}

/**
 * Gives every canvas a recording 2D context (and `webgl` the given value)
 * and installs `Path2D`. Restored by vitest's `restoreMocks`.
 *
 * @function stubCanvas
 * @param {unknown} [webgl] - What `getContext('webgl')` returns.
 * @returns {FakeContext[]} Contexts handed out, in order.
 */
export function stubCanvas(webgl: unknown = null): FakeContext[] {
  const made: FakeContext[] = [];
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((
    kind: string,
  ) => {
    if (kind !== '2d') return webgl;
    const ctx = fakeContext();
    made.push(ctx);
    return ctx;
  }) as unknown as HTMLCanvasElement['getContext']);
  vi.stubGlobal('Path2D', FakePath);
  return made;
}

/**
 * IntersectionObserver stand-in; tests report intersections by hand.
 *
 * @class FakeIntersectionObserver
 */
export class FakeIntersectionObserver {
  static readonly all: FakeIntersectionObserver[] = [];
  readonly targets = new Set<Element>();

  /**
   * @param {IntersectionObserverCallback} callback - Report callback.
   * @param {IntersectionObserverInit} [init] - Options.
   */
  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly init: IntersectionObserverInit = {},
  ) {
    FakeIntersectionObserver.all.push(this);
  }

  /**
   * Starts watching `el`.
   *
   * @param {Element} el - Target.
   * @returns {void}
   */
  observe(el: Element): void {
    this.targets.add(el);
  }

  /**
   * Stops watching `el`.
   *
   * @param {Element} el - Target.
   * @returns {void}
   */
  unobserve(el: Element): void {
    this.targets.delete(el);
  }

  /**
   * Stops watching everything.
   *
   * @returns {void}
   */
  disconnect(): void {
    this.targets.clear();
  }

  /**
   * Reports `el` inside or outside the margin.
   *
   * @param {Element} el - Target.
   * @param {boolean} inside - Intersecting.
   * @returns {void}
   */
  report(el: Element, inside: boolean): void {
    if (!this.targets.has(el)) return;
    const entry = { target: el, isIntersecting: inside };
    this.callback(
      [entry as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

/**
 * ResizeObserver stand-in; tests fire size reports by hand.
 *
 * @class FakeResizeObserver
 */
export class FakeResizeObserver {
  static readonly all: FakeResizeObserver[] = [];
  readonly targets = new Set<Element>();

  /**
   * @param {ResizeObserverCallback} callback - Report callback.
   */
  constructor(private readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.all.push(this);
  }

  /**
   * Starts watching `el`.
   *
   * @param {Element} el - Target.
   * @returns {void}
   */
  observe(el: Element): void {
    this.targets.add(el);
  }

  /**
   * Stops watching `el`.
   *
   * @param {Element} el - Target.
   * @returns {void}
   */
  unobserve(el: Element): void {
    this.targets.delete(el);
  }

  /**
   * Stops watching everything.
   *
   * @returns {void}
   */
  disconnect(): void {
    this.targets.clear();
  }

  /**
   * Reports every watched element.
   *
   * @returns {void}
   */
  fire(): void {
    const entries = [...this.targets].map((target) => ({ target }));
    this.callback(
      entries as unknown as ResizeObserverEntry[],
      this as unknown as ResizeObserver,
    );
  }
}

/**
 * Reports `el` to every fake observer watching it.
 *
 * @function reportAll
 * @param {Element} el - Target.
 * @param {boolean} inside - Intersecting.
 * @returns {void}
 */
export function reportAll(el: Element, inside: boolean): void {
  for (const io of FakeIntersectionObserver.all) io.report(el, inside);
}

/**
 * Installs the observers and `matchMedia` the engine needs. `matches`
 * answers every media query.
 *
 * @function stubBrowser
 * @param {(query: string) => boolean} [matches] - Media query answers.
 * @returns {void}
 */
export function stubBrowser(
  matches: (query: string) => boolean = () => false,
): void {
  FakeIntersectionObserver.all.length = 0;
  FakeResizeObserver.all.length = 0;
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: matches(query),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
}

/**
 * Gives `el` a fixed bounding rect and offset size.
 *
 * @function placeAt
 * @param {Element} el - Element.
 * @param {number} left - Left, viewport px.
 * @param {number} top - Top, viewport px.
 * @param {number} width - Width.
 * @param {number} height - Height.
 * @returns {void}
 */
export function placeAt(
  el: Element,
  left: number,
  top: number,
  width: number,
  height: number,
): void {
  const rect = {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
  };
  el.getBoundingClientRect = () => ({ ...rect, toJSON: () => rect });
  Object.defineProperty(el, 'offsetWidth', {
    value: width,
    configurable: true,
  });
  Object.defineProperty(el, 'offsetHeight', {
    value: height,
    configurable: true,
  });
}
