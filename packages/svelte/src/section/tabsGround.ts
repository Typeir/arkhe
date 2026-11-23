/**
 * @fileoverview The ground a tab set's panels leave for tab sets inside
 * them, passed down by context so folder tabs alternate as they nest.
 *
 * @module packages/svelte/src/section/tabsGround
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import { TABS_GROUND, type TabsGround } from '@arkhe/core';
import { getContext, setContext } from 'svelte';

/**
 * Context key of the ground, shared by every copy of Arkhé.
 *
 * @constant KEY
 * @type {symbol}
 */
const KEY = Symbol.for('arkhe.tabs-ground');

/**
 * Leaves `inner` as the ground for tab sets inside this one. Call during
 * component initialisation.
 *
 * @function provideTabsGround
 * @param {() => TabsGround} inner - Ground inside the panels.
 * @returns {void}
 */
export function provideTabsGround(inner: () => TabsGround): void {
  setContext(KEY, inner);
}

/**
 * Reads the ground the nearest enclosing tab set leaves; the page's with
 * none. Call during component initialisation.
 *
 * @function useTabsGround
 * @returns {() => TabsGround} Current ground.
 */
export function useTabsGround(): () => TabsGround {
  return getContext<(() => TabsGround) | undefined>(KEY) ?? (() => TABS_GROUND);
}
