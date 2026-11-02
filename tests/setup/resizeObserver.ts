/**
 * @fileoverview Gives jsdom a no-op `ResizeObserver`. floating-ui watches
 * trigger and panel sizes through it; jsdom has no layout, so nothing to
 * report.
 *
 * @module tests/setup/resizeObserver
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

/**
 * Observer that never fires.
 *
 * @class InertResizeObserver
 */
class InertResizeObserver {
  /**
   * Starts watching nothing.
   *
   * @returns {void}
   */
  observe(): void {}

  /**
   * Stops watching nothing.
   *
   * @returns {void}
   */
  unobserve(): void {}

  /**
   * Drops every watch.
   *
   * @returns {void}
   */
  disconnect(): void {}
}

globalThis.ResizeObserver ??= InertResizeObserver;
