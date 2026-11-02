/**
 * @fileoverview Default icon set: Lucide's glyph for every icon Arkhé's own
 * components draw. App art registered through `ArkheProvider` wins over it.
 *
 * @module packages/svelte/src/lucideIcons
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import type { ArkheIconName } from '@arkhe/core';
import Check from '@lucide/svelte/icons/check';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Inbox from '@lucide/svelte/icons/inbox';
import Info from '@lucide/svelte/icons/info';
import Loader from '@lucide/svelte/icons/loader';
import Minus from '@lucide/svelte/icons/minus';
import Pin from '@lucide/svelte/icons/pin';
import PinOff from '@lucide/svelte/icons/pin-off';
import Plus from '@lucide/svelte/icons/plus';
import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
import X from '@lucide/svelte/icons/x';
import type { IconComponent } from './context.js';

/**
 * Lucide glyphs by Lucide name, for Arkhé's own icons.
 *
 * @constant LUCIDE_ICONS
 * @type {Readonly<Record<ArkheIconName, IconComponent>>}
 */
export const LUCIDE_ICONS: Readonly<Record<ArkheIconName, IconComponent>> = {
  x: X,
  check: Check,
  plus: Plus,
  minus: Minus,
  'chevron-down': ChevronDown,
  loader: Loader,
  inbox: Inbox,
  'triangle-alert': TriangleAlert,
  info: Info,
  pin: Pin,
  'pin-off': PinOff,
};
