/**
 * @fileoverview The ground a tab set's panels leave for tab sets inside
 * them, passed down by context so folder tabs alternate as they nest.
 *
 * @module packages/react/src/section/tabsGround
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

'use client';

import { TABS_GROUND, type TabsGround } from '@arkhe/core';
import { createContext } from 'react';

/**
 * Ground the nearest enclosing tab set leaves; the page's with none.
 *
 * @constant TabsGroundContext
 * @type {import('react').Context<TabsGround>}
 */
export const TabsGroundContext = createContext<TabsGround>(TABS_GROUND);
