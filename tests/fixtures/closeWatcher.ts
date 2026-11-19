/**
 * @fileoverview Stands in for the platform's `CloseWatcher`, which jsdom
 * lacks: remembers each watcher made so a test can send the close request
 * a back gesture would.
 *
 * @module tests/fixtures/closeWatcher
 * @version 1.0.0
 * @author Typeir
 * @since 0.2.0
 */

import { vi } from 'vitest';

/**
 * A stand-in watcher.
 *
 * @class FakeCloseWatcher
 */
export class FakeCloseWatcher {
  static made: FakeCloseWatcher[] = [];
  readonly listeners: (() => void)[] = [];
  destroyed = false;

  /**
   * Remembers the new watcher.
   */
  constructor() {
    FakeCloseWatcher.made.push(this);
  }

  /**
   * Hears the close request.
   *
   * @param {string} _type - Event type, always `close`.
   * @param {() => void} listener - Listener.
   */
  addEventListener(_type: string, listener: () => void): void {
    this.listeners.push(listener);
  }

  /**
   * Stops watching.
   */
  destroy(): void {
    this.destroyed = true;
  }

  /**
   * Sends the close request, as a back gesture would.
   */
  requestClose(): void {
    if (!this.destroyed) for (const listener of this.listeners) listener();
  }
}

/**
 * Puts the stand-in on the window and forgets earlier watchers.
 *
 * @function stubCloseWatcher
 * @returns {typeof FakeCloseWatcher} The stand-in class.
 */
export function stubCloseWatcher(): typeof FakeCloseWatcher {
  FakeCloseWatcher.made = [];
  vi.stubGlobal('CloseWatcher', FakeCloseWatcher);
  return FakeCloseWatcher;
}

/**
 * The live watcher made last, if any.
 *
 * @function liveWatcher
 * @returns {FakeCloseWatcher | undefined} Watcher.
 */
export function liveWatcher(): FakeCloseWatcher | undefined {
  return FakeCloseWatcher.made.findLast((watcher) => !watcher.destroyed);
}
